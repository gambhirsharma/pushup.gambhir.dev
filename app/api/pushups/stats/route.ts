import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];

    // Get today's count
    const { data: todayData } = await supabase
      .from('pushup_records')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    // Get this week's data
    const { data: weekData } = await supabase
      .from('pushup_records')
      .select('date, count')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .lte('date', today)
      .order('date', { ascending: true });

    // Get total count
    const { data: totalData } = await supabase
      .from('pushup_records')
      .select('count')
      .eq('user_id', user.id);

    const todayCount = todayData?.count || 0;
    const weeklyData = weekData || [];
    const totalCount = totalData?.reduce((sum, record) => sum + record.count, 0) || 0;

    // Fill in missing days of the week with 0
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const filledWeekData = daysOfWeek.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      const record = weeklyData.find(r => r.date === dateStr);
      return {
        day,
        date: dateStr,
        count: record?.count || 0
      };
    });

    return NextResponse.json({ 
      today: todayCount,
      week: filledWeekData,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
