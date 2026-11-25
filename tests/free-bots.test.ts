import { describe, expect, it, vi } from 'vitest'
import { FreeBotId, FreeBotStrategy, FreeBotStrategyConfig } from '@/lib/bots/free-bot-strategy'
import { FreeBotRunnerOptions, getFreeBotRunner, GoldmineDerivConnection } from '@/lib/bots/goldmine-m1-runner'
import { DerivTick } from '@/lib/deriv-websocket'
import { FREE_BOTS_COLLECTION, getFreeBotByName, isCatalogFreeBotId } from '@/lib/free-bots'

function createStrategy(id: FreeBotId, overrides: Partial<FreeBotStrategyConfig> = {}) {
  return new FreeBotStrategy({
    id,
    symbol: '1HZ10V',
    initialStake: 0.5,
    durationTicks: 1,
    ...overrides,
  })
}

function tick(quote: number): DerivTick {
  return { ask: quote, bid: quote, epoch: 1, id: String(quote), pip_size: 0, quote, symbol: '1HZ10V' }
}

describe('Free Bot strategies', () => {
  it('uses one shared nine-bot catalog with exact-name lookup for deep links', () => {
    expect(FREE_BOTS_COLLECTION).toHaveLength(9)
    expect(getFreeBotByName('digit under 8 shield')?.id).toBe('fb-2')
    expect(getFreeBotByName('not a bot')).toBeUndefined()
    expect(isCatalogFreeBotId('fb-6')).toBe(true)
    expect(isCatalogFreeBotId('texas-even')).toBe(false)
  })

  it('triggers Over 1 only after a digit at or below one and applies its 1.2x recovery stake', () => {
    const bot = createStrategy('fb-1')

    expect(bot.onTick(2)).toBeNull()
    expect(bot.onTick(1)).toMatchObject({ contractType: 'DIGITOVER', barrier: 1, stake: 0.5 })
    bot.onContractSettled({ won: false, profit: -0.5 })
    expect(bot.getState().stake).toBe(0.6)
  })

  it('triggers Under 8 at digits eight and nine with the correct digit contract', () => {
    const bot = createStrategy('fb-2')

    expect(bot.onTick(7)).toBeNull()
    expect(bot.onTick(8)).toMatchObject({ contractType: 'DIGITUNDER', barrier: 8 })
  })

  it('waits for three matching parity digits and trades the opposite parity once per streak', () => {
    const bot = createStrategy('fb-3')

    expect(bot.onTick(1)).toBeNull()
    expect(bot.onTick(3)).toBeNull()
    expect(bot.onTick(5)).toMatchObject({ contractType: 'DIGITEVEN' })
    bot.onContractSettled({ won: true, profit: 0.2 })
    expect(bot.onTick(7)).toBeNull()
    expect(bot.onTick(9)).toBeNull()
    expect(bot.onTick(1)).toMatchObject({ contractType: 'DIGITEVEN' })
  })

  it('uses a five-quote positive linear slope for Volatility 75 and rearms after a non-positive slope', () => {
    const bot = createStrategy('fb-4')

    expect([100, 101, 102, 103].map((quote) => bot.onTick(1, tick(quote)))).toEqual([null, null, null, null])
    expect(bot.onTick(1, tick(104))).toMatchObject({ contractType: 'CALL', durationTicks: 1 })
    bot.onContractSettled({ won: true, profit: 0.5 })
    expect(bot.onTick(1, tick(105))).toBeNull()
    for (const quote of [90, 89, 88, 87, 86]) bot.onTick(1, tick(quote))
    for (const quote of [80, 81, 82, 83]) expect(bot.onTick(1, tick(quote))).toBeNull()
    expect(bot.onTick(1, tick(84))).toMatchObject({ contractType: 'CALL' })
  })

  it('fades five consecutive upward tick moves on Volatility 100', () => {
    const bot = createStrategy('fb-5')

    for (const quote of [100, 101, 102, 103, 104]) {
      expect(bot.onTick(1, tick(quote))).toBeNull()
    }
    expect(bot.onTick(1, tick(105))).toMatchObject({ contractType: 'PUT', durationTicks: 1 })
  })

  it('matches the unique most frequent digit in a ten-tick window and skips ties', () => {
    const bot = createStrategy('fb-6')
    for (const digit of [1, 2, 3, 4, 5, 6, 7, 8, 7, 2]) {
      expect(bot.onTick(digit)).toBeNull()
    }
    expect(bot.onTick(7)).toMatchObject({ contractType: 'DIGITMATCH', barrier: 7 })
  })

  it('stops at a configured loss limit and ignores later signals', () => {
    const bot = createStrategy('fb-1', { stopLoss: 0.5 })
    bot.onTick(1)

    expect(bot.onContractSettled({ won: false, profit: -0.5 }).stopped).toBe('STOP_LOSS')
    expect(bot.onTick(1)).toBeNull()
  })

  it('stops before the recovery stake exceeds the configured maximum', () => {
    const bot = createStrategy('fb-1', { maxStake: 0.5 })
    bot.onTick(1)

    expect(bot.onContractSettled({ won: false, profit: -0.5 }).stopped).toBe('MAX_STAKE')
    expect(bot.getState().stake).toBe(0.5)
  })
})

describe('Free Bot runner integration', () => {
  it('authorizes the chosen account, buys the strategy contract, and records settlement', async () => {
    let onTick: ((tick: DerivTick) => void) | undefined
    let onContract: ((contract: Record<string, any>) => void) | undefined
    const connection: GoldmineDerivConnection = {
      isConnected: true,
      isAuthorized: true,
      connect: vi.fn(async () => undefined),
      authorize: vi.fn(async () => ({ authorize: { loginid: 'VRTC-FREE-BOT', balance: 100 } })),
      proposal: vi.fn(async () => ({ proposal: { id: 'proposal-free-bot', ask_price: 0.5 } })),
      buy: vi.fn(async () => ({ buy: { contract_id: 501, balance_after: 99.5 } })),
      subscribeTicks: vi.fn((_symbol, callback) => {
        onTick = callback
        return vi.fn()
      }),
      subscribeContract: vi.fn((_id, callback) => {
        onContract = callback
        return vi.fn()
      }),
      on: vi.fn(() => vi.fn()),
    }
    const onSettlement = vi.fn()
    const options: FreeBotRunnerOptions = {
      token: 'demo-token',
      accountId: 'VRTC-FREE-BOT',
      currency: 'USD',
      config: { id: 'fb-1', symbol: '1HZ10V', initialStake: 0.5, durationTicks: 1 },
      connection,
      onSettlement,
    }
    const runner = getFreeBotRunner(options)
    await runner.start()
    onTick?.(tick(1))

    await vi.waitFor(() => expect(connection.buy).toHaveBeenCalledOnce())
    expect(connection.proposal).toHaveBeenCalledWith({
      amount: 0.5,
      basis: 'stake',
      contract_type: 'DIGITOVER',
      currency: 'USD',
      duration: 1,
      duration_unit: 't',
      symbol: '1HZ10V',
      barrier: '1',
    })

    onContract?.({ is_sold: 1, status: 'lost', payout: 0, profit: -0.5, balance_after: 99.5 })
    expect(onSettlement).toHaveBeenCalledWith(expect.objectContaining({ stake: 0.5, profit: -0.5, won: false }))
    expect(runner.getState()).toMatchObject({ stake: 0.6, losses: 1, contractOpen: false })
    runner.stop()
  })

  it('prevents starting a second bot while one is already active on the account', async () => {
    const connection: GoldmineDerivConnection = {
      isConnected: true,
      isAuthorized: true,
      connect: vi.fn(async () => undefined),
      authorize: vi.fn(async () => ({ authorize: { loginid: 'VRTC-FREE-BOT-CONFLICT', balance: 100 } })),
      proposal: vi.fn(),
      buy: vi.fn(),
      subscribeTicks: vi.fn(() => vi.fn()),
      subscribeContract: vi.fn(() => vi.fn()),
      on: vi.fn(() => vi.fn()),
    }
    const runner = getFreeBotRunner({
      token: 'demo-token',
      accountId: 'VRTC-FREE-BOT-CONFLICT',
      currency: 'USD',
      config: { id: 'fb-1', symbol: '1HZ10V', initialStake: 0.5, durationTicks: 1 },
      connection,
    })
    await runner.start()

    expect(() => getFreeBotRunner({
      token: 'demo-token',
      accountId: 'VRTC-FREE-BOT-CONFLICT',
      currency: 'USD',
      config: { id: 'fb-2', symbol: '1HZ25V', initialStake: 1, durationTicks: 1 },
      connection,
    })).toThrow(/active bot/i)
    runner.stop()
  })

  it('stops on incomplete settlement data instead of recording a fabricated loss', async () => {
    let emitTick: ((tick: DerivTick) => void) | undefined
    let emitContract: ((contract: Record<string, any>) => void) | undefined
    const connection: GoldmineDerivConnection = {
      isConnected: true,
      isAuthorized: true,
      connect: vi.fn(async () => undefined),
      authorize: vi.fn(async () => ({ authorize: { loginid: 'VRTC-FREE-BOT-INVALID', balance: 100 } })),
      proposal: vi.fn(async () => ({ proposal: { id: 'proposal-invalid', ask_price: 0.5 } })),
      buy: vi.fn(async () => ({ buy: { contract_id: 502 } })),
      subscribeTicks: vi.fn((_symbol, callback) => {
        emitTick = callback
        return vi.fn()
      }),
      subscribeContract: vi.fn((_id, callback) => {
        emitContract = callback
        return vi.fn()
      }),
    }
    const runner = getFreeBotRunner({
      token: 'demo-token',
      accountId: 'VRTC-FREE-BOT-INVALID',
      currency: 'USD',
      config: { id: 'fb-1', symbol: '1HZ10V', initialStake: 0.5, durationTicks: 1 },
      connection,
    })
    const onError = vi.fn()
    const onSettlement = vi.fn()
    runner.subscribe({ onError, onSettlement })

    await runner.start()
    emitTick?.(tick(1))
    await vi.waitFor(() => expect(connection.buy).toHaveBeenCalledOnce())
    emitContract?.({ is_sold: 1, status: 'lost' })

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('invalid settlement') }))
    expect(onSettlement).not.toHaveBeenCalled()
    expect(runner.getState()).toMatchObject({ losses: 0, contractOpen: false })
  })
})
