'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(window.location.search)

    async function finishSignIn() {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setError('Sign in is not configured. Please contact support.')
        return
      }

      const authError = params.get('error_description') || params.get('error')
      if (authError) {
        setError(authError)
        return
      }

      // Supabase processes the OAuth code or token hash when its browser client
      // initializes. getSession waits for that URL session to be persisted.
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active) return
      if (sessionError || !data.session) {
        setError(sessionError?.message || 'Google sign in could not be completed. Please try again.')
        return
      }

      const next = params.get('next')
      const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
      window.history.replaceState({}, document.title, window.location.pathname)
      router.replace(destination)
    }

    void finishSignIn()
    return () => { active = false }
  }, [router])

  return (
    <main className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold text-white">{error ? 'Sign in failed' : 'Completing sign in'}</h1>
        <p className="text-muted-foreground text-sm mt-2" role={error ? 'alert' : undefined}>
          {error || 'Connecting your SniperTraders account...'}
        </p>
        {error && <a href="/auth/signup" className="inline-block mt-5 text-primary hover:underline">Return to sign up</a>}
      </div>
    </main>
  )
}
