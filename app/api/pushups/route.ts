import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { count } = await request.json();

    if (!count || count < 1) {
      return NextResponse.json(
        { error: 'Invalid count' },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if record exists for today
    const { data: existingRecord } = await supabase
      .from('pushup_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    let result;
    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabase
        .from('pushup_records')
        .update({ count: existingRecord.count + count })
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('pushup_records')
        .insert({ user_id: user.id, count, date: today })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, record: result });
  } catch (error) {
    console.error('Error saving push-up record:', error);
    return NextResponse.json(
      { error: 'Failed to save record' },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let query = supabase
      .from('pushup_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ records: data });
  } catch (error) {
    console.error('Error fetching push-up records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}
