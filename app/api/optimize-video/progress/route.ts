import { NextResponse } from 'next/server';

// Global variable to store progress
let currentProgress = 0;

// Function to update progress (called from the main optimize-video route)
export function updateProgress(progress: number) {
  currentProgress = progress;
}

// GET handler to retrieve current progress
export async function GET() {
  return NextResponse.json({ progress: currentProgress });
}
