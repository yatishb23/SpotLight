'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'portrait';
  className?: string;
}

export function EventCard({ event, variant = 'default', className }: EventCardProps) {
  const persistSelectedEvent = () => {
    sessionStorage.setItem('selectedEvent', JSON.stringify(event));
  };

  // Portrait variant (typically for carousels / specific sections)
  if (variant === 'portrait') {
    return (
      <Link href={`/events/${event.id}`} className="block h-full group" onClick={persistSelectedEvent}>
         <motion.div 
            whileHover={{ y: -4 }}
            className={cn("h-full flex flex-col gap-3 p-0 bg-transparent border-0 shadow-none outline-none", className)}
         >
           <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-muted/30 border border-border/50">
             <Image
                src={event.bannerS3Url || (event as any).image || '/placeholder.svg'}
               alt={event.title?.trim() || 'Event poster image'}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
             <div className="absolute top-2 right-2 z-10">
                 <Badge variant="secondary" className="backdrop-blur-md bg-background/80 hover:bg-background/90 text-xs font-medium shadow-sm">
                   {event.category}
                 </Badge>
             </div>
           </div>
           
           <div className="space-y-1">
             <h3 className="font-semibold text-sm md:text-base leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
               {event.title}
             </h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1">
               <Calendar className="w-3 h-3" /> {formatDate(event.startDatetime || (event as any).date || new Date())}
             </p>
           </div>
         </motion.div>
      </Link>
    );
  }

  // Default variant (Standard Card)
  return (
    <Link href={`/events/${event.id}`} className="block h-full outline-none" onClick={persistSelectedEvent}>
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group h-full flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm transition-colors hover:border-primary/20",
          className
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={event.bannerS3Url || (event as any).image || '/placeholder.svg'}
            alt={event.title?.trim() || 'Event banner image'}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-3 right-3">
             <Badge className="bg-background/95 text-foreground backdrop-blur hover:bg-background shadow-sm">
               {event.category}
             </Badge>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5 gap-4">
          <div className="space-y-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
               {event.description}
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground">
             <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(event.startDatetime || (event as any).date || new Date())}</span>
             </div>
             <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{event.venueName || (event as any).location}, {event.city || ''}</span>
             </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

