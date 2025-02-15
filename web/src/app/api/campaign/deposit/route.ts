import { NextResponse } from 'next/server';
import { addDeposit, getCurrentAmount, getTierSlots } from '../../../../lib/db';

export async function GET() {
  try {
    const currentAmount = await getCurrentAmount();
    const slots = await getTierSlots();
    return NextResponse.json({ currentAmount, slots });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { tierId, amount } = await request.json();
    
    if (!tierId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const success = await addDeposit(tierId, amount);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to process deposit' },
        { status: 400 }
      );
    }

    const [currentAmount, slots] = await Promise.all([
      getCurrentAmount(),
      getTierSlots()
    ]);

    return NextResponse.json({ currentAmount, slots });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
