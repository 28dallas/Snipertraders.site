import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'ranger_deriv_auth'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export async function POST(request: NextRequest) {
  const secret = process.env.DERIV_SESSION_SECRET
  if (!secret) return NextResponse.json({ error: 'Session signing is not configured' }, { status: 503 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.account !== 'string' || typeof body.createdAt !== 'string') {
    return NextResponse.json({ error: 'Invalid session payload' }, { status: 400 })
  }

  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS
  const payload = `${body.account}.${body.createdAt}.${expiresAt}`
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
  return response
}

