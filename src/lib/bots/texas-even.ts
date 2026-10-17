import { BuyDecision } from '@/lib/bots/goldmine-m1'

export type TexasEvenSide = 'EVEN' | 'ODD'

export interface TexasEvenConfig {
  entryDigit: number
  symbol: string
  side: TexasEvenSide
  durationTicks: number
  initialStake: number
  martingale: number
  runsPerBurst: number
  takeProfit: number
  stopLoss: number
  minStake: number
  maxStake: number
}

export interface TexasEvenState {
  stake: number
  burstRemaining: number
  totalProfit: number
  awaitingSettle: boolean
  stopped: null | 'TAKE_PROFIT' | 'STOP_LOSS'
  tradesPlaced: number
  wins: number
  losses: number
}

export interface SettleOutcome {
  stopped: TexasEvenState['stopped']
  state: TexasEvenState
}

const DEFAULT_CONFIG: Omit<TexasEvenConfig, 'entryDigit'> = {
  symbol: '1HZ10V',
  side: 'EVEN',
  durationTicks: 1,
  initialStake: 4,
  martingale: 2,
  runsPerBurst: 10,
  takeProfit: 20,
  stopLoss: 50,
  minStake: 0.35,
  maxStake: 500,
}

function roundToCents(value: number): number {
  return Number(value.toFixed(2))
}

function clampStake(stake: number, config: TexasEvenConfig): number {
  return roundToCents(Math.min(config.maxStake, Math.max(config.minStake, stake)))
}

export function calculateWorstCaseExposure(
  config: Pick<TexasEvenConfig, 'initialStake' | 'martingale' | 'stopLoss'> &
    Partial<Pick<TexasEvenConfig, 'minStake' | 'maxStake'>>
): number {
  const minStake = config.minStake ?? DEFAULT_CONFIG.minStake
  const maxStake = config.maxStake ?? DEFAULT_CONFIG.maxStake
  let stakeCents = Math.round(roundToCents(Math.min(maxStake, Math.max(minStake, config.initialStake))) * 100)
  let exposureCents = 0
  const stopLossCents = Math.round(Number(config.stopLoss.toFixed(2)) * 100)

  while (exposureCents < stopLossCents) {
    const stake = stakeCents / 100
    const nextStakeCents = Math.round(roundToCents(Math.min(maxStake, Math.max(minStake, stake * config.martingale))) * 100)
    exposureCents += stakeCents
    if (exposureCents >= stopLossCents) return exposureCents / 100
    if (nextStakeCents === stakeCents) {
      const repeatedLosses = Math.ceil((stopLossCents - exposureCents) / stakeCents)
      return (exposureCents + repeatedLosses * stakeCents) / 100
    }
    stakeCents = nextStakeCents
  }
  return exposureCents / 100
}

export class TexasEven {
  private readonly config: TexasEvenConfig
  private state: TexasEvenState

  constructor(config: Partial<TexasEvenConfig> & { entryDigit: number }) {
    if (!Number.isInteger(config?.entryDigit) || config.entryDigit < 0 || config.entryDigit > 9) {
      throw new Error('Texas Even Bot requires an entry digit from 0 through 9.')
    }

    this.config = { ...DEFAULT_CONFIG, ...config }
    this.state = {
      stake: clampStake(this.config.initialStake, this.config),
      burstRemaining: 0,
      totalProfit: 0,
      awaitingSettle: false,
      stopped: null,
      tradesPlaced: 0,
      wins: 0,
      losses: 0,
    }
  }

  onTick(lastDigit: number): BuyDecision | null {
    if (this.state.stopped || this.state.awaitingSettle || !Number.isInteger(lastDigit) || lastDigit < 0 || lastDigit > 9) {
      return null
    }

    const armedBurst = this.state.burstRemaining === 0 && lastDigit === this.config.entryDigit
      ? this.config.runsPerBurst
      : this.state.burstRemaining
    if (armedBurst === 0) return null

    this.state = {
      ...this.state,
      burstRemaining: armedBurst - 1,
      awaitingSettle: true,
      tradesPlaced: this.state.tradesPlaced + 1,
    }

    return {
      contractType: this.config.side === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD',
      symbol: this.config.symbol,
      stake: this.state.stake,
      durationTicks: this.config.durationTicks,
    }
  }

  onBuyFailed(): void {
    if (!this.state.awaitingSettle) return
    this.state = {
      ...this.state,
      burstRemaining: this.state.burstRemaining + 1,
      awaitingSettle: false,
      tradesPlaced: Math.max(0, this.state.tradesPlaced - 1),
    }
  }

  onContractSettled(result: { won: boolean; profit: number }): SettleOutcome {
    if (!this.state.awaitingSettle) return this.createSettleOutcome()

    this.state = {
      ...this.state,
      awaitingSettle: false,
      totalProfit: roundToCents(this.state.totalProfit + result.profit),
      wins: this.state.wins + (result.won ? 1 : 0),
      losses: this.state.losses + (result.won ? 0 : 1),
    }

    if (this.state.totalProfit >= this.config.takeProfit) {
      this.state = { ...this.state, stopped: 'TAKE_PROFIT' }
      return this.createSettleOutcome()
    }
    if (this.state.totalProfit <= -this.config.stopLoss) {
      this.state = { ...this.state, stopped: 'STOP_LOSS' }
      return this.createSettleOutcome()
    }

    this.state = {
      ...this.state,
      stake: clampStake(result.won ? this.config.initialStake : this.state.stake * this.config.martingale, this.config),
    }
    return this.createSettleOutcome()
  }

  getState(): TexasEvenState {
    return { ...this.state }
  }

  private createSettleOutcome(): SettleOutcome {
    return { stopped: this.state.stopped, state: this.getState() }
  }
}