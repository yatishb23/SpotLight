'use client';

import { EventCard } from './event-card';
import type { Event } from '@/lib/types';

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  variant?: 'default' | 'compact';
}

export function EventList({ events, isLoading = false, variant = 'default' }: EventListProps) {
  if (isLoading) {
    return (
      <div className={variant === 'compact' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-secondary rounded-lg h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No events found</p>
        <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or check back later</p>
      </div>
    );
  }

  return (
    <div className={variant === 'compact' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} variant={variant} />
      ))}
    </div>
  );
}
