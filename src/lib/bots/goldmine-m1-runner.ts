import { derivWS, DerivTick } from '@/lib/deriv-websocket'
import {
  BuyDecision,
  GoldmineM1,
  GoldmineM1Config,
  GoldmineM1State,
  SettleOutcome,
} from '@/lib/bots/goldmine-m1'
import { InfinityAlgo, InfinityAlgoConfig, InfinityAlgoState } from '@/lib/bots/infinity-algo'
import { TexasEven, TexasEvenConfig, TexasEvenState } from '@/lib/bots/texas-even'

type JournalType = 'info' | 'success' | 'warning'

interface GoldmineDerivConnection {
  readonly isConnected: boolean
  readonly isAuthorized: boolean
  connect(): Promise<void>
  authorize(token: string): Promise<any>
  proposal(params: Record<string, unknown>): Promise<any>
  buy(proposalId: string, price: number): Promise<any>
  subscribeTicks(symbol: string, onTick: (tick: DerivTick) => void): () => void
  subscribeContract(
    contractId: number,
    onUpdate: (contract: Record<string, any>) => void,
    onError?: (error: Error) => void
  ): () => void
  subscribeBalance?(onBalance: (balance: Record<string, unknown>) => void): () => void
  on?(event: string, callback: () => void): () => void
}

export interface GoldmineM1Settlement {
  contractId: number
  stake: number
  payout: number
  profit: number
  won: boolean
  outcome: SettleOutcome
}

export interface StrategyRunnerConfig extends Record<string, unknown> {}

export interface GoldmineM1RunnerOptions<TConfig extends StrategyRunnerConfig = Partial<GoldmineM1Config>, TStrategy = GoldmineM1> {
  token: string
  accountId: string
  currency: string
  config?: TConfig
  strategyFactory?: (config: TConfig) => TStrategy
  strategyName?: string
  maxConsecutiveOrderErrors?: number
  enforceBalance?: boolean
  logEntryDigit?: boolean
  connection?: GoldmineDerivConnection
  onState?: (state: any) => void
  onLog?: (text: string, type: JournalType) => void
  onSettlement?: (settlement: GoldmineM1Settlement) => void
  onError?: (error: Error) => void
}

export type GoldmineM1RunnerCallbacks = Pick<GoldmineM1RunnerOptions, 'onState' | 'onLog' | 'onSettlement' | 'onError'>
type GoldmineM1RunnerIdentity = Pick<GoldmineM1RunnerOptions, 'token' | 'accountId' | 'currency' | 'config' | 'connection' | 'onSettlement'>
type TexasEvenRunnerConfig = Partial<Omit<TexasEvenConfig, 'entryDigit'>> & Pick<TexasEvenConfig, 'entryDigit'>
type TexasEvenRunnerIdentity = Omit<GoldmineM1RunnerOptions<TexasEvenRunnerConfig, TexasEven>, 'strategyFactory' | 'strategyName' | 'maxConsecutiveOrderErrors' | 'enforceBalance' | 'logEntryDigit'>

export function getLastDigitFromQuote(quote: number, pipSize: number): number {
  if (!Number.isFinite(quote) || !Number.isInteger(pipSize) || pipSize < 0 || pipSize > 100) {
    throw new Error('Deriv returned an invalid quote precision.')
  }

  const lastCharacter = quote.toFixed(pipSize).at(-1)
  if (!lastCharacter || lastCharacter < '0' || lastCharacter > '9') {
    throw new Error('Could not read the last digit from the Deriv quote.')
  }
  return Number(lastCharacter)
}

export class GoldmineM1Runner<TStrategy extends {
  onTick: (lastDigit: number) => BuyDecision | null
  onContractSettled: (result: { won: boolean; profit: number }) => { stopped: any; state: any }
  getState: () => any
  onBuyFailed?: () => any
  onTradeRejected?: () => any
} = GoldmineM1> {
  private readonly connection: GoldmineDerivConnection
  private readonly strategy: TStrategy
  private readonly symbol: string
  private readonly strategyName: string
  private readonly callbacks = new Set<GoldmineM1RunnerCallbacks>()
  private token: string
  private currency: string
  private availableBalance: number | null = null
  private consecutiveOrderErrors = 0
  private pendingPlacement = false
  private readonly maxConsecutiveOrderErrors: number
  private readonly enforceBalance: boolean
  private readonly logEntryDigit: boolean
  private onAccountSettlement?: (settlement: GoldmineM1Settlement) => void
  readonly accountId: string
  private isRunning = false
  private unsubscribeTicks: (() => void) | null = null
  private unsubscribeBalance: (() => void) | null = null
  private unsubscribeConnectionClose: (() => void) | null = null
  private openContract: { contractId: number; stake: number; unsubscribe: (() => void) | null } | null = null

  constructor(options: GoldmineM1RunnerOptions<any, TStrategy>) {
    const config = options.config ?? {}
    this.connection = options.connection ?? derivWS
    this.strategy = (options.strategyFactory ? options.strategyFactory(config) : new GoldmineM1(config as Partial<GoldmineM1Config>)) as TStrategy
    this.strategyName = options.strategyName ?? 'Advanced Goldmine M1'
    this.token = options.token
    this.accountId = options.accountId
    this.currency = options.currency
    this.onAccountSettlement = options.onSettlement
    this.maxConsecutiveOrderErrors = options.maxConsecutiveOrderErrors ?? Number.POSITIVE_INFINITY
    this.enforceBalance = options.enforceBalance ?? false
    this.logEntryDigit = options.logEntryDigit ?? false
    this.symbol = config.symbol ?? '1HZ10V'
    if (options.onState || options.onLog || options.onError) {
      this.callbacks.add({
        onState: options.onState,
        onLog: options.onLog,
        onError: options.onError,
      })
    }
  }

  subscribe(callbacks: GoldmineM1RunnerCallbacks): () => void {
    this.callbacks.add(callbacks)
    return () => this.callbacks.delete(callbacks)
  }

  updateCredentials(token: string, currency: string): void {
    if (this.openContract && this.currency !== currency) {
      throw new Error('Wait for the open Goldmine contract to settle before changing account currency.')
    }
    this.token = token
    this.currency = currency
  }

  setAccountSettlementHandler(handler: (settlement: GoldmineM1Settlement) => void): void {
    this.onAccountSettlement = handler
  }

  async start(): Promise<void> {
    if (this.isRunning) return
    if (!this.token || !this.accountId) throw new Error('Connect and authorize a Deriv account before running this bot.')

    this.isRunning = true
    this.attachConnectionCloseObserver()
    try {
      if (!this.connection.isConnected) await this.connection.connect()
      if (!this.isRunning) return

      const response = await this.connection.authorize(this.token)
      if (!response?.authorize?.loginid) throw new Error('Deriv did not authorize the connected account.')
      if (response.authorize.loginid !== this.accountId) throw new Error('Deriv authorized a different account than the one selected.')
      const balance = Number(response.authorize.balance)
      this.availableBalance = Number.isFinite(balance) ? balance : null
      if (!this.isRunning) return

      if (this.enforceBalance && !this.unsubscribeBalance && this.connection.subscribeBalance) {
        this.unsubscribeBalance = this.connection.subscribeBalance((balanceUpdate) => {
          const currentBalance = Number(balanceUpdate.balance)
          if (Number.isFinite(currentBalance)) this.availableBalance = currentBalance
        })
      }

      this.emitState(this.strategy.getState())
      if (this.openContract) this.monitorOpenContract()
      else this.subscribeToTicks()
    } catch (error) {
      this.stop()
      const normalizedError = error instanceof Error ? error : new Error('Could not start Advanced Goldmine M1.')
      this.emitError(normalizedError)
      throw normalizedError
    }
  }

  stop(): void {
    this.isRunning = false
    this.unsubscribeTicks?.()
    this.unsubscribeTicks = null
    this.unsubscribeBalance?.()
    this.unsubscribeBalance = null
    if (!this.openContract && !this.pendingPlacement) {
      this.clearRegistryEntry()
    }
  }

  dispose(): void {
    this.stop()
    this.unsubscribeConnectionClose?.()
    this.unsubscribeConnectionClose = null
    this.unsubscribeBalance?.()
    this.unsubscribeBalance = null
    this.openContract?.unsubscribe?.()
    this.openContract = null
    this.clearRegistryEntry()
  }

  getState(): any {
    return this.strategy.getState()
  }

  get isActive(): boolean {
    return this.isRunning
  }

  private handleTick(tick: DerivTick): void {
    if (!this.isRunning) return

    const previousState = this.strategy.getState()
    let decision: BuyDecision | null
    try {
      decision = this.strategy.onTick(getLastDigitFromQuote(tick.quote, tick.pip_size))
    } catch (error) {
      this.emitLog(error instanceof Error ? error.message : 'Invalid Deriv tick received.', 'warning')
      return
    }

    this.emitState(this.strategy.getState())
    if (decision) {
      if (this.logEntryDigit && previousState.burstRemaining === 0) {
        this.emitLog(`Entry found on digit ${getLastDigitFromQuote(tick.quote, tick.pip_size)}.`, 'success')
      }
      void this.placeTrade(decision)
    }
  }

  private handleConnectionClose(): void {
    this.unsubscribeTicks?.()
    this.unsubscribeTicks = null
    if (this.openContract) {
      this.openContract.unsubscribe?.()
      this.openContract.unsubscribe = null
    }
    this.isRunning = false
    this.emitError(new Error('Deriv connection closed. Restart the bot to resume contract monitoring.'))
  }

  private clearRegistryEntry(): void {
    const accountId = this.accountId
    if (runnerRegistry.get(accountId) === this) runnerRegistry.delete(accountId)
    if (this instanceof InfinityAlgoRunner && infinityRunnerRegistry.get(accountId) === this) {
      infinityRunnerRegistry.delete(accountId)
    }
    if (this instanceof TexasEvenRunner && texasEvenRunnerRegistry.get(accountId) === this) {
      texasEvenRunnerRegistry.delete(accountId)
    }
  }

  private attachConnectionCloseObserver(): void {
    this.unsubscribeConnectionClose?.()
    this.unsubscribeConnectionClose = this.connection.on?.('close', () => this.handleConnectionClose()) ?? null
  }

  private subscribeToTicks(): void {
    if (!this.isRunning || this.unsubscribeTicks) return
    this.emitLog(`${this.strategyName} listening on ${this.symbol}.`, 'info')
    this.unsubscribeTicks = this.connection.subscribeTicks(this.symbol, (tick) => this.handleTick(tick))
  }

  private monitorOpenContract(): void {
    const openContract = this.openContract
    if (!openContract || openContract.unsubscribe) return

    openContract.unsubscribe = this.connection.subscribeContract(openContract.contractId, (contract) => {
      if (this.openContract !== openContract) return
      if (!(contract.is_sold === 1 || ['won', 'lost', 'sold'].includes(String(contract.status)))) return

      openContract.unsubscribe?.()
      this.openContract = null
      const profit = Number(contract.profit ?? Number(contract.payout ?? 0) - openContract.stake)
      const payout = Number(contract.payout ?? profit + openContract.stake)
      const won = String(contract.status) === 'won' || (String(contract.status) !== 'lost' && profit > 0)
      const outcome = this.strategy.onContractSettled({ won, profit })
      const reportedBalance = Number(contract.balance_after)
      if (Number.isFinite(reportedBalance)) {
        this.availableBalance = reportedBalance
      } else if (this.availableBalance !== null) {
        this.availableBalance += payout
      }
      const settlement = { contractId: openContract.contractId, stake: openContract.stake, payout, profit, won, outcome }
      this.emitState(outcome.state)
      this.onAccountSettlement?.(settlement)
      this.emitSettlement(settlement)
      this.emitLog(
        `Contract #${openContract.contractId} ${won ? 'won' : 'lost'}: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}.`,
        won ? 'success' : 'warning'
      )

      if (!this.isRunning || outcome.stopped) {
        this.clearRegistryEntry()
      }

      if (outcome.stopped) {
        this.stop()
        const stopLabel = outcome.stopped === 'SESSION_COMPLETE' ? 'session complete' : 'stop-loss'
        this.emitLog(`${this.strategyName} stopped at its ${stopLabel} limit.`, 'warning')
      } else {
        this.subscribeToTicks()
      }
    }, (error) => {
      if (this.openContract !== openContract) return
      openContract.unsubscribe?.()
      openContract.unsubscribe = null
      this.stop()
      this.emitLog(`Could not track contract #${openContract.contractId}: ${error.message}. Restart to retry monitoring.`, 'warning')
      this.emitError(error)
    })
  }

  private async placeTrade(decision: BuyDecision): Promise<void> {
    if (this.pendingPlacement || this.openContract) return
    this.pendingPlacement = true
    const stake = Number(decision.stake.toFixed(2))
    try {
      if (this.enforceBalance && (this.availableBalance === null || stake > this.availableBalance)) {
        this.rejectStrategyTrade()
        this.emitState(this.strategy.getState())
        const error = new Error(this.availableBalance === null
          ? 'Texas Even Bot stopped because the Deriv account balance could not be confirmed.'
          : `Texas Even Bot stopped because the $${stake.toFixed(2)} stake exceeds the $${this.availableBalance.toFixed(2)} account balance.`)
        this.stop()
        this.emitError(error)
        return
      }

      const proposalResponse = await this.connection.proposal({
        amount: stake,
        basis: 'stake',
        contract_type: decision.contractType,
        currency: this.currency,
        duration: decision.durationTicks,
        duration_unit: 't',
        symbol: decision.symbol,
        ...(decision.barrier === undefined ? {} : { barrier: String(decision.barrier) }),
      })
      const proposal = proposalResponse?.proposal
      if (!proposal?.id) throw new Error('Deriv did not return a proposal ID.')
      if (!this.isRunning) {
        this.strategy.onTradeRejected?.()
        this.emitState(this.strategy.getState())
        return
      }

      const buyResponse = await this.connection.buy(proposal.id, Number(proposal.ask_price))
      const contractId = Number(buyResponse?.buy?.contract_id)
      if (!Number.isFinite(contractId) || contractId <= 0) throw new Error('Deriv did not return a contract ID.')

      const balanceAfterBuy = Number(buyResponse?.buy?.balance_after)
      if (Number.isFinite(balanceAfterBuy)) this.availableBalance = balanceAfterBuy
      else if (this.availableBalance !== null) this.availableBalance = Math.max(0, this.availableBalance - stake)
      this.consecutiveOrderErrors = 0
      this.emitLog(`Opened Deriv contract #${contractId} with a $${stake.toFixed(2)} stake.`, 'success')
      this.openContract = { contractId, stake, unsubscribe: null }
      this.emitState(this.strategy.getState())
      this.monitorOpenContract()
    } catch (error) {
      this.rejectStrategyTrade()
      this.emitState(this.strategy.getState())
      this.consecutiveOrderErrors += 1
      const message = error instanceof Error ? error.message : 'Deriv API error'
      this.emitLog(`${this.strategyName} order failed (${this.consecutiveOrderErrors}/${this.maxConsecutiveOrderErrors}): ${message}`, 'warning')
      if (this.consecutiveOrderErrors >= this.maxConsecutiveOrderErrors) {
        this.stop()
        this.emitError(new Error(`${this.strategyName} stopped after ${this.consecutiveOrderErrors} consecutive proposal/buy errors: ${message}`))
      }
    } finally {
      this.pendingPlacement = false
      if (!this.isRunning && !this.openContract) this.clearRegistryEntry()
    }
  }

  private rejectStrategyTrade(): void {
    if (this.strategy.onBuyFailed) this.strategy.onBuyFailed()
    else this.strategy.onTradeRejected?.()
  }

  private emitState(state: GoldmineM1State): void {
    this.callbacks.forEach((callbacks) => callbacks.onState?.(state))
  }

  private emitLog(text: string, type: JournalType): void {
    this.callbacks.forEach((callbacks) => callbacks.onLog?.(text, type))
  }

  private emitSettlement(settlement: GoldmineM1Settlement): void {
    this.callbacks.forEach((callbacks) => callbacks.onSettlement?.(settlement))
  }

  private emitError(error: Error): void {
    this.callbacks.forEach((callbacks) => callbacks.onError?.(error))
  }
}

export class InfinityAlgoRunner extends GoldmineM1Runner<InfinityAlgo> {
  constructor(options: GoldmineM1RunnerOptions<Partial<InfinityAlgoConfig>, InfinityAlgo>) {
    super({
      ...options,
      strategyName: 'Infinity Algo',
      strategyFactory: (config) => new InfinityAlgo(config),
    })
  }
}

export class TexasEvenRunner extends GoldmineM1Runner<TexasEven> {
  constructor(options: GoldmineM1RunnerOptions<TexasEvenRunnerConfig, TexasEven>) {
    super({
      ...options,
      strategyName: 'Texas Even Bot',
      maxConsecutiveOrderErrors: 5,
      enforceBalance: true,
      logEntryDigit: true,
      strategyFactory: (config) => new TexasEven(config as TexasEvenRunnerConfig),
    })
  }
}

const runnerRegistry = new Map<string, GoldmineM1Runner<any>>()
const infinityRunnerRegistry = new Map<string, InfinityAlgoRunner>()
const texasEvenRunnerRegistry = new Map<string, TexasEvenRunner>()
let accountTransitionPending = false

export function beginDerivAccountTransition(): () => void {
  if (accountTransitionPending) throw new Error('A Deriv account change is already in progress.')
  if (hasActiveGoldmineRunner() || hasActiveInfinityAlgoRunner() || hasActiveTexasEvenRunner()) {
    throw new Error('Stop the active bot and settle any open contract before changing Deriv accounts.')
  }

  accountTransitionPending = true
  let released = false
  return () => {
    if (released) return
    released = true
    accountTransitionPending = false
  }
}

function assertAccountTransitionIdle(): void {
  if (accountTransitionPending) {
    throw new Error('Wait for the Deriv account change to finish before starting a bot.')
  }
}

export function getGoldmineM1Runner(options: GoldmineM1RunnerIdentity): GoldmineM1Runner {
  assertAccountTransitionIdle()
  const activeRunner = Array.from(runnerRegistry.values()).find(
    (runner) => runner.accountId !== options.accountId && (runner.isActive || runner.getState().contractOpen)
  )
  if (activeRunner) {
    throw new Error('Wait for the open Goldmine contract on the previous account to settle before switching accounts.')
  }

  const existingRunner = runnerRegistry.get(options.accountId)
  if (existingRunner && !existingRunner.getState().stopped) {
    existingRunner.updateCredentials(options.token, options.currency)
    if (options.onSettlement) existingRunner.setAccountSettlementHandler(options.onSettlement)
    return existingRunner
  }

  existingRunner?.dispose()
  const runner = new GoldmineM1Runner(options)
  runnerRegistry.set(options.accountId, runner)
  return runner
}

export function hasOpenGoldmineContract(exceptAccountId: string): boolean {
  return Array.from(runnerRegistry.values()).some(
    (runner) => runner.accountId !== exceptAccountId && runner.getState().contractOpen
  )
}

export function hasAnyOpenGoldmineContract(): boolean {
  return Array.from(runnerRegistry.values()).some((runner) => runner.getState().contractOpen)
}

export function hasActiveGoldmineRunner(exceptAccountId?: string): boolean {
  return Array.from(runnerRegistry.values()).some(
    (runner) => (!exceptAccountId || runner.accountId !== exceptAccountId) && (runner.isActive || runner.getState().contractOpen)
  )
}

export function getInfinityAlgoRunner(options: GoldmineM1RunnerIdentity): InfinityAlgoRunner {
  assertAccountTransitionIdle()
  const activeRunner = Array.from(infinityRunnerRegistry.values()).find(
    (runner) => runner.accountId !== options.accountId && (runner.isActive || runner.getState().contractOpen)
  )
  if (activeRunner) {
    throw new Error('Wait for the open Infinity Algo contract on the previous account to settle before switching accounts.')
  }

  const existingRunner = infinityRunnerRegistry.get(options.accountId)
  if (existingRunner && !existingRunner.getState().stopped) {
    existingRunner.updateCredentials(options.token, options.currency)
    if (options.onSettlement) existingRunner.setAccountSettlementHandler(options.onSettlement)
    return existingRunner
  }

  existingRunner?.dispose()
  const runner = new InfinityAlgoRunner({
    ...options,
    onSettlement: options.onSettlement,
  })
  infinityRunnerRegistry.set(options.accountId, runner)
  return runner
}

export function hasOpenInfinityAlgoContract(exceptAccountId: string): boolean {
  return Array.from(infinityRunnerRegistry.values()).some(
    (runner) => runner.accountId !== exceptAccountId && runner.getState().contractOpen
  )
}

export function hasAnyOpenInfinityAlgoContract(): boolean {
  return Array.from(infinityRunnerRegistry.values()).some((runner) => runner.getState().contractOpen)
}

export function hasActiveInfinityAlgoRunner(exceptAccountId?: string): boolean {
  return Array.from(infinityRunnerRegistry.values()).some(
    (runner) => (!exceptAccountId || runner.accountId !== exceptAccountId) && (runner.isActive || runner.getState().contractOpen)
  )
}

export function getTexasEvenRunner(options: TexasEvenRunnerIdentity): TexasEvenRunner {
  assertAccountTransitionIdle()
  const activeRunner = Array.from(texasEvenRunnerRegistry.values()).find(
    (runner) => runner.accountId !== options.accountId && (runner.isActive || runner.getState().awaitingSettle)
  )
  if (activeRunner) {
    throw new Error('Wait for the open Texas Even Bot contract on the previous account to settle before switching accounts.')
  }

  const existingRunner = texasEvenRunnerRegistry.get(options.accountId)
  if (existingRunner && !existingRunner.getState().stopped) {
    existingRunner.updateCredentials(options.token, options.currency)
    if (options.onSettlement) existingRunner.setAccountSettlementHandler(options.onSettlement)
    return existingRunner
  }

  existingRunner?.dispose()
  const runner = new TexasEvenRunner(options)
  texasEvenRunnerRegistry.set(options.accountId, runner)
  return runner
}

export function hasOpenTexasEvenContract(exceptAccountId?: string): boolean {
  return Array.from(texasEvenRunnerRegistry.values()).some(
    (runner) => (!exceptAccountId || runner.accountId !== exceptAccountId) && runner.getState().awaitingSettle
  )
}

export function hasActiveTexasEvenRunner(exceptAccountId?: string): boolean {
  return Array.from(texasEvenRunnerRegistry.values()).some(
    (runner) => (!exceptAccountId || runner.accountId !== exceptAccountId) && (runner.isActive || runner.getState().awaitingSettle)
  )
}