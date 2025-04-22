// Global variable to store progress
let currentProgress = 0;

// Function to update progress (called from the main optimize-video route)
export function setProgress(progress: number) {
  currentProgress = progress;
}

// Function to get current progress value
export function getCurrentProgress(): number {
  return currentProgress;
}
