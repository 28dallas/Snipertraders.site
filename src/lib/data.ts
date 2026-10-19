import { Bot, Trader, BlogPost } from '@/types'

export const MOCK_BOTS: Bot[] = [
  { id: '1', name: 'Volatility Crusher v3', market: 'volatility_10', strategy_type: 'over_under', win_rate: 68, risk_level: 'low', download_count: 4821, is_free: true, created_at: '2024-01-01', description: 'Consistent over/under strategy optimized for Volatility 10 index with tight stop loss.' },
  { id: '2', name: 'Boom Rider Pro', market: 'boom_1000', strategy_type: 'rise_fall', win_rate: 72, risk_level: 'medium', download_count: 3210, is_free: true, created_at: '2024-01-05', description: 'Rides boom spikes on Boom 1000 with smart entry timing.' },
  { id: '3', name: 'Crash Hunter Elite', market: 'crash_500', strategy_type: 'rise_fall', win_rate: 65, risk_level: 'high', download_count: 2890, is_free: true, created_at: '2024-01-10', description: 'Aggressive crash trading bot for experienced traders.' },
  { id: '4', name: 'Even Odd Master', market: 'volatility_25', strategy_type: 'even_odd', win_rate: 58, risk_level: 'low', download_count: 5102, is_free: true, created_at: '2024-01-12', description: 'Simple even/odd strategy with martingale recovery system.' },
  { id: '5', name: 'Step Index Scalper', market: 'step_index', strategy_type: 'digit_match', win_rate: 61, risk_level: 'medium', download_count: 1987, is_free: true, created_at: '2024-01-15', description: 'Digit match scalper for Step Index with high frequency trades.' },
  { id: '6', name: 'Forex Trend Follower', market: 'forex', strategy_type: 'rise_fall', win_rate: 63, risk_level: 'medium', download_count: 2341, is_free: false, created_at: '2024-01-18', description: 'Trend-following bot for major forex pairs on Deriv.' },
  { id: '7', name: 'V75 Digit Sniper', market: 'volatility_75', strategy_type: 'digit_match', win_rate: 55, risk_level: 'high', download_count: 1654, is_free: true, created_at: '2024-01-20', description: 'High-risk digit sniper for Volatility 75 index.' },
  { id: '8', name: 'Boom 500 Scalper', market: 'boom_500', strategy_type: 'touch_no_touch', win_rate: 70, risk_level: 'medium', download_count: 3456, is_free: false, created_at: '2024-01-22', description: 'Touch/no-touch scalper optimized for Boom 500.' },
  { id: '9', name: 'Advanced Goldmine M1', market: 'volatility_10', strategy_type: 'over_under', risk_level: 'high', download_count: 0, is_free: true, created_at: '2026-10-19', description: 'Trades DIGITOVER after the last digit is 1, using a 1.7x loss progression.' },
  { id: '10', name: 'Infinity Algo', market: 'volatility_10', strategy_type: 'over_under', risk_level: 'high', download_count: 0, is_free: true, created_at: '2026-10-19', description: 'Uses a 4-digit entry gate and 2x recovery progression, with session and stop-loss limits.' },
  { id: '11', name: 'Texas Even Bot', market: 'volatility_10', strategy_type: 'even_odd', risk_level: 'high', download_count: 0, is_free: true, created_at: '2026-10-19', description: 'Runs an entry-gated even-digit burst and stops at the configured profit or loss limit.' },
]

export const MOCK_TRADERS: Trader[] = [
  { id: '1', user_id: 'u1', display_name: 'AlphaTrader_KE', win_rate: 78, monthly_roi: 34.5, total_trades: 1240, max_drawdown: 8.2, is_verified: true, followers: 892, subscription_fee: 19, bio: 'Professional Deriv trader from Nairobi. 5+ years experience.' },
  { id: '2', user_id: 'u2', display_name: 'ProfitKing254', win_rate: 74, monthly_roi: 28.3, total_trades: 980, max_drawdown: 11.5, is_verified: true, followers: 654, subscription_fee: 15, bio: 'Volatility index specialist. Consistent monthly returns.' },
  { id: '3', user_id: 'u3', display_name: 'BoomCrashPro', win_rate: 71, monthly_roi: 22.1, total_trades: 2100, max_drawdown: 14.8, is_verified: false, followers: 421, subscription_fee: 10, bio: 'Boom & Crash expert. High volume trading strategy.' },
  { id: '4', user_id: 'u4', display_name: 'SyntheticGuru_TZ', win_rate: 69, monthly_roi: 19.7, total_trades: 756, max_drawdown: 9.3, is_verified: true, followers: 312, subscription_fee: 12, bio: 'Tanzania-based synthetic indices trader.' },
  { id: '5', user_id: 'u5', display_name: 'ForexMaster_UG', win_rate: 66, monthly_roi: 16.4, total_trades: 543, max_drawdown: 12.1, is_verified: false, followers: 198, subscription_fee: 8, bio: 'Uganda forex trader specializing in EUR/USD and GBP/USD.' },
  { id: '6', user_id: 'u6', display_name: 'VolatilityKing', win_rate: 64, monthly_roi: 14.2, total_trades: 1890, max_drawdown: 16.5, is_verified: true, followers: 267, subscription_fee: 9, bio: 'High-frequency volatility index trader.' },
]

export const MOCK_TESTIMONIALS = [
  { id: '1', name: 'James Mwangi', country: 'KE', flag: '🇰🇪', rating: 5, quote: 'Made KES 45,000 in my first month using the Volatility Crusher bot. This platform changed my life!', avatar: 'JM' },
  { id: '2', name: 'Amina Hassan', country: 'TZ', flag: '🇹🇿', rating: 5, quote: 'The copy trading feature is incredible. I just copy AlphaTrader and watch my account grow daily.', avatar: 'AH' },
  { id: '3', name: 'David Ochieng', country: 'KE', flag: '🇰🇪', rating: 5, quote: 'Best Deriv bot platform in Africa. The no-code builder saved me months of learning to code.', avatar: 'DO' },
  { id: '4', name: 'Grace Nakato', country: 'UG', flag: '🇺🇬', rating: 4, quote: 'Telegram alerts keep me informed on every trade. The Pro plan is worth every shilling.', avatar: 'GN' },
  { id: '5', name: 'Brian Kipchoge', country: 'KE', flag: '🇰🇪', rating: 5, quote: 'Downloaded 10+ free bots and tested them all. The win rates are accurate and the support is amazing.', avatar: 'BK' },
  { id: '6', name: 'Fatuma Ali', country: 'TZ', flag: '🇹🇿', rating: 5, quote: 'From zero to KES 120,000 in 3 months. The Elite plan mentorship was a game changer.', avatar: 'FA' },
]

export const MOCK_BLOG_POSTS: BlogPost[] = [
  { id: '1', title: 'Top 5 Volatility Index Strategies for 2024', slug: 'top-5-volatility-strategies-2024', content: '', category: 'strategy', author_id: 'admin', published_at: '2024-01-15', cover_image: '', excerpt: 'Discover the most profitable volatility index strategies that top Deriv traders are using right now.', read_time: 8 },
  { id: '2', title: 'How to Build Your First Deriv Bot in 10 Minutes', slug: 'build-first-deriv-bot', content: '', category: 'tutorial', author_id: 'admin', published_at: '2024-01-20', cover_image: '', excerpt: 'Step-by-step guide to creating your first automated trading bot using our no-code builder.', read_time: 10 },
  { id: '3', title: 'Boom & Crash Index: Complete Market Analysis', slug: 'boom-crash-market-analysis', content: '', category: 'market_analysis', author_id: 'admin', published_at: '2024-01-25', cover_image: '', excerpt: 'Deep dive into Boom 500, Boom 1000, Crash 500, and Crash 1000 indices — patterns, timing, and strategies.', read_time: 12 },
]

export const PRICING_TIERS = [
  {
    name: 'Free',
    price_usd: 0,
    price_kes: 0,
    description: 'Perfect for getting started',
    features: [
      '3 bot downloads per day',
      'Basic strategy templates',
      'Community access',
      'Public leaderboard view',
      'Email support',
    ],
    highlighted: false,
    cta: 'Get Started via Deriv (Free)',
  },
  {
    name: 'Pro',
    price_usd: 19,
    price_kes: 2500,
    description: 'For serious traders',
    features: [
      'Unlimited bot downloads',
      'No-code bot builder',
      'Copy trading (up to 3 traders)',
      'Telegram trade alerts',
      'Real-time P&L dashboard',
      'Priority support',
      'Advanced strategies',
    ],
    highlighted: true,
    cta: 'Get Started via Deriv (Free)',
  },
  {
    name: 'Elite',
    price_usd: 49,
    price_kes: 6500,
    description: 'For professional traders',
    features: [
      'Everything in Pro',
      '1-on-1 mentorship sessions',
      'Custom bot development',
      'VIP signal group',
      'Copy unlimited traders',
      'API access',
      'White-label bots',
      'Dedicated account manager',
    ],
    highlighted: false,
    cta: 'Get Started via Deriv (Free)',
  },
]

export const MARKET_LABELS: Record<string, string> = {
  volatility_10: 'Volatility 10',
  volatility_25: 'Volatility 25',
  volatility_50: 'Volatility 50',
  volatility_75: 'Volatility 75',
  volatility_100: 'Volatility 100',
  crash_500: 'Crash 500',
  crash_1000: 'Crash 1000',
  boom_500: 'Boom 500',
  boom_1000: 'Boom 1000',
  step_index: 'Step Index',
  forex: 'Forex',
}

export const STRATEGY_LABELS: Record<string, string> = {
  rise_fall: 'Rise/Fall',
  over_under: 'Over/Under',
  even_odd: 'Even/Odd',
  digit_match: 'Digit Match',
  touch_no_touch: 'Touch/No Touch',
}
