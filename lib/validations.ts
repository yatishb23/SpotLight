import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Please enter a valid email address');

// Name validation
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Ticket booking schema
export const ticketBookingSchema = z.object({
  attendeeName: nameSchema,
  attendeeEmail: emailSchema,
  quantity: z.coerce
    .number()
    .min(1, 'You must book at least 1 ticket')
    .max(10, 'Maximum 10 tickets per booking'),
});

// Event creation schema
export const eventCreationSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  date: z.string()
    .refine((date) => new Date(date) > new Date(), 'Event date must be in the future'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be less than 200 characters'),
  category: z.string().min(1, 'Please select a category'),
  capacity: z.coerce
    .number()
    .min(1, 'Capacity must be at least 1')
    .max(100000, 'Capacity must be less than 100,000'),
  price: z.coerce
    .number()
    .min(0, 'Price cannot be negative')
    .max(99999, 'Price must be less than 99,999'),
  organizer: z.string()
    .min(2, 'Organizer name must be at least 2 characters')
    .max(200, 'Organizer name must be less than 200 characters'),
});

// Event filter schema
export const eventFilterSchema = z.object({
  category: z.string().optional(),
  searchTerm: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(12),
});

export type TicketBooking = z.infer<typeof ticketBookingSchema>;
export type EventCreation = z.infer<typeof eventCreationSchema>;
export type EventFilter = z.infer<typeof eventFilterSchema>;
