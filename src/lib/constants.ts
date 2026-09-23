export const BRAND_NAME = 'SniperTraders'
export const BRAND_TAGLINE = 'Direct Execution Deriv Trading Companion'

const affiliateToken = process.env.NEXT_PUBLIC_DERIV_AFFILIATE_TOKEN || 'FA33FFDD-3AFC-47A5-BDD5-E838068CEE7A'
const campaign = process.env.NEXT_PUBLIC_DERIV_CAMPAIGN || 'dynamicworks'

const configuredAppId = process.env.NEXT_PUBLIC_DERIV_APP_ID?.trim()

// App 1089 is useful for local development only; production must use a registered app.
export const DERIV_APP_ID = configuredAppId || (process.env.NODE_ENV === 'production' ? '' : '1089')
export const DERIV_AFFILIATE_TOKEN = affiliateToken
export const DERIV_CAMPAIGN = campaign

export function getRequiredDerivAppId() {
  if (!DERIV_APP_ID) {
    throw new Error('NEXT_PUBLIC_DERIV_APP_ID is required in production.')
  }
  return DERIV_APP_ID
}

// Partner registration link
export const DERIV_AFFILIATE_LINK =
  process.env.NEXT_PUBLIC_DERIV_PARTNER_LINK ||
  process.env.NEXT_PUBLIC_DERIV_AFFILIATE_LINK ||
  'https://deriv.partners/rx?sidc=FA33FFDD-3AFC-47A5-BDD5-E838068CEE7A&utm_campaign=dynamicworks&utm_medium=affiliate&utm_source=CU334550'

export const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/TRENDIF'
export const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/254107646264'

// Deriv Cashier deep links
export const DERIV_CASHIER_DEPOSIT_URL = 'https://app.deriv.com/cashier/deposit'
export const DERIV_CASHIER_WITHDRAW_URL = 'https://app.deriv.com/cashier/withdrawal'
export const DERIV_CASHIER_TRANSFER_URL = 'https://app.deriv.com/cashier/account-transfer'

/**
 * Deriv OAuth 2.0 authorization URL generator
 */
export function getDerivOAuthUrl(origin: string, state?: string) {
  const appId = getRequiredDerivAppId()
  const url = new URL('https://oauth.deriv.com/oauth2/authorize')
  url.searchParams.set('app_id', appId)
  if (DERIV_AFFILIATE_TOKEN) url.searchParams.set('affiliate_token', DERIV_AFFILIATE_TOKEN)
  if (DERIV_CAMPAIGN) url.searchParams.set('utm_campaign', DERIV_CAMPAIGN)
  url.searchParams.set('redirect_uri', `${origin}/auth/deriv/callback`)
  if (state) url.searchParams.set('state', state)
  return url.toString()
}

/**
 * Partner attribution link with per-page UTM tag
 */
export function getAffiliateLink(page: string) {
  try {
    const url = new URL(DERIV_AFFILIATE_LINK)
    url.searchParams.set('utm_source', 'CU334550')
    url.searchParams.set('utm_medium', 'affiliate')
    url.searchParams.set('utm_campaign', campaign)
    url.searchParams.set('utm_content', page)
    return url.toString()
  } catch {
    return DERIV_AFFILIATE_LINK
  }
}
