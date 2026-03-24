// User types
export type Role = 'user' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
  createdAt: string;
}

export interface DashboardUserDetails {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
  organizerId?: string;
  [key: string]: unknown;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  venueName: string;
  address: string;
  city: string;
  country: string;
  bannerS3Url: string;
  category: string;
  totalCapacity: number;
  availableCapacity: number;
  ticketPrice: number;
  currency: string;
  organizerId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

export interface EventWithStats extends Event {
  totalRevenue: number;
  attendanceRate: number;
}

// Ticket types
export interface Ticket {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  quantity: number;
  totalPrice: number;
  qrCode: string;
  purchasedAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Dashboard analytics
export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  totalTickets: number;
  soldTickets: number;
  totalRevenue: number;
  weeklyData: WeeklyDataPoint[];
}

export interface WeeklyDataPoint {
  day: string;
  tickets: number;
  revenue: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EventsListResponse {
  events: Event[];
  total: number;
  page: number;
  pageSize: number;
}
