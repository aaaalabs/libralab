import { NextResponse } from 'next/server';
import type { RoomApplication } from '../../../types/room';

// TODO: Replace with actual database implementation
const applications: RoomApplication[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const application = validateApplication(body);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Invalid application data' },
        { status: 400 }
      );
    }

    // Store application
    applications.push(application);

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // TODO: Add authentication
  return NextResponse.json({ applications });
}

function validateApplication(data: unknown): RoomApplication | null {
  if (!data || typeof data !== 'object') return null;
  
  const {
    roomId,
    applicantName,
    email,
    phone,
    message,
  } = data as Record<string, unknown>;

  if (
    typeof roomId !== 'string' ||
    typeof applicantName !== 'string' ||
    typeof email !== 'string' ||
    typeof phone !== 'string' ||
    typeof message !== 'string'
  ) {
    return null;
  }

  return {
    roomId,
    applicantName,
    email,
    phone,
    message,
    submittedAt: new Date(),
  };
}
