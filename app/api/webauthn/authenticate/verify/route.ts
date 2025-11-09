import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAuthenticationResponseForUser } from '@/lib/webauthn/server'

export async function POST(request: NextRequest) {
  try {
    const { email, credential } = await request.json()

    if (!email || !credential) {
      return NextResponse.json({ error: 'Email and credential are required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: challengeData } = await supabase
      .from('webauthn_challenges')
      .select('challenge')
      .eq('user_id', userData.id)
      .single()

    if (!challengeData) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 400 })
    }

    const credentialIDBase64 = credential.rawId

    const { data: authenticatorData } = await supabase
      .from('webauthn_credentials')
      .select('credential_id, public_key, counter')
      .eq('user_id', userData.id)
      .eq('credential_id', credentialIDBase64)
      .single()

    if (!authenticatorData) {
      return NextResponse.json({ error: 'Authenticator not found' }, { status: 404 })
    }

    const authenticator = {
      credentialID: authenticatorData.credential_id,
      credentialPublicKey: authenticatorData.public_key,
      counter: authenticatorData.counter,
    }

    const verification = await verifyAuthenticationResponseForUser(
      credential,
      challengeData.challenge,
      authenticator
    )

    if (!verification.verified) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    await supabase
      .from('webauthn_credentials')
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq('user_id', userData.id)
      .eq('credential_id', credentialIDBase64)

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    })

    if (error || !data) {
      console.error('Failed to generate magic link:', error)
      return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
    }

    await supabase
      .from('webauthn_challenges')
      .delete()
      .eq('user_id', userData.id)

    return NextResponse.json({ verified: true, token: data })
  } catch (error: any) {
    console.error('Authentication verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify authentication' },
      { status: 500 }
    )
  }
}
