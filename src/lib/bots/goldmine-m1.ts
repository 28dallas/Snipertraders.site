export interface GoldmineM1Config {
  symbol: string
  contractType: string
  durationTicks: number
  initialStake: number
  martingale: number
  minStake: number
  predictionNormal: number
  predictionRecovery: number
  entryDigit: number
  requireEntryDigitOnFirstTrade: boolean
  takeProfit: number
  stopLoss: number
}

export interface BuyDecision {
  contractType: string
  symbol: string
  stake: number
  barrier?: number
  durationTicks: number
}

export type GoldmineM1Mode = 'WAIT_ENTRY' | 'IMMEDIATE' | 'RECOVERY'
export type GoldmineM1StopReason = null | 'TAKE_PROFIT' | 'STOP_LOSS'

export interface GoldmineM1State {
  stake: number
  prediction: number
  totalLost: number
  countLoss: number
  totalProfit: number
  mode: GoldmineM1Mode
  stopped: GoldmineM1StopReason
  contractOpen: boolean
}

export interface SettleOutcome {
  stopped: GoldmineM1StopReason
  state: GoldmineM1State
}

const DEFAULT_CONFIG: GoldmineM1Config = {
  symbol: '1HZ10V',
  contractType: 'DIGITOVER',
  durationTicks: 1,
  initialStake: 4,
  martingale: 1.7,
  minStake: 0.35,
  predictionNormal: 3,
  predictionRecovery: 4,
  entryDigit: 1,
  requireEntryDigitOnFirstTrade: true,
  takeProfit: 50,
  stopLoss: 1000,
}

export class GoldmineM1 {
  private readonly config: GoldmineM1Config
  private state: GoldmineM1State
  private cumulativeLoss = 0

  constructor(config: Partial<GoldmineM1Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.state = {
      stake: this.config.initialStake,
      prediction: this.config.predictionNormal,
      totalLost: 0,
      countLoss: 0,
      totalProfit: 0,
      mode: 'WAIT_ENTRY',
      stopped: null,
      contractOpen: false,
    }
  }

  onTick(lastDigit: number): BuyDecision | null {
    if (this.state.stopped || this.state.contractOpen || !Number.isInteger(lastDigit)) return null
    if (this.state.mode === 'WAIT_ENTRY' && this.config.requireEntryDigitOnFirstTrade && lastDigit !== this.config.entryDigit) {
      return null
    }

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
    if (!this.state.contractOpen) return this.createSettleOutcome()

    this.state = {
      ...this.state,
      contractOpen: false,
      totalProfit: this.state.totalProfit + result.profit,
    }

    if (result.won) {
      this.cumulativeLoss = 0
    } else {
      this.cumulativeLoss += Math.abs(result.profit)
    }

    if (this.state.totalProfit > this.config.takeProfit) {
      this.state = { ...this.state, stopped: 'TAKE_PROFIT' }
      return this.createSettleOutcome()
    }

    if (this.state.totalProfit <= -this.config.stopLoss || this.cumulativeLoss >= this.config.stopLoss) {
      this.state = { ...this.state, stopped: 'STOP_LOSS' }
      return this.createSettleOutcome()
    }

    if (result.won) {
      this.state = {
        ...this.state,
        prediction: this.config.predictionRecovery,
        mode: 'IMMEDIATE',
        totalLost: Math.max(0, this.state.totalLost - result.profit),
      }
    } else {
      this.state = {
        ...this.state,
        totalLost: this.state.totalLost + this.state.stake,
        countLoss: this.state.countLoss > 0 ? 0 : this.state.countLoss,
      }
    }

    if (this.state.totalLost > 0) {
      const countLoss = this.state.countLoss + 1
      this.state = {
        ...this.state,
        countLoss,
        mode: 'RECOVERY',
        prediction: countLoss === 1 ? this.config.predictionRecovery : this.state.prediction,
        stake: countLoss === 1 ? this.state.stake * this.config.martingale : this.state.stake,
      }
    } else {
      this.state = {
        ...this.state,
        countLoss: 0,
        mode: 'IMMEDIATE',
        stake: this.config.initialStake,
        prediction: this.config.predictionNormal,
      }
    }

    this.state = {
      ...this.state,
      stake: Math.max(this.state.stake, this.config.minStake),
    }

    return this.createSettleOutcome()
  }

  onTradeRejected(): GoldmineM1State {
    this.state = { ...this.state, contractOpen: false }
    return this.getState()
  }

  getState(): GoldmineM1State {
    return { ...this.state }
  }

  private createSettleOutcome(): SettleOutcome {
    const state = this.getState()
    return { stopped: state.stopped, state }
  }
}