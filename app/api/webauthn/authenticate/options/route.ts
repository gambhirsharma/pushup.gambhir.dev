import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAuthenticationOptionsForUser } from '@/lib/webauthn/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
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

    const { data: authenticators } = await supabase
      .from('webauthn_credentials')
      .select('credential_id, public_key, counter, transports')
      .eq('user_id', userData.id)

    if (!authenticators || authenticators.length === 0) {
      return NextResponse.json({ error: 'No biometric credentials found' }, { status: 404 })
    }

    const userAuthenticators = authenticators.map((auth: any) => ({
      credentialID: auth.credential_id,
      credentialPublicKey: auth.public_key,
      counter: auth.counter,
      transports: auth.transports,
    }))

    const options = await generateAuthenticationOptionsForUser(userAuthenticators)

    const { error: sessionError } = await supabase
      .from('webauthn_challenges')
      .upsert({
        user_id: userData.id,
        challenge: options.challenge,
        created_at: new Date().toISOString(),
      })

    if (sessionError) {
      console.error('Failed to store challenge:', sessionError)
      return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
    }

    return NextResponse.json(options)
  } catch (error: any) {
    console.error('Authentication options error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate authentication options' },
      { status: 500 }
    )
  }
}
