'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const PushUpCounter = dynamic(() => import('../pushup-counter'), {
  ssr: false,
  loading: () => <div className="text-center p-8">Loading pose detection...</div>
});

interface PushUpRecord {
  id: string;
  count: number;
  date: string;
}

export default function WorkoutPage() {
  const router = useRouter();
  const [sessionCount, setSessionCount] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [recentRecords, setRecentRecords] = useState<PushUpRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const response = await fetch('/api/pushups');
      if (response.ok) {
        const data = await response.json();
        setRecentRecords(data.records.slice(0, 7));
        
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = data.records.find((r: PushUpRecord) => r.date === today);
        setTodayTotal(todayRecord?.count || 0);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  }

  async function savePushUps() {
    if (sessionCount === 0) return;

    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/pushups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: sessionCount }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Saved ${sessionCount} push-ups!`);
        setTodayTotal(data.record.count);
        setSessionCount(0);
        fetchRecords();
      } else {
        setMessage('❌ Failed to save push-ups');
      }
    } catch (error) {
      console.error('Error saving push-ups:', error);
      setMessage('❌ Error saving push-ups');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Push-Up Tracker</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Session Count</h3>
            <p className="text-5xl font-bold text-blue-600">{sessionCount}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Today's Total</h3>
            <p className="text-5xl font-bold text-green-600">{todayTotal}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-center">
            <button
              onClick={savePushUps}
              disabled={sessionCount === 0 || isSaving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            >
              {isSaving ? 'Saving...' : 'Save Push-Ups'}
            </button>
            {message && (
              <p className="text-sm text-center mt-2">{message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Pose Detection</h2>
          <PushUpCounter onPushUpComplete={() => setSessionCount(prev => prev + 1)} />
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Instructions:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Position yourself so your full upper body is visible in the camera</li>
              <li>Perform push-ups with proper form</li>
              <li>The system tracks your elbow angle to count repetitions</li>
              <li>Down position: elbows bent less than 90°</li>
              <li>Up position: arms extended more than 160°</li>
              <li>Click "Save Push-Ups" when you're done with your session</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Records</h2>
          {recentRecords.length === 0 ? (
            <p className="text-gray-500">No records yet. Start your first workout!</p>
          ) : (
            <div className="space-y-2">
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {record.count} push-ups
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
