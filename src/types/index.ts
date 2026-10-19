export type Plan = 'free' | 'pro' | 'elite'
export type BotStatus = 'running' | 'paused' | 'stopped'
export type TradeResult = 'win' | 'loss'
export type RiskLevel = 'low' | 'medium' | 'high'
export type Market = 'volatility_10' | 'volatility_25' | 'volatility_50' | 'volatility_75' | 'volatility_100' | 'crash_500' | 'crash_1000' | 'boom_500' | 'boom_1000' | 'step_index' | 'forex'
export type StrategyType = 'rise_fall' | 'over_under' | 'even_odd' | 'digit_match' | 'touch_no_touch'

export interface Profile {
  id: string
  full_name: string
  phone: string
  avatar_url?: string
  plan: Plan
  referral_code: string
  telegram_id?: string
  created_at: string
}

export interface Bot {
  id: string
  name: string
  market: Market
  strategy_type: StrategyType
  win_rate?: number
  risk_level: RiskLevel
  download_count: number
  xml_content?: string
  is_free: boolean
  created_by?: string
  created_at: string
  description?: string
}

export interface UserBot {
  id: string
  user_id: string
  bot_id: string
  bot?: Bot
  status: BotStatus
  stake: number
  take_profit: number
  stop_loss: number
  deployed_at: string
}

export interface Trader {
  id: string
  user_id: string
  display_name: string
  avatar?: string
  win_rate: number
  monthly_roi: number
  total_trades: number
  max_drawdown: number
  bio?: string
  is_verified: boolean
  followers: number
  subscription_fee: number
}

export interface Trade {
  id: string
  user_id: string
  bot_id?: string
  market: Market
  direction: string
  stake: number
  result: TradeResult
  profit_loss: number
  traded_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  status: 'active' | 'cancelled' | 'expired'
  starts_at: string
  ends_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  method: 'mpesa' | 'card'
  mpesa_ref?: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  category: 'strategy' | 'tutorial' | 'market_analysis' | 'news'
  author_id: string
  published_at: string
  cover_image?: string
  excerpt?: string
  read_time?: number
}

export interface NavItem {
  label: string
  href: string
}

export interface PricingTier {
  name: string
  price_usd: number
  price_kes: number
  description: string
  features: string[]
  highlighted: boolean
  cta: string
}

export type StrategyMarket = 'volatility' | 'boom_crash' | 'forex' | 'step_index' | 'synthetic'
export type StrategyStatus = 'active' | 'paused' | 'full'

export interface Strategy {
  id: string
  name: string
  provider: string
  market: StrategyMarket
  win_rate: number
  total_return: number
  drawdown: number
  followers: number
  min_stake: number
  is_verified: boolean
  status: StrategyStatus
  last_updated: string
}

export interface OpenTrade {
  id: string
  strategy_id: string
  strategy_name: string
  market: string
  direction: 'CALL' | 'PUT' | 'OVER' | 'UNDER'
  stake: number
  profit_loss: number
  status: 'open' | 'won' | 'lost'
  opened_at: string
}

export interface LiveMarketSnapshot {
  timestamp: string
  balance: number
  today_pnl: number
  win_rate: number
  active_trades: number
  strategies: Strategy[]
  open_trades: OpenTrade[]
}
