import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyRegistrationResponseForUser } from '@/lib/webauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'

export async function POST(request: NextRequest) {
  try {
    const { email, credential } = await request.json()

    if (!email || !credential) {
      return NextResponse.json({ error: 'Email and credential are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'User must be logged in' }, { status: 401 })
    }

    if (user.email !== email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
    }

    const { data: challengeData } = await supabase
      .from('webauthn_challenges')
      .select('challenge')
      .eq('user_id', user.id)
      .single()

    if (!challengeData) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 400 })
    }

    const verification = await verifyRegistrationResponseForUser(
      credential,
      challengeData.challenge
    )

    if (!verification.verified) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    const { registrationInfo } = verification
    if (!registrationInfo) {
      return NextResponse.json({ error: 'Registration info missing' }, { status: 400 })
    }

    const { error: credentialError } = await supabase
      .from('webauthn_credentials')
      .insert({
        user_id: user.id,
        credential_id: registrationInfo.credential.id,
        public_key: isoBase64URL.fromBuffer(registrationInfo.credential.publicKey),
        counter: registrationInfo.credential.counter,
        transports: credential.response.transports || [],
        created_at: new Date().toISOString(),
      })

    if (credentialError) {
      console.error('Failed to store credential:', credentialError)
      return NextResponse.json({ error: 'Failed to store credential' }, { status: 500 })
    }

    await supabase
      .from('webauthn_challenges')
      .delete()
      .eq('user_id', user.id)

    return NextResponse.json({ verified: true })
  } catch (error: any) {
    console.error('Registration verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify registration' },
      { status: 500 }
    )
  }
}
