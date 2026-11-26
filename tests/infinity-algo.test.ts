import { describe, expect, it } from 'vitest'
import { InfinityAlgo } from '@/lib/bots/infinity-algo'
import { DerivTick } from '@/lib/deriv-websocket'

describe('InfinityAlgo', () => {
  it('rejects invalid configuration and ignores out-of-range tick digits', () => {
    expect(() => new InfinityAlgo({ entryDigit: 10 })).toThrow(/entry digit/i)

    const bot = new InfinityAlgo()
    expect(bot.onTick(10)).toBeNull()
    expect(bot.onTick(-1)).toBeNull()
  })

  it('waits for the configured entry digit before the first trade and then trades immediately on that tick', () => {
    const bot = new InfinityAlgo()
    const makeTick = (quote: number): DerivTick => ({
      ask: quote,
      bid: quote,
      epoch: 1,
      id: String(quote),
      pip_size: 1,
      quote,
      symbol: 'R_10',
    })

    expect(bot.onTick(7, makeTick(123.7))).toBeNull()
    expect(bot.getState()).toMatchObject({ currentQuote: 123.7, lastDigit: 7, entrySignal: false })
    expect(bot.onTick(4, makeTick(123.4))).toMatchObject({
      contractType: 'DIGITOVER',
      symbol: 'R_10',
      stake: 0.5,
      barrier: 1,
      durationTicks: 1,
    })
    expect(bot.getState()).toMatchObject({ entrySignal: true, currentQuote: 123.4, lastDigit: 4 })
  })

  it('increments wins and stops after the configured session limit is reached', () => {
    const bot = new InfinityAlgo({ requireEntryDigit: false, maxWins: 2 })

    bot.onTick(3)
    bot.onContractSettled({ won: true, profit: 0.5 })
    bot.onTick(3)
    bot.onContractSettled({ won: true, profit: 0.5 })

    expect(bot.getState().runCount).toBe(2)
    expect(bot.getState().stopped).toBe('SESSION_COMPLETE')
    expect(bot.onTick(9)).toBeNull()
  })

  it('keeps the session open after losses until it hits stop-loss, then clamps stake and resets on recovery wins', () => {
    const bot = new InfinityAlgo({ requireEntryDigit: false, initialStake: 1, stopLoss: 2, martingale: 2 })

    bot.onTick(3)
    bot.onContractSettled({ won: false, profit: -1 })
    expect(bot.getState().stake).toBe(2)
    expect(bot.getState().prediction).toBe(4)

    bot.onTick(3)
    bot.onContractSettled({ won: true, profit: 1.2 })
    expect(bot.getState().stake).toBe(1)
    expect(bot.getState().prediction).toBe(1)
    expect(bot.getState().runCount).toBe(1)

    bot.onTick(3)
    bot.onContractSettled({ won: false, profit: -1 })
    bot.onTick(3)
    bot.onContractSettled({ won: false, profit: -1 })
    expect(bot.getState().stopped).toBe('STOP_LOSS')
    expect(bot.onTick(9)).toBeNull()
  })

  it('clamps oversized martingale stakes and retains the overshoot stop-loss status in the state', () => {
    const bot = new InfinityAlgo({ requireEntryDigit: false, initialStake: 5, martingale: 2, stopLoss: 10, minStake: 0.35, maxStake: 7 })

    bot.onTick(3)
    bot.onContractSettled({ won: false, profit: -5 })
    expect(bot.getState().stake).toBe(7)

    bot.onTick(3)
    bot.onContractSettled({ won: false, profit: -7 })
    expect(bot.getState().stopped).toBe('STOP_LOSS')
    expect(bot.getState().totalProfit).toBe(-12)
  })
})
