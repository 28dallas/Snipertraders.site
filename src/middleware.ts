import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/blog', '/pricing', '/about', '/contact', '/affiliate', '/refer', '/terms', '/privacy', '/cookies', '/disclaimer', '/docs', '/comparisons', '/strategies', '/auth/login', '/auth/signup', '/auth/deriv/callback']

const isPublicPath = (pathname: string) => {
  if (pathname === '/') return true
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const sessionCookie =
    request.cookies.get('ranger_deriv_session')?.value ||
    request.cookies.get('pips_deriv_session')?.value

  if (!sessionCookie) {
    const url = new URL('/', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  try {
    const decoded = decodeURIComponent(sessionCookie)
    const parsed = JSON.parse(decoded) as { account?: string; token?: string; createdAt?: string }

    if (!parsed.account || !parsed.token || !parsed.createdAt) {
      const url = new URL('/', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  } catch {
    const url = new URL('/', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/tools/:path*', '/learn/:path*', '/bots/:path*', '/copy-trading/:path*'],
}
