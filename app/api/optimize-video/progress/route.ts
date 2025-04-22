import { NextResponse } from 'next/server';

// Import progress handling from a separate utility file
import { getCurrentProgress } from './progress-utils'

// GET handler to retrieve current progress
export async function GET() {
  return NextResponse.json({ progress: getCurrentProgress() });
}
