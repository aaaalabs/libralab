import { NextResponse } from 'next/server';
import { getTierSlots } from '../../../../lib/db';

export async function GET() {
  try {
    const slots = await getTierSlots();
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
