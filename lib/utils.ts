import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // If less than 24 hours ago, show relative time
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `vor ${minutes} Minute${minutes !== 1 ? "n" : ""}`;
    }
    const hours = Math.floor(diffInHours);
    return `vor ${hours} Stunde${hours !== 1 ? "n" : ""}`;
  }

  // If less than 7 days ago, show day of week
  if (diffInHours < 168) {
    // 7 days * 24 hours
    const options: Intl.DateTimeFormatOptions = { weekday: "long" };
    return date.toLocaleDateString(undefined, options);
  }

  // Otherwise show month and day
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString(undefined, options);
}
