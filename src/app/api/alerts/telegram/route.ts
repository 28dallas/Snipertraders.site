import { NextRequest, NextResponse } from 'next/server'

const CHAT_ID_PATTERN = /^-?\d{5,20}$/
const recentRequests = new Map<string, number>()

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('ranger_deriv_auth')?.value
  if (!sessionCookie && process.env.NEXT_PUBLIC_PREVIEW_MODE !== 'true') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const requestKey = sessionCookie || request.headers.get('x-forwarded-for') || 'preview'
  const lastRequest = recentRequests.get(requestKey) ?? 0
  if (Date.now() - lastRequest < 10_000) {
    return NextResponse.json({ error: 'Please wait before sending another alert' }, { status: 429 })
  }
  recentRequests.set(requestKey, Date.now())

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken || botToken === 'your_telegram_bot_token') {
    return NextResponse.json({ error: 'Telegram delivery is not configured' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const chatId = typeof body?.chatId === 'string' ? body.chatId.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!CHAT_ID_PATTERN.test(chatId) || !message || message.length > 4096) {
    return NextResponse.json({ error: 'Invalid Telegram alert payload' }, { status: 400 })
  }

  const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, disable_web_page_preview: true }),
  })
  if (!response.ok) return NextResponse.json({ error: 'Telegram rejected the alert' }, { status: 502 })
  return NextResponse.json({ sent: true })
}
