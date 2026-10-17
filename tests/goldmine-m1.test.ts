import { describe, expect, it, vi } from 'vitest'
import { GoldmineM1 } from '@/lib/bots/goldmine-m1'
import { getGoldmineM1Runner, getLastDigitFromQuote, GoldmineM1Runner, hasActiveGoldmineRunner, hasAnyOpenGoldmineContract, hasOpenGoldmineContract } from '@/lib/bots/goldmine-m1-runner'
import { DerivTick, DerivWebSocket } from '@/lib/deriv-websocket'
import { useTradingStore } from '@/stores/trading-store'

describe('GoldmineM1', () => {
  it('waits for the configured entry digit and permits only one open contract', () => {
    const bot = new GoldmineM1()

    expect(bot.onTick(2)).toBeNull()
    expect(bot.getState().mode).toBe('WAIT_ENTRY')
    expect(bot.onTick(1)).toEqual({
      contractType: 'DIGITOVER',
      symbol: '1HZ10V',
      stake: 4,
      barrier: 3,
      durationTicks: 1,
    })
    expect(bot.onTick(1)).toBeNull()
  })

  it('enters recovery after a loss and compounds the stake once per loss', () => {
    const bot = new GoldmineM1()
    bot.onTick(1)

    const outcome = bot.onContractSettled({ won: false, profit: -4 })

    expect(outcome.stopped).toBeNull()
    expect(bot.getState()).toMatchObject({
      stake: 6.8,
      prediction: 4,
      totalLost: 4,
      countLoss: 1,
      mode: 'RECOVERY',
      contractOpen: false,
    })
    expect(bot.onTick(8)).toMatchObject({ stake: 6.8, barrier: 4 })
  })

  it('keeps the recovery stake after a partial-recovery win', () => {
    const bot = new GoldmineM1()
    bot.onTick(1)
    bot.onContractSettled({ won: false, profit: -4 })
    bot.onTick(5)

    bot.onContractSettled({ won: true, profit: 2 })

    expect(bot.getState()).toMatchObject({
      stake: 6.8,
      prediction: 4,
      totalLost: 2,
      countLoss: 2,
      mode: 'RECOVERY',
    })
  })

  it('resets stake and prediction after recovering all accumulated losses', () => {
    const bot = new GoldmineM1()
    bot.onTick(1)
    bot.onContractSettled({ won: false, profit: -4 })
    bot.onTick(7)

    bot.onContractSettled({ won: true, profit: 5 })

    expect(bot.getState()).toMatchObject({
      stake: 4,
      prediction: 3,
      totalLost: 0,
      countLoss: 0,
      mode: 'IMMEDIATE',
    })
  })

  it('stops only when profit is greater than take profit', () => {
    const bot = new GoldmineM1({ requireEntryDigitOnFirstTrade: false, takeProfit: 1 })
    bot.onTick(7)

    const atTarget = bot.onContractSettled({ won: true, profit: 1 })
    expect(atTarget.stopped).toBeNull()

    bot.onTick(7)
    const aboveTarget = bot.onContractSettled({ won: true, profit: 0.01 })

    expect(aboveTarget.stopped).toBe('TAKE_PROFIT')
    expect(bot.onTick(1)).toBeNull()
  })

  it('stops when profit reaches the stop-loss boundary', () => {
    const bot = new GoldmineM1({ requireEntryDigitOnFirstTrade: false, stopLoss: 5 })
    bot.onTick(7)

    const outcome = bot.onContractSettled({ won: false, profit: -5 })

    expect(outcome.stopped).toBe('STOP_LOSS')
    expect(bot.onTick(1)).toBeNull()
  })

  it('allows immediate entry when the first-trade digit gate is disabled', () => {
    const bot = new GoldmineM1({ requireEntryDigitOnFirstTrade: false })

    expect(bot.onTick(9)).toMatchObject({ stake: 4, barrier: 3 })
  })

  it('reads the final formatted quote digit without dropping trailing zeros', () => {
    expect(getLastDigitFromQuote(12.3, 2)).toBe(0)
    expect(getLastDigitFromQuote(12.34, 2)).toBe(4)
  })

  it('authorizes the selected account and feeds real contract settlement back into the strategy', async () => {
    const handlers: {
      tick?: (tick: DerivTick) => void
      contract?: (contract: Record<string, any>) => void
      close?: () => void
    } = {}
    let subscriptionAttempt = 0
    const onLog = vi.fn()
    const onError = vi.fn()
    const connection = {
      isConnected: true,
      isAuthorized: true,
      connect: vi.fn(async () => undefined),
      authorize: vi.fn(async () => ({ authorize: { loginid: 'VRTC12345' } })),
      proposal: vi.fn(async () => ({ proposal: { id: 'proposal-1', ask_price: 4 } })),
      buy: vi.fn(async () => ({ buy: { contract_id: 123 } })),
      subscribeTicks: vi.fn((_symbol: string, callback: (tick: DerivTick) => void) => {
        handlers.tick = callback
        return vi.fn()
      }),
      subscribeContract: vi.fn((_id: number, callback: (contract: Record<string, any>) => void, onError?: (error: Error) => void) => {
        subscriptionAttempt++
        if (subscriptionAttempt === 1) {
          queueMicrotask(() => onError?.(new Error('temporary subscription failure')))
        } else {
          handlers.contract = callback
        }
        return vi.fn()
      }),
      on: vi.fn((_event: string, callback: () => void) => {
        handlers.close = callback
        return vi.fn()
      }),
    }
    const onSettlement = vi.fn()
    useTradingStore.getState().setAccount({ loginid: 'VRTC12345', token: 'demo-token', isConnected: true })
    const runner = getGoldmineM1Runner({ token: 'demo-token', accountId: 'VRTC12345', currency: 'USD', connection, onSettlement })
    const detachPage = runner.subscribe({ onLog, onError })

    await runner.start()
    expect(hasActiveGoldmineRunner()).toBe(true)
    useTradingStore.getState().logout()
    expect(useTradingStore.getState().error).toContain('Stop Advanced Goldmine M1')
    expect(connection.authorize).toHaveBeenCalledWith('demo-token')
    handlers.tick?.({ ask: 0, bid: 0, epoch: 1, id: 'tick-1', pip_size: 2, quote: 1.01, symbol: '1HZ10V' })
    await vi.waitFor(() => expect(connection.buy).toHaveBeenCalledOnce())

    expect(connection.proposal).toHaveBeenCalledWith({
      amount: 4,
      basis: 'stake',
      contract_type: 'DIGITOVER',
      currency: 'USD',
      duration: 1,
      duration_unit: 't',
      symbol: '1HZ10V',
      barrier: '3',
    })
    expect(() => getGoldmineM1Runner({ token: 'other-token', accountId: 'VRTC99999', currency: 'USD' }))
      .toThrow('previous account to settle')
    expect(hasOpenGoldmineContract('VRTC99999')).toBe(true)
    expect(hasAnyOpenGoldmineContract()).toBe(true)
    const previousLoginId = useTradingStore.getState().loginid
    useTradingStore.getState().setAccount({ loginid: 'VRTC99999' })
    expect(useTradingStore.getState().loginid).toBe(previousLoginId)
    useTradingStore.getState().setAccount({ loginid: null })
    expect(useTradingStore.getState().loginid).toBe(previousLoginId)
    await vi.waitFor(() => expect(onLog).toHaveBeenCalledWith(expect.stringContaining('Restart to retry monitoring.'), 'warning'))
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'temporary subscription failure' }))
    expect(runner.getState().contractOpen).toBe(true)

    await runner.start()
    expect(connection.subscribeContract).toHaveBeenCalledTimes(2)
    handlers.close?.()
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('connection closed') }))
    await runner.start()
    expect(connection.subscribeContract).toHaveBeenCalledTimes(3)
    runner.stop()
    detachPage()
    handlers.contract?.({ is_sold: 1, payout: 7.6, profit: 3.6, status: 'won' })
    expect(onSettlement).toHaveBeenCalledWith(expect.objectContaining({ won: true, profit: 3.6 }))
    expect(runner.getState().totalProfit).toBe(3.6)
    expect(hasOpenGoldmineContract('VRTC99999')).toBe(false)
    expect(hasAnyOpenGoldmineContract()).toBe(false)
    runner.stop()
    expect(hasActiveGoldmineRunner()).toBe(false)
    useTradingStore.getState().setAccount({ loginid: null, token: null, isConnected: false })
  })

  it('rejects authorization when Deriv confirms a different account', async () => {
    const connection = {
      isConnected: true,
      isAuthorized: true,
      connect: vi.fn(async () => undefined),
      authorize: vi.fn(async () => ({ authorize: { loginid: 'VRTC11111' } })),
      proposal: vi.fn(),
      buy: vi.fn(),
      subscribeTicks: vi.fn(() => vi.fn()),
      subscribeContract: vi.fn(() => vi.fn()),
    }
    const runner = new GoldmineM1Runner({
      token: 'shared-oauth-token',
      accountId: 'VRTC22222',
      currency: 'USD',
      connection,
    })

    await expect(runner.start()).rejects.toThrow('different account')
    expect(connection.subscribeTicks).not.toHaveBeenCalled()
  })

  it('reuses the same strategy runner when the launch page remounts', () => {
    const options = { token: 'goldmine-registry-token', accountId: 'VRTC-GOLDMINE-REGISTRY', currency: 'USD' }

    const firstRunner = getGoldmineM1Runner(options)
    const remountedRunner = getGoldmineM1Runner(options)

    expect(remountedRunner).toBe(firstRunner)
  })

  it('records the actual Deriv profit for a partially recovered loss', () => {
    const store = useTradingStore.getState()
    const previousPnl = store.sessionPnl

    store.recordTradeResult(10, 8, false, -2)

    expect(useTradingStore.getState().sessionPnl).toBe(Number((previousPnl - 2).toFixed(2)))
    useTradingStore.getState().resetSessionStats()
  })

  it('forgets a contract subscription that resolves after its listener unsubscribes', async () => {
    class MockWebSocket {
      static OPEN = 1
      readyState = 0
      onopen: ((event: Event) => void) | null = null
      onmessage: ((event: MessageEvent) => void) | null = null
      onclose: ((event: CloseEvent) => void) | null = null
      onerror: ((event: Event) => void) | null = null
      sent: string[] = []

      constructor() {
        queueMicrotask(() => {
          this.readyState = MockWebSocket.OPEN
          this.onopen?.({} as Event)
        })
      }

      send(message: string) {
        this.sent.push(message)
      }

      close() {
        this.readyState = 3
        this.onclose?.({} as CloseEvent)
      }
    }

    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
    const client = new DerivWebSocket()
    const unsubscribe = client.subscribeContract(456, vi.fn())
    await vi.waitFor(() => expect(client['socket']).not.toBeNull())
    const socket = client['socket'] as unknown as MockWebSocket
    await vi.waitFor(() => expect(socket.sent).toHaveLength(1))
    const request = JSON.parse(socket.sent[0]) as { req_id: number }
    unsubscribe()

    socket.onmessage?.({
      data: JSON.stringify({
        req_id: request.req_id,
        subscription: { id: 'contract-sub-1' },
        proposal_open_contract: { contract_id: 456 },
      }),
    } as MessageEvent)

    await vi.waitFor(() => expect(socket.sent).toHaveLength(2))
    expect(JSON.parse(socket.sent[1])).toMatchObject({ forget: 'contract-sub-1' })
    client.disconnect()
    vi.unstubAllGlobals()
  })
})