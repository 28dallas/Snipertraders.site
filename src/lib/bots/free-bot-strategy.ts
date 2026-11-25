import { BuyDecision } from '@/lib/bots/goldmine-m1'
import { DerivTick } from '@/lib/deriv-websocket'

const FREE_BOT_IDS = ['fb-1', 'fb-2', 'fb-3', 'fb-4', 'fb-5', 'fb-6'] as const
export type FreeBotId = typeof FREE_BOT_IDS[number]

export interface FreeBotStrategyConfig {
  id: FreeBotId
  symbol: string
  initialStake: number
  durationTicks: number
  stopLoss?: number
  takeProfit?: number
  maxTrades?: number
  maxStake?: number
}

export interface FreeBotStrategyState {
  stake: number
  currentQuote: number | null
  totalProfit: number
  tradesPlaced: number
  wins: number
  losses: number
  contractOpen: boolean
  stopped: null | 'TAKE_PROFIT' | 'STOP_LOSS' | 'MAX_TRADES' | 'MAX_STAKE'
  lastPrediction: number | null
}

const DEFAULT_STOP_LOSS = 15
const DEFAULT_TAKE_PROFIT = 30
const DEFAULT_MAX_TRADES = 50
const DEFAULT_MAX_STAKE = 500
const MARTINGALE_BOT_ID: FreeBotId = 'fb-1'

function isFreeBotId(value: string): value is FreeBotId {
  return (FREE_BOT_IDS as readonly string[]).includes(value)
}

function roundToCents(value: number): number {
  return Number(value.toFixed(2))
}

function linearSlope(values: number[]): number {
  const meanX = (values.length - 1) / 2
  const meanY = values.reduce((sum, value) => sum + value, 0) / values.length
  let numerator = 0
  let denominator = 0

  values.forEach((value, index) => {
    numerator += (index - meanX) * (value - meanY)
    denominator += (index - meanX) ** 2
  })

  return denominator === 0 ? 0 : numerator / denominator
}

export class FreeBotStrategy {
  private readonly config: Required<FreeBotStrategyConfig>
  private state: FreeBotStrategyState
  private previousParity: 0 | 1 | null = null
  private parityStreak = 0
  private readonly quoteWindow: number[] = []
  private upwardMoves = 0
  private trendArmed = true
  private spikeArmed = true
  private readonly digitWindow: number[] = []

  constructor(config: FreeBotStrategyConfig) {
    if (!isFreeBotId(config.id)) throw new Error('Unsupported free bot strategy.')
    if (!Number.isFinite(config.initialStake) || config.initialStake <= 0) throw new Error('Bot stake must be greater than zero.')
    if (!Number.isInteger(config.durationTicks) || config.durationTicks < 1) throw new Error('Bot duration must be at least one tick.')
    const stopLoss = config.stopLoss ?? DEFAULT_STOP_LOSS
    const takeProfit = config.takeProfit ?? DEFAULT_TAKE_PROFIT
    const maxTrades = config.maxTrades ?? DEFAULT_MAX_TRADES
    const maxStake = config.maxStake ?? DEFAULT_MAX_STAKE
    if (![stopLoss, takeProfit, maxStake].every((value) => Number.isFinite(value) && value > 0)) {
      throw new Error('Bot risk limits must be greater than zero.')
    }
    if (!Number.isInteger(maxTrades) || maxTrades < 1) throw new Error('Bot trade limit must be at least one.')
    if (config.initialStake > maxStake) throw new Error('Initial stake exceeds the bot maximum stake.')

    this.config = { ...config, stopLoss, takeProfit, maxTrades, maxStake }
    this.state = {
      stake: roundToCents(config.initialStake),
      currentQuote: null,
      totalProfit: 0,
      tradesPlaced: 0,
      wins: 0,
      losses: 0,
      contractOpen: false,
      stopped: null,
      lastPrediction: null,
    }
  }

  onTick(lastDigit: number, tick?: DerivTick): BuyDecision | null {
    if (tick && Number.isFinite(tick.quote)) {
      this.state = { ...this.state, currentQuote: tick.quote }
    }
    if (this.state.stopped || !Number.isInteger(lastDigit) || lastDigit < 0 || lastDigit > 9) {
      return null
    }

    let contractType: string | null = null
    let barrier: number | undefined

    switch (this.config.id) {
      case 'fb-1':
        if (lastDigit <= 1) {
          contractType = 'DIGITOVER'
          barrier = 1
        }
        break
      case 'fb-2':
        if (lastDigit >= 8) {
          contractType = 'DIGITUNDER'
          barrier = 8
        }
        break
      case 'fb-3': {
        const parity = (lastDigit % 2) as 0 | 1
        this.parityStreak = parity === this.previousParity ? this.parityStreak + 1 : 1
        this.previousParity = parity
        if (this.parityStreak >= 3) {
          contractType = parity === 1 ? 'DIGITEVEN' : 'DIGITODD'
          this.parityStreak = 0
          this.previousParity = null
        }
        break
      }
      case 'fb-4': {
        if (!tick || !Number.isFinite(tick.quote)) break
        this.pushWindow(this.quoteWindow, tick.quote, 5)
        if (this.quoteWindow.length < 5) break
        const slope = linearSlope(this.quoteWindow)
        if (slope <= 0) this.trendArmed = true
        else if (this.trendArmed) {
          contractType = 'CALL'
          this.trendArmed = false
        }
        break
      }
      case 'fb-5': {
        if (!tick || !Number.isFinite(tick.quote)) break
        if (this.quoteWindow.length > 0 && tick.quote > this.quoteWindow[this.quoteWindow.length - 1]) {
          this.upwardMoves += 1
        } else {
          this.upwardMoves = 0
          this.spikeArmed = true
        }
        this.pushWindow(this.quoteWindow, tick.quote, 5)
        if (this.upwardMoves >= 5 && this.spikeArmed) {
          contractType = 'PUT'
          this.upwardMoves = 0
          this.spikeArmed = false
        }
        break
      }
      case 'fb-6': {
        this.pushWindow(this.digitWindow, lastDigit, 10)
        if (this.digitWindow.length < 10) break
        const counts = new Map<number, number>()
        this.digitWindow.forEach((digit) => counts.set(digit, (counts.get(digit) ?? 0) + 1))
        const highestCount = Math.max(...counts.values())
        const leaders = Array.from(counts.entries()).filter(([, count]) => count === highestCount)
        if (highestCount >= 2 && leaders.length === 1) {
          contractType = 'DIGITMATCH'
          barrier = leaders[0][0]
        }
        break
      }
    }

    if (!contractType || this.state.contractOpen) return null
    this.state = { ...this.state, contractOpen: true, lastPrediction: barrier ?? null }
    return {
      contractType,
      symbol: this.config.symbol,
      stake: this.state.stake,
      durationTicks: this.config.durationTicks,
      ...(barrier === undefined ? {} : { barrier }),
    }
  }

  onContractSettled(result: { won: boolean; profit: number }) {
    if (!this.state.contractOpen) return { stopped: this.state.stopped, state: this.getState() }
    if (!Number.isFinite(result.profit)) throw new Error('Deriv returned an invalid contract profit.')

    const totalProfit = roundToCents(this.state.totalProfit + result.profit)
    this.state = {
      ...this.state,
      totalProfit,
      tradesPlaced: this.state.tradesPlaced + 1,
      wins: this.state.wins + (result.won ? 1 : 0),
      losses: this.state.losses + (result.won ? 0 : 1),
      contractOpen: false,
    }

    if (totalProfit >= this.config.takeProfit) this.state.stopped = 'TAKE_PROFIT'
    else if (totalProfit <= -this.config.stopLoss) this.state.stopped = 'STOP_LOSS'
    else if (this.state.tradesPlaced >= this.config.maxTrades) this.state.stopped = 'MAX_TRADES'
    else if (this.config.id === MARTINGALE_BOT_ID) {
      const nextStake = result.won ? this.config.initialStake : roundToCents(this.state.stake * 1.2)
      if (nextStake > this.config.maxStake) this.state.stopped = 'MAX_STAKE'
      else this.state.stake = nextStake
    }

    return { stopped: this.state.stopped, state: this.getState() }
  }

  onBuyFailed(): void {
    this.state = { ...this.state, contractOpen: false }
  }

  onTradeRejected(): void {
    this.onBuyFailed()
  }

  getState(): FreeBotStrategyState {
    return { ...this.state }
  }

  private pushWindow<T>(window: T[], value: T, maxLength: number): void {
    window.push(value)
    if (window.length > maxLength) window.shift()
  }
}
