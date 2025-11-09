import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './logout-button'
import BiometricSetup from './biometric-setup'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            PushUp Tracker
          </h1>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Welcome back!
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Logged in as: <span className="font-medium text-black dark:text-white">{user.email}</span>
            </p>
          </div>

          <BiometricSetup />

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Start Your Workout
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Track your push-ups with AI-powered pose detection. The system uses your camera to count your reps automatically.
            </p>
            <Link 
              href="/dashboard/workout"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Start Push-Up Counter
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Your Dashboard
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              This is your protected dashboard. Start tracking your push-ups here!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
