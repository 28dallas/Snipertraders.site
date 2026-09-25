import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

/**
 * Placeholder webhook endpoint for future Deriv API integration.
 * Accepts trade events, balance updates, and copy-trading signals.
 */
export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.DERIV_WEBHOOK_SECRET
    const providedSecret = request.headers.get('x-deriv-webhook-secret')
    if (!configuredSecret || !providedSecret) {
      return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 })
    }
    const expected = Buffer.from(configuredSecret)
    const received = Buffer.from(providedSecret)
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    return NextResponse.json({
      status: 'received',
      message: 'Webhook authenticated; event processing is not enabled yet.',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/deriv',
    status: process.env.DERIV_WEBHOOK_SECRET ? 'configured' : 'disabled',
    description: 'POST requests require the x-deriv-webhook-secret header.',
  })
}
