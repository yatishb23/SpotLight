'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'portrait';
  className?: string;
}

export function EventCard({ event, variant = 'default', className }: EventCardProps) {
  const persistSelectedEvent = () => {
    sessionStorage.setItem('selectedEvent', JSON.stringify(event));
  };

  // Helper to get image with fallbacks
  const eventImage = event.bannerS3Url || (event as any).image || '/placeholder.svg';

  return (
    <Link 
      href={`/events/${event.id}`} 
      className="block group outline-none" 
      onClick={persistSelectedEvent}
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={cn("flex flex-col gap-3", className)}
      >
        {/* Image Container */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg transition-colors group-hover:border-zinc-700",
          variant === 'portrait' ? "aspect-[2/3]" : "aspect-[16/10]"
        )}>
          <Image
            src={eventImage}
            alt={event.title || 'Event poster'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
          />
          
          {/* High-end Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
          
          {/* Floating Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-zinc-950/60 text-zinc-100 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
              {event.category}
            </Badge>
          </div>

          {/* Rating/Price Tag (Optional Premium Add) */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-zinc-100 text-zinc-950 px-2 py-0.5 rounded-md font-black text-[10px] uppercase shadow-xl">
             <Star className="w-2.5 h-2.5 fill-current" /> 4.8
          </div>
        </div>

        {/* Content Section */}
        <div className="px-1 space-y-1.5">
          <h3 className="font-bold text-sm md:text-base leading-tight text-zinc-100 line-clamp-1 group-hover:text-white transition-colors uppercase tracking-tight italic">
            {event.title}
          </h3>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <Calendar className="w-3 h-3" />
              <span className="text-[11px] font-medium uppercase tracking-tighter">
                {formatDate(event.startDatetime || (event as any).date || new Date())}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-zinc-500">
              <MapPin className="h-3 w-3" />
              <span className="text-[11px] font-medium uppercase tracking-tighter truncate max-w-[180px]">
                {event.venueName || (event as any).location} • {event.city}
              </span>
            </div>
          </div>

          {/* Price Indicator */}
          {event.description && variant === 'default' && (
             <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1 italic leading-relaxed">
               {event.description}
             </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}