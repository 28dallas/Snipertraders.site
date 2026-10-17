import { describe, expect, it, vi } from 'vitest'
import { DerivTick } from '@/lib/deriv-websocket'
import { beginDerivAccountTransition, getTexasEvenRunner } from '@/lib/bots/goldmine-m1-runner'

type TickHandler = (tick: DerivTick) => void

function createConnection(balance = 100, loginid = 'VRTC-TEXAS') {
  let tickHandler: TickHandler | undefined
  let balanceHandler: ((update: Record<string, unknown>) => void) | undefined
  let contractHandler: ((contract: Record<string, unknown>) => void) | undefined
  const connection = {
    isConnected: true,
    isAuthorized: true,
    connect: vi.fn(async () => undefined),
    authorize: vi.fn(async () => ({ authorize: { loginid, balance } })),
    proposal: vi.fn(async () => ({ proposal: { id: 'proposal-1', ask_price: 4 } })),
    buy: vi.fn(async () => ({ buy: { contract_id: 456, balance_after: balance - 4 } })),
    subscribeTicks: vi.fn((_symbol: string, callback: TickHandler) => {
      tickHandler = callback
      return vi.fn()
    }),
    subscribeBalance: vi.fn((callback: (update: Record<string, unknown>) => void) => {
      balanceHandler = callback
      return vi.fn()
    }),
    subscribeContract: vi.fn((_contractId: number, callback: (contract: Record<string, unknown>) => void) => {
      contractHandler = callback
      return vi.fn()
    }),
  }
  return {
    connection,
    emitTick: (quote = 12.34) => tickHandler?.({ ask: quote, bid: quote, epoch: 1, id: 'tick', pip_size: 2, quote, symbol: '1HZ10V' }),
    emitBalance: (updatedBalance: number) => balanceHandler?.({ balance: updatedBalance }),
    settle: (contract: Record<string, unknown>) => contractHandler?.(contract),
  }
}

describe('TexasEvenRunner', () => {
  it('omits the barrier, serializes contracts, and feeds settlement into the strategy', async () => {
    const mock = createConnection()
    const runner = getTexasEvenRunner({
      token: 'demo-token',
      accountId: 'VRTC-TEXAS',
      currency: 'USD',
      config: { entryDigit: 4, runsPerBurst: 2 },
      connection: mock.connection,
    })
    await runner.start()

    mock.emitTick(12.33)
    expect(mock.connection.proposal).not.toHaveBeenCalled()
    mock.emitTick(12.44)
    await vi.waitFor(() => expect(mock.connection.buy).toHaveBeenCalledOnce())
    expect(mock.connection.proposal).toHaveBeenCalledWith({
      amount: 4,
      basis: 'stake',
      contract_type: 'DIGITEVEN',
      currency: 'USD',
      duration: 1,
      duration_unit: 't',
      symbol: '1HZ10V',
    })

    mock.emitTick(12.24)
    expect(mock.connection.proposal).toHaveBeenCalledOnce()
    mock.settle({ contract_id: 456, is_sold: 1, status: 'won', payout: 7.6, profit: 3.6, balance_after: 103.6 })
    expect(runner.getState()).toMatchObject({ totalProfit: 3.6, wins: 1, awaitingSettle: false })
    runner.stop()
  })

  it('stops before proposing when the next stake exceeds the authorized balance', async () => {
    const mock = createConnection(100, 'VRTC-TEXAS-LOW-BALANCE')
    const onError = vi.fn()
    const runner = getTexasEvenRunner({
      token: 'demo-token',
      accountId: 'VRTC-TEXAS-LOW-BALANCE',
      currency: 'USD',
      config: { entryDigit: 4 },
      connection: mock.connection,
      onError,
    })
    await runner.start()
    mock.emitBalance(3)
    mock.emitTick(12.34)

    expect(mock.connection.proposal).not.toHaveBeenCalled()
    expect(runner.isActive).toBe(false)
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/stake.*balance/i) }))
  })

  it('retries on later ticks and stops after five consecutive proposal errors', async () => {
    const mock = createConnection(100, 'VRTC-TEXAS-ERRORS')
    mock.connection.proposal.mockRejectedValue(new Error('proposal unavailable'))
    const onError = vi.fn()
    const runner = getTexasEvenRunner({
      token: 'demo-token',
      accountId: 'VRTC-TEXAS-ERRORS',
      currency: 'USD',
      config: { entryDigit: 4 },
      connection: mock.connection,
      onError,
    })
    await runner.start()

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      mock.emitTick(attempt === 1 ? 12.34 : 12.31)
      await vi.waitFor(() => expect(mock.connection.proposal).toHaveBeenCalledTimes(attempt))
      await vi.waitFor(() => expect(runner.getState().awaitingSettle).toBe(false))
    }

    expect(runner.isActive).toBe(false)
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/5 consecutive/i) }))
    expect(runner.getState()).toMatchObject({ awaitingSettle: false, burstRemaining: 10, tradesPlaced: 0 })
  })

  it('blocks runner creation during an account transition and permits it after release', () => {
    const release = beginDerivAccountTransition()
    const options = {
      token: 'demo-token',
      accountId: 'VRTC-TEXAS-TRANSITION',
      currency: 'USD',
      config: { entryDigit: 4 },
    }

    expect(() => getTexasEvenRunner(options)).toThrow(/account change to finish/i)
    release()
    const runner = getTexasEvenRunner(options)
    expect(runner).toBeDefined()
    runner.dispose()
  })
})
