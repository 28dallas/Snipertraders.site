import {
  BotDefinition,
  GOLDMINE_M1_BOT,
  INFINITY_ALGO_BOT,
  TEXAS_EVEN_BOT,
} from '@/stores/trading-store'
import type { FreeBotId } from '@/lib/bots/free-bot-strategy'

export interface FreeBotItem extends BotDefinition {
  tags: string[]
  category: 'digits' | 'volatility' | 'scalpers'
  marketLabel: string
  ruleDescription: string
  recommendedRisk: 'Low' | 'Medium' | 'High'
}

export const FREE_BOTS_COLLECTION: FreeBotItem[] = [
  {
    id: 'fb-1',
    name: 'Digit Over 1 Accumulator',
    category: 'digits',
    market: '1HZ10V',
    marketLabel: 'Volatility 10 (1s)',
    strategy: 'Over/Under',
    contractType: 'OVER',
    tradeType: 'Over/Under',
    stake: 0.5,
    duration: '1 tick',
    ruleDescription: 'After a tick ends in 0 or 1, buys DIGITOVER with barrier 1. A 1.2x stake progression follows losses; outcomes are uncertain.',
    tags: ['Over 1', 'Martingale 1.2x', 'Stop-Loss Guard'],
    recommendedRisk: 'Medium',
  },
  {
    id: 'fb-2',
    name: 'Digit Under 8 Shield',
    category: 'digits',
    market: '1HZ25V',
    marketLabel: 'Volatility 25 (1s)',
    strategy: 'Over/Under',
    contractType: 'UNDER',
    tradeType: 'Over/Under',
    stake: 1.0,
    duration: '1 tick',
    ruleDescription: 'Evaluates tick streams for digits ≥ 8. Enters DIGITUNDER (Prediction 8) with automated stop-loss limit.',
    tags: ['Under 8', 'Conservative', 'Stop Loss Guard'],
    recommendedRisk: 'Low',
  },
  {
    id: 'fb-3',
    name: 'Even-Odd Alternator Matrix',
    category: 'digits',
    market: '1HZ50V',
    marketLabel: 'Volatility 50 (1s)',
    strategy: 'Even/Odd',
    contractType: 'EVEN',
    tradeType: 'Even/Odd',
    stake: 0.5,
    duration: '1 tick',
    ruleDescription: 'Monitors streaks of 3 identical parity outcomes (e.g. 3 consecutive Odds) then triggers counter-parity.',
    tags: ['Parity Streak', 'Even/Odd', 'Medium Risk'],
    recommendedRisk: 'Medium',
  },
  {
    id: 'fb-4',
    name: 'Volatility 75 Sniper Trend',
    category: 'volatility',
    market: '1HZ75V',
    marketLabel: 'Volatility 75 (1s)',
    strategy: 'Rise/Fall',
    contractType: 'RISE',
    tradeType: 'Rise/Fall',
    stake: 1.0,
    duration: '3 ticks',
    ruleDescription: 'Uses the latest five quotes and enters CALL when their linear-regression slope is positive.',
    tags: ['Breakout', '3 Ticks', 'High Return'],
    recommendedRisk: 'Medium',
  },
  {
    id: 'fb-5',
    name: 'Volatility 100 Spike Hunter',
    category: 'volatility',
    market: '1HZ100V',
    marketLabel: 'Volatility 100 (1s)',
    strategy: 'Rise/Fall',
    contractType: 'FALL',
    tradeType: 'Rise/Fall',
    stake: 2.0,
    duration: '5 ticks',
    ruleDescription: 'Enters PUT after five consecutive upward tick moves, using a six-quote window to identify the surge.',
    tags: ['Mean Reversion', '5 Ticks', 'High Volatility'],
    recommendedRisk: 'High',
  },
  {
    id: 'fb-6',
    name: 'Digit Match 7 Scalper Pro',
    category: 'scalpers',
    market: '1HZ10V',
    marketLabel: 'Volatility 10 (1s)',
    strategy: 'Digit Match',
    contractType: 'MATCH',
    tradeType: 'Digit Match',
    stake: 0.35,
    duration: '1 tick',
    ruleDescription: 'In the latest ten ticks, matches the uniquely most frequent digit when it appears at least twice. Payout varies by Deriv quote.',
    tags: ['Digit Match', 'Quote-Dependent Payout', 'High Risk'],
    recommendedRisk: 'High',
  },
  {
    ...GOLDMINE_M1_BOT,
    category: 'digits',
    marketLabel: 'Volatility 10 (1s)',
    ruleDescription: 'Waits for last digit 1, buys DIGITOVER at prediction 3, and uses prediction 4 with 1.7x recovery after losses. Stops at +$50 or -$1,000 run P/L.',
    tags: GOLDMINE_M1_BOT.tags ?? [],
    recommendedRisk: 'High',
  },
  {
    ...INFINITY_ALGO_BOT,
    category: 'digits',
    marketLabel: 'R_10',
    ruleDescription: 'Starts on a 4-digit entry gate and keeps a controlled session running through 2x recovery steps until the run limit or stop-loss bound is reached.',
    tags: INFINITY_ALGO_BOT.tags ?? [],
    recommendedRisk: 'High',
  },
  {
    ...TEXAS_EVEN_BOT,
    category: 'digits',
    marketLabel: 'Volatility 10 (1s)',
    ruleDescription: 'Prompts for an entry digit, then buys EVEN on each tick for a ten-trade burst with a 2x recovery progression. Four straight default losses total $60, exceeding the $50 stop-loss.',
    tags: TEXAS_EVEN_BOT.tags ?? [],
    recommendedRisk: 'High',
  },
]

export function getFreeBotByName(name: string | null | undefined): FreeBotItem | undefined {
  if (!name) return undefined
  const normalizedName = name.trim().toLocaleLowerCase()
  return FREE_BOTS_COLLECTION.find((bot) => bot.name.toLocaleLowerCase() === normalizedName)
}

export function isCatalogFreeBotId(id: string): id is FreeBotId {
  return id === 'fb-1' || id === 'fb-2' || id === 'fb-3' || id === 'fb-4' || id === 'fb-5' || id === 'fb-6'
}

export function toBotDefinition(bot: FreeBotItem): BotDefinition {
  return {
    id: bot.id,
    name: bot.name,
    market: bot.market,
    strategy: bot.strategy,
    contractType: bot.contractType,
    tradeType: bot.tradeType,
    stake: bot.stake,
    duration: bot.duration,
    barrier: bot.barrier,
    martingale: bot.martingale,
    stopLoss: bot.stopLoss,
    takeProfit: bot.takeProfit,
    description: bot.ruleDescription,
    tags: bot.tags,
  }
}
