import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/blog', '/pricing', '/about', '/contact', '/affiliate', '/refer', '/terms', '/privacy', '/cookies', '/disclaimer', '/docs', '/comparisons', '/strategies', '/tools', '/auth/login', '/auth/signup', '/auth/deriv/callback']
// Preview is the current hosted product mode. Set NEXT_PUBLIC_PREVIEW_MODE=false
// in Vercel when real authentication is ready to become mandatory.
const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE !== 'false'

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function hasSignedSession(value: string | undefined) {
  const secret = process.env.DERIV_SESSION_SECRET
  if (!value || !secret) return false
  const parts = value.split('.')
  if (parts.length < 4) return false
  const signature = parts.pop()!
  const payload = parts.join('.')
  const expiresAt = Number(parts[2])
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false

  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  return crypto.subtle.verify('HMAC', key, decodeBase64Url(signature), new TextEncoder().encode(payload))
}

const isPublicPath = (pathname: string) => {
  if (pathname === '/') return true
  if (PREVIEW_MODE && (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))) return true
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/api/webhooks/deriv' || pathname === '/api/auth/deriv-session') {
    return NextResponse.next()
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('ranger_deriv_auth')?.value

  if (!(await hasSignedSession(sessionCookie))) {
    const url = new URL('/', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/tools/:path*', '/learn/:path*', '/bots/:path*', '/copy-trading/:path*'],
}
