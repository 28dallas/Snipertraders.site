# TODO: Deriv Affiliate Educational Hub Transformation

## Phase 1 - Shared Components
- [x] Create `src/components/learn/InfoCard.tsx`
- [x] Create `src/components/learn/StepGuide.tsx`
- [x] Create `src/components/learn/YouTubeEmbed.tsx`
- [x] Create `src/components/learn/EducationalCTA.tsx`
- [x] Create `src/components/learn/RiskCalculator.tsx`
- [x] Create `src/components/learn/RelatedTools.tsx`
- [x] Create `src/components/learn/AffiliateDisclosure.tsx`
- [x] Create `src/components/learn/Newsletter.tsx`
- [x] Create `src/components/learn/ComparisonPage.tsx`

## Phase 2 - Data Layer
- [x] Create `src/lib/learn-data.ts`
- [x] Create `src/lib/comparison-data.ts`

## Phase 3 - New Pages
- [x] Create `/learn` - `src/app/learn/page.tsx`
- [x] Create `/learn/deriv-basics` - `src/app/learn/deriv-basics/page.tsx`
- [x] Create `/strategies` - `src/app/strategies/page.tsx`
- [x] Create `/strategies/[slug]` - `src/app/strategies/[slug]/page.tsx`
- [x] Create `/tools/risk-calculator` - `src/app/tools/risk-calculator/page.tsx`
- [x] Create `/tools/trading-times` - `src/app/tools/trading-times/page.tsx`
- [x] Create `/bots/recommended` - `src/app/bots/recommended/page.tsx`
- [x] Create `/refer` - `src/app/refer/page.tsx`
- [x] Create `/comparisons/deriv-vs-pocketoption` - SEO comparison page
- [x] Create `/comparisons/deriv-vs-binomo` - SEO comparison page
- [x] Create `/comparisons/deriv-vs-olymptrade` - SEO comparison page

## Phase 4 - Upgrade Existing Pages
- [x] Update `src/app/layout.tsx` - educational metadata
- [x] Update `src/components/layout/Navbar.tsx` - add Learn/Strategies/Tools
- [x] Update `src/components/layout/Footer.tsx` - add educational links
- [x] Update `src/app/page.tsx` - add StartLearningSection
- [x] Update `src/components/sections/HeroSection.tsx` - learning path CTA
- [x] Update `src/app/bots/page.tsx` - educational content
- [x] Update `src/app/blog/page.tsx` - beginner posts
- [x] Update `src/app/affiliate/page.tsx` - referral upgrade
- [x] Update `src/app/sitemap.ts` - new routes

## Phase 5 - Verification
- [x] `npm run build` — compiled successfully, types passed, 52 static pages generated
- [x] Educational pages all generate without errors
- [x] Pre-existing Supabase env error on `/auth/login` & `/auth/signup` (needs `.env.local`, unrelated to this task)

## Phase 6 - Reference-Inspired Enhancements
- [x] Added Alembert & Oscar's Grind recovery strategies to `/strategies` & `/strategies/[slug]`
- [x] Added strategy comparison section to risk calculator (Martingale vs Alembert vs Oscar's Grind)
- [x] Added recovery-strategy blog posts (Alembert vs Martingale, What is Alembert)
- [x] Updated sitemap with new strategy slugs
- [x] Final `npm run build` verification — completed successfully, 52 pages generated, all routes present

## Phase 7 - Floating AI Trading Assistant
- [x] Created `src/components/learn/FloatingAI.tsx` — floating chat widget (like snipertraders.com's LiveChat)
- [x] Rule-based AI answers about markets, strategies, martingale, risk, bots, and account setup
- [x] Quick-action chips for common questions
- [x] Added to `src/app/layout.tsx` so it floats on every page (bottom-left, no overlap with account CTA)
- [x] Built with inline bold rendering and typing indicator
- [x] `npm run build` verified — compiled, types passed, 52/52 pages generated

## Phase 8 - Affiliate Conversion Steering in AI
- [x] AI account answers now explicitly direct users to the on-site "Open Free Deriv Account" button (your affiliate link) instead of Deriv.com
- [x] Persistent green affiliate CTA bar at the top of the chat panel (always visible)
- [x] Post-answer affiliate CTA card appears after account-related questions
- [x] Added "How do I open an account?" quick-action chip
- [x] All affiliate CTAs use `DERIV_AFFILIATE_LINK` from constants
- [x] `npm run build` verified — compiled successfully, types passed

## Phase 9 - Feature Improvements
- [x] **Risk Calculator multi-recovery support** — `src/components/learn/RiskCalculator.tsx` now supports Martingale, Alembert, and Oscar's Grind recovery strategies with dynamic labels, examples, and per-strategy educational info
- [x] **New `/comparisons` index page** — `src/app/comparisons/page.tsx` card layout linking Deriv vs Pocket Option, Binomo, and Olymp Trade with SEO metadata
- [x] **RelatedTools updated** — now shows 6 tools (added Platform Comparisons), fixed strategy count to 7, updated Risk Calculator description
- [x] **Sitemap updated** — added `/comparisons` and all 3 comparison detail pages
- [x] **Navbar Learn section** — added "Comparisons" link with Scale icon (desktop + mobile)
- [x] **Footer Learn section** — added "Comparisons" link
- [x] **Learn page** — fixed strategy count from "Five" to "Seven"
- [x] **Risk calculator page copy** — updated hero and education cards to mention all 3 recovery strategies
- [x] **Floating AI enhanced** — new answers for Alembert, Oscar's Grind, payouts, platform comparisons, risk management; cleaned indentation
- [x] `npm run build` verified — compiled successfully, types passed, 53/53 static pages generated
