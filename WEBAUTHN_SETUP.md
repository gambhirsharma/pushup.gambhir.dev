# WebAuthn Biometric Authentication Setup

This guide explains how to set up and use Face ID/Touch ID biometric authentication in your Next.js app.

## Features

- 🔐 Face ID / Touch ID login support
- 📧 Email/password fallback authentication
- 🔄 Seamless integration with Supabase Auth
- 🛡️ Secure WebAuthn implementation using SimpleWebAuthn
- 📱 Platform authenticator support (built-in biometrics)

## Prerequisites

Before using biometric authentication, you need to:

1. Run the Supabase migration to create required database tables
2. Configure environment variables
3. Use HTTPS in production (required for WebAuthn)

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration script from `supabase_migration.sql`

This will create:
- `webauthn_credentials` - Stores user biometric credentials
- `webauthn_challenges` - Temporary challenge storage
- `profiles` - User profile information
- Row Level Security (RLS) policies for data protection

## Environment Variables

Add these to your `.env.local` file:

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WebAuthn configuration
NEXT_PUBLIC_APP_NAME="PushUp App"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RP_ID=localhost

# For production, use your actual domain:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
# NEXT_PUBLIC_RP_ID=yourdomain.com
```

### Important Notes:

- **Development**: Use `localhost` for `NEXT_PUBLIC_RP_ID`
- **Production**: Use your domain (e.g., `example.com`) without `https://`
- **HTTPS Required**: WebAuthn only works over HTTPS in production
- **RP_ID Domain Match**: The RP_ID must match your app's domain

## How to Use

### 1. Register Biometric Authentication

After logging in with email/password:

1. Go to your dashboard
2. Find the "Biometric Authentication" section
3. Click "Enable Face ID / Touch ID"
4. Follow your device's prompts to register your biometric

### 2. Login with Biometrics

On the login page:

1. Enter your email address
2. Click "Sign in with Face ID" button
3. Authenticate with your device's biometric sensor

### 3. Fallback to Password

If biometric authentication fails or isn't available:

1. Use the regular email/password login form
2. Your password login will always work as a fallback

## Browser Support

WebAuthn is supported on:

- ✅ Chrome/Edge 67+
- ✅ Firefox 60+
- ✅ Safari 13+ (iOS 13+)
- ✅ Opera 54+

### Platform Support

- **iOS/iPadOS**: Face ID, Touch ID
- **macOS**: Touch ID, Face ID (M1+ Macs)
- **Android**: Fingerprint, Face unlock
- **Windows**: Windows Hello (fingerprint, face, PIN)

## Security Features

1. **Platform Authenticators**: Only device-integrated biometrics (no USB keys)
2. **User Verification**: Requires biometric or device PIN
3. **Counter Protection**: Prevents credential cloning
4. **Challenge-Response**: Unique challenge for each authentication
5. **RLS Policies**: Database-level security with Row Level Security

## API Routes

The implementation includes these API endpoints:

- `POST /api/webauthn/register/options` - Get registration options
- `POST /api/webauthn/register/verify` - Verify registration
- `POST /api/webauthn/authenticate/options` - Get authentication options
- `POST /api/webauthn/authenticate/verify` - Verify authentication

## Troubleshooting

### "Biometric authentication not available"

- Check if your browser supports WebAuthn
- Ensure you're using HTTPS (or localhost for development)
- Verify your device has biometric hardware

### "Challenge not found"

- The challenge may have expired (60s timeout)
- Try the authentication process again

### "No biometric credentials found"

- You need to register your biometric first
- Go to dashboard and enable Face ID/Touch ID

### "Email mismatch"

- Ensure you're logged in with the correct account
- Try logging out and back in

## Production Deployment

When deploying to production:

1. Update environment variables with your production domain
2. Ensure your app is served over HTTPS
3. Update `NEXT_PUBLIC_RP_ID` to match your domain
4. Test biometric registration and authentication
5. Keep email/password login as fallback

## Architecture

```
┌─────────────────┐
│  Login Page     │
│  - Email input  │
│  - Password     │
│  - Biometric    │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
    ┌────▼─────┐      ┌────▼──────────┐
    │ Password │      │   WebAuthn    │
    │   Auth   │      │  Browser API  │
    └────┬─────┘      └────┬──────────┘
         │                  │
         │            ┌─────▼──────────┐
         │            │  API Routes    │
         │            │  - Options     │
         │            │  - Verify      │
         │            └─────┬──────────┘
         │                  │
    ┌────▼──────────────────▼───┐
    │    Supabase Auth          │
    │    - User Session         │
    │    - Token Management     │
    └───────────┬───────────────┘
                │
         ┌──────▼──────────┐
         │   Dashboard     │
         └─────────────────┘
```

## Dependencies

- `@simplewebauthn/browser` - Client-side WebAuthn
- `@simplewebauthn/server` - Server-side WebAuthn verification
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Supabase SSR utilities

## Learn More

- [WebAuthn Guide](https://webauthn.guide/)
- [SimpleWebAuthn Documentation](https://simplewebauthn.dev/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
