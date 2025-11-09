# Push-Up Counter Feature

## Overview
The push-up counter uses AI-powered pose detection to automatically count push-ups through your webcam. It tracks elbow angles and body position to determine when a complete rep has been performed.

## How It Works

### Pose Detection
- Uses TensorFlow.js with the MoveNet model for real-time pose estimation
- Tracks key body points: shoulders, elbows, and wrists
- Calculates elbow angles to determine push-up positions

### Counting Logic
- **Down Position**: Elbow angle < 90° (arms bent)
- **Up Position**: Elbow angle > 160° (arms extended)
- A complete push-up is counted when transitioning from down to up

### Data Storage
- Push-ups are recorded per session
- Daily totals are automatically aggregated
- All records are stored in Supabase with user authentication
- Row-Level Security ensures users only see their own data

## Database Schema

```sql
CREATE TABLE pushup_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  count INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## API Endpoints

### POST /api/pushups
Save push-up count for the current session
```json
{
  "count": 10
}
```

### GET /api/pushups
Fetch user's push-up records
- Optional query param: `date` (YYYY-MM-DD)
- Returns array of records ordered by date

## Usage

1. Navigate to Dashboard
2. Click "Start Push-Up Counter"
3. Allow camera permissions
4. Position yourself so your full upper body is visible
5. Start doing push-ups
6. The system will automatically count each rep
7. Click "Save Push-Ups" to record your session

## Tips for Best Results

- Ensure good lighting
- Position camera at a side angle to see full arm extension
- Maintain proper push-up form
- Keep your full upper body in frame
- The system requires visibility of both shoulders, elbows, and wrists

## Technical Stack

- **Frontend**: Next.js 16 + React 19
- **Pose Detection**: TensorFlow.js + MoveNet
- **Database**: Supabase (PostgreSQL)
- **Authentication**: WebAuthn + Supabase Auth
- **Styling**: Tailwind CSS

## Future Enhancements

- Form quality feedback
- Different exercise types (squats, sit-ups, etc.)
- Progress charts and analytics
- Weekly/monthly goals
- Social features and leaderboards
