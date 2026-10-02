'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { DerivAccountItem, DerivSession, saveDerivSession } from '@/lib/deriv-session'
import { derivWS } from '@/lib/deriv-websocket'
import { fetchDerivAccounts } from '@/lib/deriv-accounts'
import { useTradingStore } from '@/stores/trading-store'

function CallbackContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('Finishing secure Deriv sign-in...')
  const setAccount = useTradingStore((s) => s.setAccount)
  const handledCallback = useRef(false)

  useEffect(() => {
    // Clearing the OAuth URL updates Next's search params. Without this guard,
    // the effect runs again with an empty URL and shows a false failure after
    // the account has already connected.
    if (handledCallback.current) return
    handledCallback.current = true

    async function handleAuth() {
      // Deriv OAuth2 returns query parameters. Legacy Deriv OAuth redirects may
      // return acct/token parameters in the fragment, which Next's searchParams
      // does not include.
      const fragmentParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const getParam = (key: string) => params.get(key) ?? fragmentParams.get(key)
      const returnedState = getParam('state')
      const expectedState = sessionStorage.getItem('deriv_oauth_state')
      const code = getParam('code')
      const verifier = sessionStorage.getItem('deriv_oauth_verifier')
      const redirectUri = sessionStorage.getItem('deriv_oauth_redirect_uri')
      window.history.replaceState({}, document.title, '/auth/deriv/callback')

      if (expectedState) {
        sessionStorage.removeItem('deriv_oauth_state')
        sessionStorage.removeItem('deriv_oauth_verifier')
        sessionStorage.removeItem('deriv_oauth_redirect_uri')
      }

      if (expectedState && returnedState !== expectedState) {
        setError('Deriv authorization could not be verified. Please start again.')
        return
      }

      if (process.env.NODE_ENV === 'development') {
        const safeParams = Object.fromEntries(
          Array.from(params.entries()).map(([key, value]) => [
            key,
            key.toLowerCase().includes('token') ? '[redacted]' : value,
          ])
        )
        console.info('[OAuth Callback] Query parameters:', safeParams)
      }

      const derivError = getParam('error')
      if (derivError) {
        const description = getParam('error_description')
        setError(description ? `Deriv authorization failed: ${description}` : `Deriv authorization failed: ${derivError}`)
        return
      }

      if (code) {
        if (!expectedState || !verifier || !redirectUri || returnedState !== expectedState) {
          setError('Deriv authorization could not be verified. Please start again.')
          return
        }
        try {
          setStatusMessage('Completing secure Deriv sign-in...')
          const tokenResponse = await fetch('/api/auth/deriv-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, code_verifier: verifier, redirect_uri: redirectUri }),
          })
          const tokenData = await tokenResponse.json()
          if (!tokenResponse.ok || !tokenData.access_token) throw new Error(tokenData.error || 'Could not complete Deriv sign-in.')

          setStatusMessage('Loading your Deriv accounts and balances...')
          const accountsList: DerivAccountItem[] = await fetchDerivAccounts(tokenData.access_token)
          if (!accountsList.length) throw new Error('No Deriv trading accounts were returned.')

          const primary = accountsList.find((item) => !item.isVirtual) || accountsList[0]
          const balance = Number(primary.balance ?? 0)
          const currency = primary.currency
          const loginid = primary.account
          const session: DerivSession = {
            account: loginid,
            token: tokenData.access_token,
            createdAt: new Date().toISOString(),
            loginid,
            balance,
            currency,
            is_virtual: primary.isVirtual,
            accounts: accountsList,
          }
          await saveDerivSession(session)
          setAccount({ loginid, token: tokenData.access_token, balance, currency, isVirtual: session.is_virtual, accounts: accountsList, isConnected: true })
          setStatusMessage('Signed in successfully. Redirecting to your dashboard...')
          setTimeout(() => router.replace('/dashboard'), 600)
          return
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Deriv authorization could not be completed.')
          return
        }
      }

      // Legacy OAuth callback support for previously registered Deriv apps.
      const accountsList: DerivAccountItem[] = []
      let idx = 1
      while (getParam(`token${idx}`) && getParam(`acct${idx}`)) {
        const acct = getParam(`acct${idx}`)!
        const token = getParam(`token${idx}`)!
        const cur = getParam(`cur${idx}`) || 'USD'
        accountsList.push({
          account: acct,
          token,
          currency: cur,
          isVirtual: acct.startsWith('VRT'),
        })
        idx++
      }

      if (accountsList.length === 0) {
        // Check single token or fallback
        const singleToken = getParam('token1') || getParam('token')
        const singleAcct = getParam('acct1') || getParam('acct')
        if (singleToken && singleAcct) {
          accountsList.push({
            account: singleAcct,
            token: singleToken,
            currency: getParam('cur1') || 'USD',
            isVirtual: singleAcct.startsWith('VRT'),
          })
        }
      }

      if (accountsList.length === 0) {
        console.warn('[Deriv OAuth] Callback contained no recognized credentials.', {
          queryKeys: Array.from(params.keys()),
          fragmentKeys: Array.from(fragmentParams.keys()),
        })
        setError('Deriv returned no authorization code or account token. Check that the OAuth app is configured for this site’s callback URL, then try again.')
        return
      }

      // Default new connections to the Virtual account if available
      const virtualAccount = accountsList.find((a) => a.isVirtual)
      const primaryAccount = virtualAccount || accountsList[0]

      try {
        setStatusMessage(`Authorizing ${primaryAccount.account} with Deriv API...`)

        // Connect and authorize
        await derivWS.connect()
        const authRes = await derivWS.authorize(primaryAccount.token)

        const authData = authRes?.authorize
        const balance = Number(authData?.balance ?? 0)
        const currency = authData?.currency || primaryAccount.currency
        const isVirtual = Boolean(authData?.is_virtual ?? primaryAccount.isVirtual)
        const loginid = authData?.loginid || primaryAccount.account

        const sessionPayload: DerivSession = {
          account: loginid,
          token: primaryAccount.token,
          createdAt: new Date().toISOString(),
          loginid,
          balance,
          currency,
          is_virtual: isVirtual,
          accounts: accountsList,
        }

        await saveDerivSession(sessionPayload)
        setAccount({
          loginid,
          token: primaryAccount.token,
          balance,
          currency,
          isVirtual,
          accounts: accountsList,
          isConnected: true,
        })

        setStatusMessage('Authorized successfully! Redirecting to your SniperTraders dashboard...')
        const timer = setTimeout(() => router.replace('/dashboard'), 600)
        return () => clearTimeout(timer)
      } catch (err) {
        console.warn('[OAuth Callback] Direct WS authorize failed:', err)
        setError('Deriv authorization could not be completed. Please try again.')
      }
    }

    handleAuth()
  }, [params, router, setAccount])

  return (
    <main className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-2xl">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-danger" />
            </div>
            <h1 className="text-xl font-bold text-white">Connection Not Completed</h1>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{error}</p>
            <Link
              className="inline-flex items-center justify-center mt-6 px-6 py-2.5 rounded-full bg-primary text-black font-semibold text-sm hover:opacity-90 transition-all"
              href="/"
            >
              Return Home
            </Link>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-white">Connecting SniperTraders</h1>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{statusMessage}</p>
            <div className="mt-6 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function DerivCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
          Connecting to Deriv...
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
