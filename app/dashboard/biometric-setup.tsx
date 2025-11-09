'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { registerWebAuthn, isBiometricAvailable } from '@/lib/webauthn/client'

export default function BiometricSetup() {
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [hasCredentials, setHasCredentials] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    setBiometricAvailable(isBiometricAvailable())
    checkExistingCredentials()
  }, [])

  const checkExistingCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || '')

      const { data } = await supabase
        .from('webauthn_credentials')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      setHasCredentials(!!data && data.length > 0)
    } catch (err) {
      console.error('Failed to check credentials:', err)
    }
  }

  const handleRegisterBiometric = async () => {
    if (!userEmail) {
      setError('User email not found')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await registerWebAuthn(userEmail)
      setSuccess('Biometric authentication set up successfully!')
      setHasCredentials(true)
    } catch (err: any) {
      setError(err.message || 'Failed to set up biometric authentication')
    } finally {
      setLoading(false)
    }
  }

  if (!biometricAvailable) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Biometric authentication not available
            </h3>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              Your device or browser doesn't support biometric authentication (Face ID/Touch ID).
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Biometric Authentication
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {hasCredentials 
              ? 'Face ID / Touch ID is enabled for your account'
              : 'Set up Face ID / Touch ID for faster login'}
          </p>
        </div>
        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {!hasCredentials && (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Enable biometric authentication to sign in quickly and securely without entering your password.
          </p>
          <button
            onClick={handleRegisterBiometric}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Enable Face ID / Touch ID'}
          </button>
        </>
      )}

      {hasCredentials && (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Biometric authentication is active
        </div>
      )}
    </div>
  )
}
