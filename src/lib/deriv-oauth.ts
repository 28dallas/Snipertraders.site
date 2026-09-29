const CLIENT_ID = process.env.NEXT_PUBLIC_DERIV_CLIENT_ID?.trim()

function base64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function startDerivLogin() {
  if (!CLIENT_ID) throw new Error('NEXT_PUBLIC_DERIV_CLIENT_ID is not configured.')
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(64)))
  const challengeBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  const challenge = base64Url(new Uint8Array(challengeBytes))
  const state = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const redirectUri = `${window.location.origin}/auth/deriv/callback`
  sessionStorage.setItem('deriv_oauth_state', state)
  sessionStorage.setItem('deriv_oauth_verifier', verifier)
  sessionStorage.setItem('deriv_oauth_redirect_uri', redirectUri)

  const url = new URL('https://auth.deriv.com/oauth2/auth')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'trade account_manage application_read payment')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  window.location.assign(url.toString())
}
