import { describe, expect, it } from 'vitest'
import { calculateWorstCaseExposure, TexasEven } from '@/lib/bots/texas-even'

describe('TexasEven', () => {
  it('requires an integer entry digit from zero through nine', () => {
    expect(() => new TexasEven({ entryDigit: undefined as unknown as number })).toThrow(/entry digit/i)
    for (const entryDigit of [-1, 1.5, 10]) {
      expect(() => new TexasEven({ entryDigit })).toThrow(/entry digit/i)
    }
  })

  it('arms and places on the entry tick, then buys ten times before returning to idle', () => {
    const bot = new TexasEven({ entryDigit: 4 })

    expect(bot.onTick(1)).toBeNull()
    expect(bot.onTick(2)).toBeNull()
    expect(bot.onTick(3)).toBeNull()
    expect(bot.onTick(4)).toMatchObject({ contractType: 'DIGITEVEN', symbol: '1HZ10V', durationTicks: 1, stake: 4 })
    expect(bot.getState().burstRemaining).toBe(9)

    for (let trade = 1; trade < 10; trade += 1) {
      bot.onContractSettled({ won: true, profit: 1 })
      expect(bot.onTick(7)).not.toBeNull()
    }
    bot.onContractSettled({ won: true, profit: 1 })

    expect(bot.getState().burstRemaining).toBe(0)
    expect(bot.onTick(3)).toBeNull()
    expect(bot.onTick(4)).not.toBeNull()
  })

  it('ignores ticks while waiting for settlement and refunds a failed buy to the burst', () => {
    const bot = new TexasEven({ entryDigit: 4 })

    bot.onTick(4)
    expect(bot.getState()).toMatchObject({ burstRemaining: 9, awaitingSettle: true })
    expect(bot.onTick(6)).toBeNull()

    bot.onBuyFailed()
    expect(bot.getState()).toMatchObject({ burstRemaining: 10, awaitingSettle: false, tradesPlaced: 0 })
    expect(bot.onTick(6)).not.toBeNull()
    expect(bot.getState()).toMatchObject({ burstRemaining: 9, awaitingSettle: true, tradesPlaced: 1 })
  })

  it('compounds the stake and stops at the stop-loss before updating the stopping stake', () => {
    const bot = new TexasEven({ entryDigit: 4 })
    const stakes: number[] = []

    for (let trade = 0; trade < 4; trade += 1) {
      const decision = bot.onTick(trade === 0 ? 4 : 8)
      stakes.push(decision!.stake)
      bot.onContractSettled({ won: false, profit: -decision!.stake })
    }

    expect(stakes).toEqual([4, 8, 16, 32])
    expect(bot.getState()).toMatchObject({ totalProfit: -60, stopped: 'STOP_LOSS', stake: 32, losses: 4 })
    expect(bot.onTick(4)).toBeNull()
  })

  it('resets the stake to the initial amount after a win', () => {
    const bot = new TexasEven({ entryDigit: 4 })

    bot.onTick(4)
    bot.onContractSettled({ won: false, profit: -4 })
    bot.onTick(1)
    bot.onContractSettled({ won: true, profit: 7.2 })

    expect(bot.getState().stake).toBe(4)
    expect(bot.getState().wins).toBe(1)
  })

  it('checks take profit before stop loss and does not update stake when stopping', () => {
    const bot = new TexasEven({ entryDigit: 4, takeProfit: 20, stopLoss: 10 })

    bot.onTick(4)
    bot.onContractSettled({ won: false, profit: -4 })
    bot.onTick(7)
    const outcome = bot.onContractSettled({ won: true, profit: 24 })

    expect(outcome.stopped).toBe('TAKE_PROFIT')
    expect(outcome.state).toMatchObject({ totalProfit: 20, stake: 8, stopped: 'TAKE_PROFIT' })
  })

  it('carries the recovery stake into the next burst when a burst ends on a loss', () => {
    const bot = new TexasEven({ entryDigit: 4 })

    for (let trade = 0; trade < 9; trade += 1) {
      bot.onTick(trade === 0 ? 4 : 8)
      bot.onContractSettled({ won: true, profit: 1 })
    }
    bot.onTick(8)
    bot.onContractSettled({ won: false, profit: -4 })

    expect(bot.getState()).toMatchObject({ burstRemaining: 0, stake: 8 })
    expect(bot.onTick(4)).toMatchObject({ stake: 8 })
  })

  it('uses the configured side even when the entry digit is odd', () => {
    const bot = new TexasEven({ entryDigit: 7, side: 'EVEN' })

    expect(bot.onTick(7)?.contractType).toBe('DIGITEVEN')
  })

  it('clamps stakes to the configured minimum and maximum', () => {
    const minimumBot = new TexasEven({ entryDigit: 4, initialStake: 0.1, minStake: 0.35 })
    expect(minimumBot.getState().stake).toBe(0.35)
    minimumBot.onTick(4)
    minimumBot.onContractSettled({ won: false, profit: -0.35 })
    expect(minimumBot.getState().stake).toBe(0.7)

    const maximumBot = new TexasEven({ entryDigit: 4, martingale: 200, maxStake: 500 })
    maximumBot.onTick(4)
    maximumBot.onContractSettled({ won: false, profit: -4 })
    expect(maximumBot.getState().stake).toBe(500)
  })

  it('calculates worst-case exposure through the loss that crosses the stop-loss threshold', () => {
    expect(calculateWorstCaseExposure({ initialStake: 4, martingale: 2, stopLoss: 50 })).toBe(60)
    expect(calculateWorstCaseExposure({ initialStake: 2, martingale: 3, stopLoss: 8 })).toBe(8)
    expect(calculateWorstCaseExposure({ initialStake: 4, martingale: 2, stopLoss: 10_000_000 })).toBe(10_000_008)
    expect(calculateWorstCaseExposure({ initialStake: 15.53, martingale: 1, stopLoss: 279.54 })).toBe(279.54)
  })
})
