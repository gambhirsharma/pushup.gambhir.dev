import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRegistrationOptionsForUser } from '@/lib/webauthn/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'User must be logged in' }, { status: 401 })
    }

    if (user.email !== email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
    }

    const { data: existingAuthenticators } = await supabase
      .from('webauthn_credentials')
      .select('credential_id, public_key, counter, transports')
      .eq('user_id', user.id)

    const userAuthenticators = (existingAuthenticators || []).map((auth: any) => ({
      credentialID: auth.credential_id,
      credentialPublicKey: auth.public_key,
      counter: auth.counter,
      transports: auth.transports,
    }))

    const options = await generateRegistrationOptionsForUser(
      user.id,
      email,
      userAuthenticators
    )

    const { error: sessionError } = await supabase
      .from('webauthn_challenges')
      .upsert({
        user_id: user.id,
        challenge: options.challenge,
        created_at: new Date().toISOString(),
      })

    if (sessionError) {
      console.error('Failed to store challenge:', sessionError)
      return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
    }

    return NextResponse.json(options)
  } catch (error: any) {
    console.error('Registration options error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate registration options' },
      { status: 500 }
    )
  }
}
