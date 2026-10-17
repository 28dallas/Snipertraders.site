import { BuyDecision } from '@/lib/bots/goldmine-m1'

export interface InfinityAlgoConfig {
  symbol: string
  contractType: string
  durationTicks: number
  initialStake: number
  useMartingale: boolean
  martingale: number
  initialPrediction: number
  recoveryPrediction: number
  entryDigit: number
  requireEntryDigit: boolean
  maxWins: number
  stopLoss: number
  minStake: number
  maxStake: number
  takeProfit: number | null
}

export interface InfinityAlgoState {
  stake: number
  prediction: number
  runCount: number
  totalProfit: number
  entrySignal: boolean
  stopped: null | 'SESSION_COMPLETE' | 'STOP_LOSS'
  contractOpen: boolean
}

export interface SettleOutcome {
  stopped: InfinityAlgoState['stopped']
  state: InfinityAlgoState
}

const DEFAULT_CONFIG: InfinityAlgoConfig = {
  symbol: 'R_10',
  contractType: 'DIGITOVER',
  durationTicks: 1,
  initialStake: 0.5,
  useMartingale: true,
  martingale: 2,
  initialPrediction: 1,
  recoveryPrediction: 4,
  entryDigit: 4,
  requireEntryDigit: true,
  maxWins: 5,
  stopLoss: 50,
  minStake: 0.35,
  maxStake: 500,
  takeProfit: null,
}

function roundToCents(value: number): number {
  return Number(value.toFixed(2))
}

export class InfinityAlgo {
  private readonly config: InfinityAlgoConfig
  private state: InfinityAlgoState
  private contractOpen = false
  private cumulativeLoss = 0

  constructor(config: Partial<InfinityAlgoConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.state = {
      stake: this.config.initialStake,
      prediction: this.config.initialPrediction,
      runCount: 0,
      totalProfit: 0,
      entrySignal: !this.config.requireEntryDigit,
      stopped: null,
      contractOpen: false,
    }
  }

  onTick(lastDigit: number): BuyDecision | null {
    if (this.state.stopped || this.contractOpen || !Number.isInteger(lastDigit)) return null

    if (!this.state.entrySignal) {
      const isEntryDigit = lastDigit === this.config.entryDigit
      this.state = { ...this.state, entrySignal: isEntryDigit }
      if (!isEntryDigit) return null
    }

    this.contractOpen = true
    this.state = { ...this.state, contractOpen: true }
    return {
      contractType: this.config.contractType,
      symbol: this.config.symbol,
      stake: this.state.stake,
      barrier: this.state.prediction,
      durationTicks: this.config.durationTicks,
    }
  }

  onContractSettled(result: { won: boolean; profit: number }): SettleOutcome {
    if (!this.contractOpen) {
      return this.createSettleOutcome()
    }

    this.contractOpen = false
    this.state = {
      ...this.state,
      totalProfit: roundToCents(this.state.totalProfit + result.profit),
      contractOpen: false,
    }

    if (result.won) {
      this.cumulativeLoss = 0
    } else {
      this.cumulativeLoss += Math.abs(result.profit)
    }

    if (result.won) {
      this.state = {
        ...this.state,
        stake: this.config.initialStake,
        prediction: this.config.initialPrediction,
        runCount: this.state.runCount + 1,
      }
    } else {
      this.state = {
        ...this.state,
        prediction: this.config.recoveryPrediction,
        stake: this.config.useMartingale ? this.state.stake * this.config.martingale : this.config.initialStake,
      }
    }

    if (this.state.runCount >= this.config.maxWins) {
      this.state = { ...this.state, stopped: 'SESSION_COMPLETE' }
      return this.createSettleOutcome()
    }

    if (this.state.totalProfit <= -this.config.stopLoss || this.cumulativeLoss >= this.config.stopLoss) {
      this.state = { ...this.state, stopped: 'STOP_LOSS' }
      return this.createSettleOutcome()
    }

    const clampedStake = Math.min(this.config.maxStake, Math.max(this.config.minStake, this.state.stake))
    this.state = {
      ...this.state,
      stake: roundToCents(clampedStake),
    }

    return this.createSettleOutcome()
  }

  onTradeRejected(): InfinityAlgoState {
    this.contractOpen = false
    this.state = { ...this.state, contractOpen: false }
    return this.getState()
  }

  getState(): InfinityAlgoState {
    return { ...this.state }
  }

  private createSettleOutcome(): SettleOutcome {
    return { stopped: this.state.stopped, state: this.getState() }
  }
}
