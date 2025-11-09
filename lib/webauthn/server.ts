import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers'

const RP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'PushUp App'
const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost'
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export interface Authenticator {
  credentialID: string
  credentialPublicKey: string
  counter: number
  transports?: string[]
}

export async function generateRegistrationOptionsForUser(
  userId: string,
  userName: string,
  userAuthenticators: Authenticator[]
) {
  const options: GenerateRegistrationOptionsOpts = {
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: userName,
    userID: isoUint8Array.fromUTF8String(userId),
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID,
      transports: authenticator.transports as AuthenticatorTransport[],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  }

  return generateRegistrationOptions(options)
}

export async function verifyRegistrationResponseForUser(
  credential: any,
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  const opts: VerifyRegistrationResponseOpts = {
    response: credential,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  }

  return verifyRegistrationResponse(opts)
}

export async function generateAuthenticationOptionsForUser(
  userAuthenticators: Authenticator[]
) {
  const options: GenerateAuthenticationOptionsOpts = {
    rpID: RP_ID,
    timeout: 60000,
    allowCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID,
      transports: authenticator.transports as AuthenticatorTransport[],
    })),
    userVerification: 'preferred',
  }

  return generateAuthenticationOptions(options)
}

export async function verifyAuthenticationResponseForUser(
  credential: any,
  expectedChallenge: string,
  authenticator: Authenticator
): Promise<VerifiedAuthenticationResponse> {
  const opts: VerifyAuthenticationResponseOpts = {
    response: credential,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: authenticator.credentialID,
      publicKey: isoBase64URL.toBuffer(authenticator.credentialPublicKey),
      counter: authenticator.counter,
    },
  }

  return verifyAuthenticationResponse(opts)
}
