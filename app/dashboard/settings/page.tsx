import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BiometricSetup from '../biometric-setup'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email</label>
                <p className="mt-1 text-black dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">User ID</label>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500 font-mono">{user.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Profile
            </h2>
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
                  {(profile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Name</div>
                <div className="text-black dark:text-white font-medium">
                  {profile?.display_name || 'Not set'}
                </div>
              </div>
              <Link
                href="/dashboard/profile"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          <BiometricSetup />

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Security
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Manage your security settings and biometric authentication.
            </p>
            <div className="text-sm text-zinc-500 dark:text-zinc-500">
              Biometric authentication is configured above. Your account is secured with industry-standard encryption.
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Preferences
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your theme preference is automatically detected from your system settings.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
