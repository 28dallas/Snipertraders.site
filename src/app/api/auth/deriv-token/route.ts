import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_DERIV_CLIENT_ID?.trim()
  if (!clientId) return NextResponse.json({ error: 'Deriv OAuth is not configured.' }, { status: 503 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.code !== 'string' || typeof body.code_verifier !== 'string' || typeof body.redirect_uri !== 'string') {
    return NextResponse.json({ error: 'Missing authorization parameters.' }, { status: 400 })
  }
  let redirectUri: URL
  try {
    redirectUri = new URL(body.redirect_uri)
  } catch {
    return NextResponse.json({ error: 'Invalid redirect URI.' }, { status: 400 })
  }
  if (redirectUri.pathname !== '/auth/deriv/callback' || !['https:', 'http:'].includes(redirectUri.protocol)) {
    return NextResponse.json({ error: 'Invalid redirect URI.' }, { status: 400 })
  }
  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
  if (redirectUri.origin !== new URL(configuredSite).origin) {
    return NextResponse.json({ error: 'Redirect URI does not match the configured site.' }, { status: 400 })
  }

  try {
    const response = await fetch('https://auth.deriv.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code: body.code,
        code_verifier: body.code_verifier,
        redirect_uri: body.redirect_uri,
      }),
      cache: 'no-store',
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || typeof data.access_token !== 'string') {
      return NextResponse.json({ error: data.error_description || data.error || 'Deriv token exchange failed.' }, { status: 400 })
    }
    return NextResponse.json({ access_token: data.access_token, expires_in: data.expires_in })
  } catch {
    return NextResponse.json({ error: 'Could not reach Deriv authentication.' }, { status: 502 })
  }
}
