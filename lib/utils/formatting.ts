/**
 * Format price from cents to currency string
 */
export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/**
 * Format date with options
 */
export function formatDate(
  date: string | Date,
  format: "short" | "long" = "short"
): string {
  const d = new Date(date);
  return format === "short"
    ? d.toLocaleDateString()
    : d.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

/**
 * Format time
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return `${formatDate(d)} at ${formatTime(d)}`;
}

/**
 * Format delivery time string
 */
export function getDeliveryTimeString(value: number, unit: string): string {
  const unitText =
    value === 1 ? unit.slice(0, -1).toLowerCase() : unit.toLowerCase();
  return `${value} ${unitText}`;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(
  amount: number,
  feePercentage = 0.05
): number {
  return Math.round(amount * feePercentage);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (Math.abs(months) >= 1) {
    return rtf.format(months, "month");
  } else if (Math.abs(weeks) >= 1) {
    return rtf.format(weeks, "week");
  } else if (Math.abs(days) >= 1) {
    return rtf.format(days, "day");
  } else if (Math.abs(hours) >= 1) {
    return rtf.format(hours, "hour");
  } else if (Math.abs(minutes) >= 1) {
    return rtf.format(minutes, "minute");
  } else {
    return "just now";
  }
}

/**
 * Calculate average rating
 */
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }
  return phone;
}

/**
 * Parse price input to cents
 */
export function parsePriceInput(input: string): number {
  const cleaned = input.replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

/**
 * Format price input for display
 */
export function formatPriceInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Check if date is in the past
 */
export function isDateInPast(date: string | Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const today = new Date();
  const target = new Date(date);
  return today.toDateString() === target.toDateString();
}

/**
 * Get business hours validation
 */
export function isBusinessHours(
  date: Date,
  startHour = 9,
  endHour = 17
): boolean {
  const hour = date.getHours();
  const day = date.getDay();

  // Monday to Friday, 9 AM to 5 PM
  return day >= 1 && day <= 5 && hour >= startHour && hour < endHour;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Convert duration to minutes
 */
export function convertToMinutes(value: number, unit: string): number {
  switch (unit.toUpperCase()) {
    case "MINUTES":
      return value;
    case "HOURS":
      return value * 60;
    case "DAYS":
      return value * 60 * 24;
    default:
      return value;
  }
}

/**
 * Format delivery time into human readable string
 */
export function formatDeliveryTime(value: number, unit: string): string {
  if (value === 1) {
    switch (unit) {
      case "MINUTES":
        return "1 minute";
      case "HOURS":
        return "1 hour";
      case "DAYS":
        return "1 day";
      default:
        return `1 ${unit.toLowerCase()}`;
    }
  }

  switch (unit) {
    case "MINUTES":
      return `${value} minutes`;
    case "HOURS":
      return `${value} hours`;
    case "DAYS":
      return `${value} days`;
    default:
      return `${value} ${unit.toLowerCase()}`;
  }
}
