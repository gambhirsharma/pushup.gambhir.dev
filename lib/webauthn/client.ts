'use client'

import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser'

export async function registerWebAuthn(email: string) {
  try {
    const optionsResponse = await fetch('/api/webauthn/register/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!optionsResponse.ok) {
      const error = await optionsResponse.json()
      throw new Error(error.error || 'Failed to get registration options')
    }

    const options = await optionsResponse.json()
    const credential = await startRegistration(options)

    const verificationResponse = await fetch('/api/webauthn/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, credential }),
    })

    if (!verificationResponse.ok) {
      const error = await verificationResponse.json()
      throw new Error(error.error || 'Failed to verify registration')
    }

    return await verificationResponse.json()
  } catch (error: any) {
    throw new Error(error.message || 'Biometric registration failed')
  }
}

export async function authenticateWebAuthn(email: string) {
  try {
    const optionsResponse = await fetch('/api/webauthn/authenticate/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!optionsResponse.ok) {
      const error = await optionsResponse.json()
      throw new Error(error.error || 'Failed to get authentication options')
    }

    const options = await optionsResponse.json()
    const credential = await startAuthentication(options)

    const verificationResponse = await fetch('/api/webauthn/authenticate/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, credential }),
    })

    if (!verificationResponse.ok) {
      const error = await verificationResponse.json()
      throw new Error(error.error || 'Failed to verify authentication')
    }

    return await verificationResponse.json()
  } catch (error: any) {
    throw new Error(error.message || 'Biometric authentication failed')
  }
}

export function isBiometricAvailable(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
}
