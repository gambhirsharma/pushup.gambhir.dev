# Leaderboard Database Fix

## The Problem

The leaderboards (daily and overall) were not showing your pushup count because of **Row Level Security (RLS) policies** in Supabase.

### Root Cause
- The `profiles` table had an RLS policy that only allowed users to see **their own** profile
- The `pushup_records` table had an RLS policy that only allowed users to see **their own** records
- The leaderboard views (`daily_leaderboard` and `overall_leaderboard`) need to JOIN these tables and show **all users'** data
- Because of the restrictive policies, the views could only show your own data, not other users

## The Solution

Run the SQL migration script `fix_leaderboard_rls.sql` in your Supabase SQL Editor to:

1. **Update profiles RLS policy**: Allow everyone to read all profiles (needed for leaderboard display)
2. **Update pushup_records RLS policy**: Allow everyone to read all pushup records (needed for leaderboard rankings)
3. **Keep write restrictions**: Users can still only insert/update/delete their own records (security maintained)

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `fix_leaderboard_rls.sql`
5. Paste into the SQL editor
6. Click **Run** to execute

### Option 2: Using Supabase CLI
```bash
supabase db push fix_leaderboard_rls.sql
```

## What Changed

### Before (Restrictive)
```sql
-- Users could only see their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users could only see their own pushup records
CREATE POLICY "Users can view their own records"
  ON pushup_records FOR SELECT
  USING (auth.uid() = user_id);
```

### After (Public Read, Private Write)
```sql
-- Anyone can see all profiles (for leaderboards)
CREATE POLICY "Anyone can view public profile info"
  ON profiles FOR SELECT
  USING (true);

-- Anyone can see all pushup records (for leaderboards)
CREATE POLICY "Anyone can view all pushup records"
  ON pushup_records FOR SELECT
  USING (true);

-- But users can only modify their own data
CREATE POLICY "Users can insert their own records"
  ON pushup_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Security Note

This change is **safe** because:
- ✅ Anyone can **read** leaderboard data (that's the point of a public leaderboard)
- ✅ Users can only **write/update/delete** their own records
- ✅ User emails and display names are public info in the leaderboard context
- ✅ No sensitive data (passwords, auth tokens) is exposed

## Verify It Works

After applying the fix:
1. Add some pushups in the workout page
2. Click "Save Push-Ups"
3. Go back to the dashboard
4. Check the Daily Leaderboard - you should now see your entry
5. Check the Overall Leaderboard - you should see your total

## Additional Notes

- The updated `supabase_leaderboard_migration.sql` file now includes these fixes
- If you need to set up a fresh database, run both migrations in order:
  1. `supabase_migration.sql`
  2. `supabase_leaderboard_migration.sql`
