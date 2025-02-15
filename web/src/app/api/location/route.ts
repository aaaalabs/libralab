import { NextResponse } from 'next/server';
import epicwgData from '../../../data/epicwg.json';

export async function GET() {
  return NextResponse.json({ location: epicwgData.location });
}
