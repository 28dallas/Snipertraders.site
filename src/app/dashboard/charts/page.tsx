'use client'

import { useState, useEffect } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Area
} from 'recharts'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react'
import { derivWS, DerivTick, DerivCandle } from '@/lib/deriv-websocket'

const MARKETS = [
  { label: 'Volatility 10 (1s)', symbol: '1HZ10V' },
  { label: 'Volatility 25 (1s)', symbol: '1HZ25V' },
  { label: 'Volatility 50 (1s)', symbol: '1HZ50V' },
  { label: 'Volatility 75 (1s)', symbol: '1HZ75V' },
  { label: 'Volatility 100 (1s)', symbol: '1HZ100V' },
  { label: 'Volatility 10', symbol: 'R_10' },
  { label: 'Volatility 50', symbol: 'R_50' },
  { label: 'Volatility 75', symbol: 'R_75' },
  { label: 'Volatility 100', symbol: 'R_100' },
]

const TIMEFRAMES = [
  { label: '1M', granularity: 60 },
  { label: '5M', granularity: 300 },
  { label: '15M', granularity: 900 },
  { label: '1H', granularity: 3600 },
]

interface ChartCandle {
  time: string
  open: number
  high: number
  low: number
  close: number
  bullish: boolean
  epoch: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d: ChartCandle = payload[0]?.payload
    if (!d) return null
    return (
      <div className="bg-[#0d1424] border border-[#1e2a40] rounded-xl p-3 text-xs space-y-1 shadow-xl font-mono">
        <p className="text-muted-foreground font-sans font-medium">{d.time}</p>
        <p className="text-white">Open: <span className="font-bold">{d.open.toFixed(4)}</span></p>
        <p className="text-profit">High: <span className="font-bold">{d.high.toFixed(4)}</span></p>
        <p className="text-loss">Low: <span className="font-bold">{d.low.toFixed(4)}</span></p>
        <p className={d.bullish ? 'text-profit' : 'text-loss'}>
          Close: <span className="font-bold">{d.close.toFixed(4)}</span>
        </p>
      </div>
    )
  }
  return null
}

export default function ChartsPage() {
  const [market, setMarket] = useState(MARKETS[0])
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0])
  const [candles, setCandles] = useState<ChartCandle[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)

  // Fetch real candles from Deriv API and listen for live ticks
  useEffect(() => {
    let active = true
    setLoading(true)

    derivWS
      .candlesHistory(market.symbol, 60, timeframe.granularity)
      .then((res: any) => {
        if (!active) return
        const rawCandles = res?.candles
        if (Array.isArray(rawCandles) && rawCandles.length > 0) {
          const parsed: ChartCandle[] = rawCandles.map((c: DerivCandle) => ({
            time: new Date(c.epoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            open: parseFloat(c.open as any),
            high: parseFloat(c.high as any),
            low: parseFloat(c.low as any),
            close: parseFloat(c.close as any),
            bullish: c.close >= c.open,
            epoch: c.epoch,
          }))
          setCandles(parsed)
          setCurrentPrice(parsed[parsed.length - 1]?.close || 0)
          setWsConnected(true)
        }
      })
      .catch((err) => {
        console.warn('[Charts] Candles fallback:', err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Subscribe to live streaming ticks
    const unsub = derivWS.subscribeTicks(market.symbol, (tick: DerivTick) => {
      if (!active) return
      setWsConnected(true)
      const quote = tick.quote
      setCurrentPrice(quote)

      setCandles((prev) => {
        if (prev.length === 0) return prev
        const last = { ...prev[prev.length - 1] }
        last.high = Math.max(last.high, quote)
        last.low = Math.min(last.low, quote)
        last.close = quote
        last.bullish = last.close >= last.open
        return [...prev.slice(0, -1), last]
      })
    })

    return () => {
      active = false
      unsub()
    }
  }, [market, timeframe])

  const firstCandle = candles[0]
  const lastCandle = candles[candles.length - 1]
  const priceChange = firstCandle ? currentPrice - firstCandle.open : 0
  const isBullish = priceChange >= 0

  const high24 = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : 0
  const low24 = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Live Market Charts
          </h1>
          <p className="text-muted-foreground text-xs">
            Real-time OHLC candlestick charting directly from Deriv WebSocket feed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-profit animate-pulse' : 'bg-warning'}`} />
          <Badge variant={wsConnected ? 'green' : 'yellow'} className="text-xs">
            {wsConnected ? 'LIVE WS CONNECTED' : 'CONNECTING...'}
          </Badge>
        </div>
      </div>

      {/* Market Selector Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {MARKETS.map((m) => (
          <button
            key={m.symbol}
            type="button"
            onClick={() => setMarket(m)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all shrink-0 ${
              market.symbol === m.symbol
                ? 'bg-primary text-black shadow-glow-sm'
                : 'bg-[#0d1424] border border-[#1e2a40] text-slate-400 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Price Banner */}
      <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-muted-foreground text-xs font-semibold uppercase">
              {market.label} ({market.symbol})
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
              {currentPrice ? currentPrice.toFixed(4) : 'Loading...'}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-mono font-bold mt-1 ${
                isBullish ? 'text-profit' : 'text-loss'
              }`}
            >
              {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isBullish ? '+' : ''}{priceChange.toFixed(4)} (
              {firstCandle?.open ? ((priceChange / firstCandle.open) * 100).toFixed(2) : 0}%)
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono">
            <div>
              <div className="text-muted-foreground text-[11px]">Period High</div>
              <div className="text-profit font-bold">{high24.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px]">Period Low</div>
              <div className="text-loss font-bold">{low24.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px]">Candles</div>
              <div className="text-white font-bold">{candles.length}</div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex bg-[#121829] border border-[#1e2a40] rounded-xl overflow-hidden">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-bold font-mono transition-colors ${
                  timeframe.label === tf.label
                    ? 'bg-primary text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Candlestick / Area Chart */}
      <Card className="p-4 bg-[#0d1424] border-[#1e2a40]">
        {loading ? (
          <div className="h-[380px] flex items-center justify-center text-xs text-muted-foreground gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            Loading Deriv candle stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={candles} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d2b4" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00d2b4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a40" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.toFixed(2)}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={currentPrice} stroke="#00d2b4" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="close" stroke="#00d2b4" strokeWidth={2.5} fill="url(#chartFill)" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
