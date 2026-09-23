'use client'

export interface DerivAccountItem {
  account: string
  token: string
  currency: string
  isVirtual: boolean
}

export interface DerivSession {
  account: string
  token: string
  createdAt: string
  loginid?: string
  balance?: number
  currency?: string
  is_virtual?: boolean
  accounts?: DerivAccountItem[]
}

const PRIMARY_KEY = 'ranger-deriv-session'
const LEGACY_KEY = 'pips-deriv-session'

export const DERIV_SESSION_COOKIE = 'ranger_deriv_session'
export const LEGACY_DERIV_SESSION_COOKIE = 'pips_deriv_session'

function parseSessionString(raw: string | null | undefined): DerivSession | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<DerivSession>
    if (!parsed.account || !parsed.token || !parsed.createdAt) return null
    return {
      account: parsed.account,
      token: parsed.token,
      createdAt: parsed.createdAt,
      loginid: parsed.loginid || parsed.account,
      balance: parsed.balance,
      currency: parsed.currency || 'USD',
      is_virtual: parsed.is_virtual ?? parsed.account.startsWith('VRT'),
      accounts: parsed.accounts,
    }
  } catch {
    return null
  }
}

export function saveDerivSession(session: DerivSession) {
  const payload = JSON.stringify(session)
  try {
    sessionStorage.setItem(PRIMARY_KEY, payload)
  } catch {
    // ignore
  }

  if (typeof document === 'undefined') return

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  const encoded = encodeURIComponent(payload)
  document.cookie = `${DERIV_SESSION_COOKIE}=${encoded}; Path=/; Max-Age=604800; SameSite=Lax${secure}`
  document.cookie = `${LEGACY_DERIV_SESSION_COOKIE}=${encoded}; Path=/; Max-Age=604800; SameSite=Lax${secure}`
}

export function getDerivSessionFromCookieValue(value: string | null | undefined): DerivSession | null {
  return parseSessionString(value)
}

export function hasValidDerivSession(value: string | null | undefined): boolean {
  return !!getDerivSessionFromCookieValue(value)
}

export function getDerivSession(): DerivSession | null {
  try {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(PRIMARY_KEY) || sessionStorage.getItem(LEGACY_KEY)
      if (saved) return JSON.parse(saved) as DerivSession
    }

    if (typeof document === 'undefined') return null

    const cookieRow = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${DERIV_SESSION_COOKIE}=`) || entry.startsWith(`${LEGACY_DERIV_SESSION_COOKIE}=`))

    if (!cookieRow) return null

    return getDerivSessionFromCookieValue(decodeURIComponent(cookieRow.split('=')[1]))
  } catch {
    return null
  }
}

export function clearDerivSession() {
  try {
    sessionStorage.removeItem(PRIMARY_KEY)
    sessionStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore
  }

  if (typeof document !== 'undefined') {
    document.cookie = `${DERIV_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
    document.cookie = `${LEGACY_DERIV_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
  }
}
