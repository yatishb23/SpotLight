export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const API_ENDPOINTS = {
  // Events
  EVENTS: '/api/events',
  EVENT_DETAIL: (id: string) => `/api/events/${id}`,
  EVENT_ANALYTICS: (id: string) => `/api/events/${id}/analytics`,

  // Tickets
  TICKETS: '/api/tickets',
  BOOK_TICKET: '/api/tickets/book',
  VERIFY_TICKET: (qrCode: string) => `/api/tickets/verify/${qrCode}`,

  // Dashboard
  DASHBOARD_STATS: '/api/dashboard/stats',
  MY_EVENTS: '/api/dashboard/my-events',

  // Admin
  GET_ALL_USERS: '/api/admin/users/getall',

  // Upload
  UPLOAD: '/upload',
} as const;

export const EVENT_CATEGORIES = [
  'Technology',
  'Business',
  'Music',
  'Sports',
  'Arts',
  'Education',
  'Health',
  'Food',
  'Entertainment',
  'Networking',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
} as const;

export const CACHE_DURATION = {
  EVENTS: 5 * 60 * 1000, // 5 minutes
  EVENT_DETAIL: 10 * 60 * 1000, // 10 minutes
  ANALYTICS: 15 * 60 * 1000, // 15 minutes
} as const;
