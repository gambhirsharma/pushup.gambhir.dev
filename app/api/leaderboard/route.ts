import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'daily';

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (type === 'daily') {
      const { data, error } = await supabase
        .from('daily_leaderboard')
        .select('*')
        .limit(10);

      if (error) throw error;
      return NextResponse.json({ leaderboard: data });
    } else if (type === 'overall') {
      const { data, error } = await supabase
        .from('overall_leaderboard')
        .select('*')
        .limit(10);

      if (error) throw error;
      return NextResponse.json({ leaderboard: data });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
