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
          "relative overflow-hidden rounded-[24px] border border-neutral-900 bg-[#0a0a0a] shadow-2xl transition-all duration-500 group-hover:border-neutral-700",
          variant === 'portrait' ? "aspect-[2/3]" : "aspect-[16/10]"
        )}>
          <Image
            src={eventImage}
            alt={event.title || 'Event poster'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover grayscale transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1 group-hover:grayscale-0"
          />
          
          {/* High-end Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-90" />
          
          {/* Floating Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-black/40 text-neutral-300 backdrop-blur-md border border-neutral-800/50 text-[8px] font-black uppercase tracking-widest px-3 py-1">
              {event.category}
            </Badge>
          </div>

          {/* Rating/Price Tag (Optional Premium Add) */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-md text-white px-2.5 py-1 border border-neutral-800 rounded-md font-mono text-[9px] uppercase shadow-2xl">
             <Star className="w-2.5 h-2.5 fill-current text-white" /> 4.8
          </div>
        </div>

        {/* Content Section */}
        <div className="px-2 pt-1 space-y-2">
          <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.2em] mb-1">RECORD: ID-{event.id.slice(0,6).toUpperCase()}</p>
          <h3 className="font-medium text-sm md:text-base leading-tight text-white line-clamp-1 group-hover:text-neutral-300 transition-colors uppercase tracking-tight italic">
            {event.title}
          </h3>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-neutral-500">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px] font-mono uppercase tracking-tighter">
                {formatDate(event.startDatetime || (event as any).date || new Date())}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-neutral-500">
              <MapPin className="h-3 w-3" />
              <span className="text-[10px] font-mono uppercase tracking-tighter truncate max-w-[180px]">
                {event.venueName || (event as any).location} • {event.city}
              </span>
            </div>
          </div>

          {/* Price Indicator */}
          {event.description && variant === 'default' && (
             <p className="text-[10px] text-neutral-600 line-clamp-2 mt-2 font-mono leading-relaxed">
               {event.description}
             </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}