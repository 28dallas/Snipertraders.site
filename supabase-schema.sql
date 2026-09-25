-- ============================================
-- Pips Dollar Printer - Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
  referral_code TEXT UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  telegram_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- BOTS LIBRARY
-- ============================================
CREATE TABLE bots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  market TEXT NOT NULL,
  strategy_type TEXT NOT NULL,
  win_rate DECIMAL(5,2) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  download_count INTEGER DEFAULT 0,
  xml_content TEXT,
  description TEXT,
  is_free BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER BOTS (deployed bots)
-- ============================================
CREATE TABLE user_bots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bot_id UUID REFERENCES bots(id),
  status TEXT DEFAULT 'stopped' CHECK (status IN ('running', 'paused', 'stopped')),
  stake DECIMAL(10,2) DEFAULT 1.00,
  take_profit DECIMAL(10,2) DEFAULT 100.00,
  stop_loss DECIMAL(10,2) DEFAULT 50.00,
  deployed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRADERS (copy trading profiles)
-- ============================================
CREATE TABLE traders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  win_rate DECIMAL(5,2) DEFAULT 0,
  monthly_roi DECIMAL(5,2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  max_drawdown DECIMAL(5,2) DEFAULT 0,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  followers INTEGER DEFAULT 0,
  subscription_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COPY SUBSCRIPTIONS
-- ============================================
CREATE TABLE copy_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trader_id UUID REFERENCES traders(id) ON DELETE CASCADE NOT NULL,
  max_stake DECIMAL(10,2) DEFAULT 5.00,
  daily_loss_limit DECIMAL(10,2) DEFAULT 50.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, trader_id)
);

-- ============================================
-- TRADES
-- ============================================
CREATE TABLE trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bot_id UUID REFERENCES user_bots(id),
  market TEXT NOT NULL,
  direction TEXT NOT NULL,
  stake DECIMAL(10,2) NOT NULL,
  result TEXT CHECK (result IN ('win', 'loss')),
  profit_loss DECIMAL(10,2),
  traded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'elite')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  method TEXT CHECK (method IN ('mpesa', 'card')),
  mpesa_ref TEXT,
  mpesa_checkout_id TEXT,
  plan TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOG POSTS
-- ============================================
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  category TEXT CHECK (category IN ('strategy', 'tutorial', 'market_analysis', 'news')),
  author_id UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  cover_image TEXT,
  read_time INTEGER DEFAULT 5
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User bots: own bots only
CREATE POLICY "Users can manage own bots" ON user_bots FOR ALL USING (auth.uid() = user_id);

-- Copy subscriptions: own subscriptions only
CREATE POLICY "Users can manage own copy subs" ON copy_subscriptions FOR ALL USING (auth.uid() = follower_id);

-- Trades: own trades only
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: own subscription only
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Payments: own payments only
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Bots: public read
CREATE POLICY "Bots are publicly readable" ON bots FOR SELECT USING (true);

-- Traders: public read
ALTER TABLE traders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Traders are publicly readable" ON traders FOR SELECT USING (true);

-- Posts: public read
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (true);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_traded_at ON trades(traded_at DESC);
CREATE INDEX idx_user_bots_user_id ON user_bots(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_bots_market ON bots(market);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category);
