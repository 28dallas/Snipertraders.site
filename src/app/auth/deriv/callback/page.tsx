'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { DerivAccountItem, DerivSession, saveDerivSession } from '@/lib/deriv-session'
import { derivWS } from '@/lib/deriv-websocket'
import { useTradingStore } from '@/stores/trading-store'

function CallbackContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('Connecting to Deriv WebSocket & authorizing account...')
  const setAccount = useTradingStore((s) => s.setAccount)

  useEffect(() => {
    async function handleAuth() {
      const returnedState = params.get('state')
      const expectedState = sessionStorage.getItem('deriv_oauth_state')
      window.history.replaceState({}, document.title, '/auth/deriv/callback')

      if (expectedState) {
        sessionStorage.removeItem('deriv_oauth_state')
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

      const derivError = params.get('error')
      if (derivError) {
        const description = params.get('error_description')
        setError(description ? `Deriv authorization failed: ${description}` : `Deriv authorization failed: ${derivError}`)
        return
      }

      // 1. Extract all accounts from query params (acct1, token1, cur1, acct2, token2, cur2...)
      const accountsList: DerivAccountItem[] = []
      let idx = 1
      while (params.get(`token${idx}`) && params.get(`acct${idx}`)) {
        const acct = params.get(`acct${idx}`)!
        const token = params.get(`token${idx}`)!
        const cur = params.get(`cur${idx}`) || 'USD'
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
        const singleToken = params.get('token1') || params.get('token')
        const singleAcct = params.get('acct1') || params.get('acct')
        if (singleToken && singleAcct) {
          accountsList.push({
            account: singleAcct,
            token: singleToken,
            currency: params.get('cur1') || 'USD',
            isVirtual: singleAcct.startsWith('VRT'),
          })
        }
      }

      if (accountsList.length === 0) {
        setError('Deriv did not return an authorized account token. Please try again.')
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
        const balance = authData?.balance ?? 10000
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

        saveDerivSession(sessionPayload)
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
