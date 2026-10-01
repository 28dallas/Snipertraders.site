import { DerivAccountItem } from '@/lib/deriv-session'

export async function fetchDerivAccounts(token: string): Promise<DerivAccountItem[]> {
  const response = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.errors?.[0]?.message || data?.error || 'Deriv could not load your trading accounts.'
    throw new Error(message)
  }

  const rawAccounts = data.data?.accounts || data.data || data.accounts || []
  if (!Array.isArray(rawAccounts)) throw new Error('Deriv returned accounts in an unsupported format.')

  return rawAccounts.map((item: any) => {
    const account = String(item.account_id || item.id || item.loginid || item.account || '')
    const type = String(item.account_type || item.type || '').toLowerCase()
    return {
      account,
      token,
      currency: item.currency || item.currency_code || 'USD',
      isVirtual: type.includes('demo') || type.includes('virtual') || account.startsWith('VRTC'),
      balance: Number(typeof item.balance === 'object' ? item.balance?.amount ?? 0 : item.balance ?? 0),
    } satisfies DerivAccountItem
  }).filter((item: DerivAccountItem) => item.account)
}
