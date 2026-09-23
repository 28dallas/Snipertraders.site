import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Clock, Tag, ArrowLeft, Share2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { MOCK_BLOG_POSTS } from '@/lib/data'
import { EXTRA_BLOG_POSTS } from '@/lib/learn-data'

const ALL_POSTS = [...EXTRA_BLOG_POSTS, ...MOCK_BLOG_POSTS]

const FULL_CONTENT: Record<string, string[]> = {
  'top-5-volatility-strategies-2024': [
    'The Volatility Index on Deriv is one of the most traded synthetic instruments in Africa. Unlike real forex markets, it runs 24/7 and is not affected by news events — making it ideal for automated bots.',
    '## 1. Over/Under Strategy\nThe Over/Under strategy bets on whether the last digit of the price will be over or under a specific number (usually 5). With a well-tuned martingale recovery, this strategy can achieve 60-70% win rates on Volatility 10.',
    '## 2. Rise/Fall with Trend Filter\nUsing a simple moving average to determine trend direction, then only taking Rise trades in uptrends and Fall trades in downtrends significantly improves accuracy.',
    '## 3. Even/Odd Digit Strategy\nThis strategy predicts whether the last digit of the closing price will be even or odd. The theoretical win rate is 50%, but with proper stake management and timing, traders report 55-62% win rates.',
    '## 4. Digit Match Strategy\nPredicting the exact last digit (0-9) pays out 9x your stake. While the win rate is ~10%, a single win recovers multiple losses. Best used with small stakes.',
    '## 5. Touch/No Touch Barriers\nSetting barrier levels based on recent high/low ranges and betting on No Touch can yield consistent returns during low-volatility periods.',
    '## Risk Management\nRegardless of strategy, always set a stop loss of 20-30% of your daily budget. Never chase losses with oversized stakes. The best traders are consistent, not aggressive.',
  ],
  'build-first-deriv-bot': [
    'Building your first Deriv bot used to require knowledge of XML and the DBot platform. With RangerTrader\'s no-code builder, you can create a fully functional bot in under 10 minutes.',
    '## Step 1: Choose Your Market\nStart with Volatility 10 Index — it has the lowest volatility and is most predictable for beginners. Avoid Crash/Boom markets until you have experience.',
    '## Step 2: Select a Strategy\nFor beginners, Over/Under is the safest starting point. Set the barrier to 5 (over or under) for a near 50/50 chance.',
    '## Step 3: Set Your Stake\nStart with the minimum stake ($0.35 on Deriv). Never risk more than 1-2% of your account on a single trade.',
    '## Step 4: Configure Martingale\nSet martingale multiplier to 1.5x. This means after a loss, your next stake is 1.5x the previous. Cap it at 5 levels maximum.',
    '## Step 5: Set Take Profit & Stop Loss\nSet take profit at 2x your daily target and stop loss at your daily budget. The bot will automatically stop when either is hit.',
    '## Step 6: Deploy\nClick "Deploy to Deriv" and connect your Deriv account via OAuth. Your bot will start trading immediately.',
  ],
  'boom-crash-market-analysis': [
    'Boom and Crash indices are among the most exciting — and risky — instruments on Deriv. Understanding their mechanics is essential before trading them with bots.',
    '## What are Boom & Crash Indices?\nBoom indices have a spike upward on average every 500 or 1000 ticks. Crash indices have a spike downward on average every 500 or 1000 ticks. The exact timing is random.',
    '## Boom 1000 vs Boom 500\nBoom 1000 spikes less frequently (every ~1000 ticks) but the spikes are larger. Boom 500 spikes more often with smaller moves. For bots, Boom 500 provides more trading opportunities.',
    '## Best Bot Strategies for Boom/Crash\nThe most effective strategy is to trade Rise on Boom indices and Fall on Crash indices — betting that the next spike will occur soon. This works best after a long period without a spike.',
    '## Risk Warning\nBoom and Crash indices are high-risk. A single spike against your position can wipe out multiple wins. Always use strict stop losses and never over-leverage.',
'## Recommended Settings\nFor Boom 1000: Stake $1, Take Profit $20, Stop Loss $10. For Crash 500: Stake $0.5, Take Profit $15, Stop Loss $8. These are conservative settings for learning.',
  ],
  'deriv-for-beginners-guide': [
    'Deriv is one of the most popular online trading platforms in the world, and it is especially beloved by traders in Africa. If you are brand new to trading, this guide will walk you through everything in plain language.',
    '## What is Deriv?',
    'Deriv is an online trading platform founded in 1999. It lets you trade synthetic indices, forex, commodities, and cryptocurrencies. It is regulated in multiple jurisdictions, making it a trusted choice for new traders.',
    '## Why is Deriv so popular?',
    'The biggest draw is synthetic indices — 24/7 markets that are not affected by real-world news. This predictability makes them ideal for automated bots and for beginners learning to trade.',
    '## Account Types',
    'Deriv offers a Demo account (with $10,000 virtual money) for practice, and Real accounts for actual trading. You can also use Deriv MT5 and Deriv X for different trading styles.',
    '## Getting Started',
    'Open a free account with just your email. Start on the demo account, learn the platform, and only move to real money when you are confident.',
    '## A Word of Caution',
    'Trading involves real risk of loss. Never trade with money you cannot afford to lose, and always start small while you learn.',
  ],
  'best-deriv-markets-for-beginners': [
    'Not all Deriv markets are created equal for new traders. Some have chaotic price action that will destroy a beginner\'s account, while others are smooth and predictable.',
    '## Best: Volatility 10',
    'With the lowest volatility of all synthetic indices, Volatility 10 is the safest market for beginners. Its steady, smooth price action is ideal for Over/Under and simple strategies.',
    '## Also Good: Volatility 25',
    'Moderate volatility with more movement than Volatility 10. Great for Rise/Fall and Even/Odd strategies once you have a bit of experience.',
    '## Caution: Boom & Crash',
    'These index spike sharply and randomly. While exciting, they can wipe out a new account quickly. Avoid them until you fully understand spike timing and risk.',
    '## Caution: Volatility 75 & 100',
    'High-volatility markets move fast and can be brutal on beginners. Best left to experienced traders who can manage risk.',
    '## The Bottom Line',
    'Start with Volatility 10, master a simple strategy, and only expand to other markets as your skills and confidence grow.',
  ],
  'what-is-martingale-recovery-strategy': [
    'Martingale is the single most talked-about strategy in automated trading. Understanding it — and its risks — is essential before you use it on a bot.',
    '## What is Martingale?',
    'Martingale is a recovery system that increases your stake after each loss. The idea is that a single win will recover all previous losses plus a small profit.',
    '## How It Works',
    'Start with a base stake. After a loss, multiply your stake by a factor (e.g., 1.5x). After a win, return to the base stake. This "recovers" losses quickly.',
    '## Why It Can Be Dangerous',
    'A long losing streak multiplies your stake rapidly. With a 1.5x multiplier over 5 levels, your total risk can exceed 13x your base stake — potentially blowing past your budget.',
    '## Using It Responsibly',
    'Always cap the number of recovery levels, set a strict daily budget, and use our risk calculator to plan ahead. Martingale is a tool, not a guarantee.',
    '## Final Word',
    'No strategy wins 100% of the time. Martingale can help in the short term, but only responsible risk management keeps you in the game long term.',
  ],
  'how-to-choose-deriv-bot': [
    'With 500+ free bots available, choosing the right one can be overwhelming. Here is a practical framework to pick a bot that matches your goals.',
    '## 1. Match the Risk Level',
    'Start with a low-risk bot on a low-volatility market (like Volatility 10) if you are new. Only consider high-risk bots once you have experience.',
    '## 2. Understand the Strategy',
    'Choose a bot whose strategy you understand. Over/Under is simple; Digit Match is high-risk/high-reward. Learn the strategy before running the bot.',
    '## 3. Check the Market',
    'Pick a bot that trades a market matching your schedule. Synthetic indices run 24/7; forex follows specific sessions.',
    '## 4. Test on Demo',
    'Always run any bot on a Deriv demo account first. Observe its performance over several days before risking real money.',
'## 5. Manage Your Risk',
    'Whatever bot you choose, set a stop loss and take profit. Never risk more than you can afford to lose, regardless of a bot\'s win rate.',
  ],
  'alembert-vs-martingale-vs-oscars-grind': [
    'Recovery (or "progression") strategies are how many automated traders turn a near-50/50 win rate into steady profits. But not all recovery systems are created equal — and the riskiest one, Martingale, is also the most popular.',
    '## Martingale: The Double-or-Nothing\nMartingale doubles your stake after every loss. One win recovers all previous losses plus a profit. The problem: after just 5 consecutive losses your stake has grown 32x. A long losing streak can wipe out your entire bankroll.',
    '## Alembert: The Flat Progression\nAlembert increases your stake by just one fixed unit after a loss, and decreases it by one unit after a win. Risk grows linearly, not exponentially. It is far safer for beginners, though it recovers losses more slowly.',
    '## Oscar&apos;s Grind: Only Increase After Wins\nOscar&apos;s Grind only increases your stake after a win, and resets once you reach your profit target. Because you never compound on losses, it is one of the safest progression systems available.',
    '## Which Should You Choose?\nIf you have a large budget and trade short, aggressive sessions, Martingale can work — but only with a strict cap. If you want steady, low-risk growth, Alembert or Oscar&apos;s Grind are the smarter, safer choices.',
    '## The Golden Rule\nWhatever system you use, always cap your maximum stake and set a hard stop loss. No recovery strategy is guaranteed. Only trade money you can afford to lose.',
  ],
  'what-is-alembert-strategy': [
    'The Alembert (or D&apos;Alembert) strategy is a flat-progression recovery method that is significantly safer than Martingale. Instead of doubling your stake after every loss, you only increase it by a single fixed unit.',
    '## How Alembert Works\nWith a $1 base stake: after a loss your next stake becomes $2, then $3, $4, and so on. After a win, you step back down by one unit. This keeps your risk growing slowly and linearly rather than exponentially.',
    '## Why It&apos;s Safer Than Martingale\nAfter 5 losses, Martingale would have you staking 32x your base. Alembert would only have you at 6x. This dramatically reduces the chance that a losing streak wipes out your account.',
    '## Best Markets for Alembert\nAlembert works best on near-50/50 strategies like Over/Under or Even/Odd on low-volatility indices (Volatility 10, Volatility 25), where your win rate is stable enough for the flat progression to succeed.',
    '## The Trade-Off\nAlembert recovers losses more slowly than Martingale. It requires patience and enough trades to smooth out variance. But for most traders, that slow, steady approach is exactly what makes it sustainable.',
    '## Try It With a Bot\nYou can automate Alembert easily. Use our risk calculator to plan your stake sequence, then apply it to a matching bot from our recommended list.',
  ],
}

const CATEGORY_COLORS: Record<string, 'green' | 'blue' | 'yellow' | 'gold'> = {
  strategy: 'green',
  tutorial: 'blue',
  market_analysis: 'yellow',
  news: 'gold',
}

const CATEGORY_LABELS: Record<string, string> = {
  strategy: 'Strategy',
  tutorial: 'Tutorial',
  market_analysis: 'Market Analysis',
  news: 'News',
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = ALL_POSTS.find((p) => p.slug === params.slug) ?? ALL_POSTS[0]
  const content = FULL_CONTENT[post.slug] ?? FULL_CONTENT[ALL_POSTS[0].slug]
  const related = ALL_POSTS.filter((p) => p.slug !== post.slug)

  const headings = content
    .filter((p) => p.startsWith('## '))
    .map((p) => p.replace('## ', ''))

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <div className="grid lg:grid-cols-4 gap-10">
          {/* Article */}
          <article className="lg:col-span-3">
            {/* Cover */}
            <div className="w-full h-56 rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 border border-border flex items-center justify-center mb-8">
              <div className="text-7xl">📈</div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant={CATEGORY_COLORS[post.category] || 'default'}>
                <Tag className="w-3 h-3 mr-1" />
                {CATEGORY_LABELS[post.category]}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="w-3 h-3" />
                {post.read_time} min read
              </div>
              <span className="text-muted-foreground text-xs">{post.published_at}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{post.excerpt}</p>

            {/* Content */}
            <div className="prose prose-invert max-w-none space-y-5">
              {content.map((block, i) => {
                if (block.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-xl font-bold text-white mt-8 mb-3 pt-4 border-t border-border">
                      {block.replace('## ', '')}
                    </h2>
                  )
                }
                return (
                  <p key={i} className="text-muted-foreground leading-relaxed text-base">
                    {block}
                  </p>
                )
              })}
            </div>

            {/* Share */}
            <div className="mt-10 pt-6 border-t border-border flex items-center gap-3">
              <span className="text-muted-foreground text-sm">Share:</span>
              {['Twitter/X', 'Telegram', 'WhatsApp'].map((s) => (
                <button key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-white hover:border-primary/50 text-xs transition-all">
                  <Share2 className="w-3 h-3" />
                  {s}
                </button>
              ))}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Table of contents */}
            {headings.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
                <h3 className="text-white font-bold text-sm mb-4">Table of Contents</h3>
                <ul className="space-y-2">
                  {headings.map((h, i) => (
                    <li key={i}>
                      <a href={`#${h.toLowerCase().replace(/\s+/g, '-')}`} className="text-muted-foreground hover:text-primary text-xs transition-colors leading-relaxed block">
                        {i + 1}. {h}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related posts */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-white font-bold text-sm mb-4">Related Articles</h3>
              <div className="space-y-4">
                {related.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="block group">
                    <div className="text-white text-xs font-medium group-hover:text-primary transition-colors leading-snug mb-1">
                      {p.title}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />
                      {p.read_time} min read
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  )
}
