/**
 * Format date to readable string
 * @param date Date string or Date object
 * @returns Formatted date (e.g., "Mar 15, 2026")
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time together
 * @param date Date string or Date object
 * @param time Time string (HH:mm format)
 * @returns Formatted datetime (e.g., "Mar 15, 2026 at 7:30 PM")
 */
export function formatDateTime(date: string | Date, time: string): string {
  const dateStr = formatDate(date);
  const timeObj = parseTime(time);
  const timeStr = timeObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
  });
  return `${dateStr} at ${timeStr}`;
}

/**
 * Parse time string (HH:mm format) to Date
 * @param timeStr Time string (HH:mm format)
 * @returns Date object with today's date and specified time
 */
export function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Check if date is in the past
 * @param date Date string or Date object
 * @returns true if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Get relative time string (e.g., "in 2 days", "3 hours ago")
 * @param date Date string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) {
    return 'now';
  }
  if (Math.abs(diffMins) < 60) {
    return `${diffMins > 0 ? 'in' : ''} ${Math.abs(diffMins)} minute${Math.abs(diffMins) !== 1 ? 's' : ''} ${diffMins < 0 ? 'ago' : ''}`;
  }
  if (Math.abs(diffHours) < 24) {
    return `${diffHours > 0 ? 'in' : ''} ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ${diffHours < 0 ? 'ago' : ''}`;
  }
  if (Math.abs(diffDays) < 365) {
    return `${diffDays > 0 ? 'in' : ''} ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ${diffDays < 0 ? 'ago' : ''}`;
  }

  return formatDate(dateObj);
}

/**
 * Format price to currency
 * @param price Price in dollars
 * @returns Formatted price (e.g., "$29.99")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Parse time range (e.g., "14:30-18:00" or "2:30 PM - 6:00 PM")
 * @param startTime Start time in HH:mm format
 * @param endTime End time in HH:mm format
 * @returns Formatted time range
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  const startStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
  });
  const endStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    meridiem: 'short',
  });

  return `${startStr} - ${endStr}`;
}
