'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock } from 'lucide-react';
import type { Event } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedCarouselProps {
  events: Event[];
}

export function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  // Only show first 5 events
  const featuredEvents = events.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredEvents.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  if (featuredEvents.length === 0) return null;

  const currentEvent = featuredEvents[currentIndex];
  
  // Safe fallbacks for mixed real API and mock data
  const imageUrl = currentEvent.bannerS3Url || (currentEvent as any).image || '/placeholder.svg';
  const displayDate = currentEvent.startDatetime 
    ? new Date(currentEvent.startDatetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : (currentEvent as any).date;
  const displayTime = currentEvent.startDatetime
    ? new Date(currentEvent.startDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : (currentEvent as any).time;
  const displayLocation = currentEvent.venueName 
    ? `${currentEvent.venueName}, ${currentEvent.city || ''}` 
    : (currentEvent as any).location;

  const persistSelectedEvent = () => {
    sessionStorage.setItem('selectedEvent', JSON.stringify(currentEvent));
  };

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          
          key={currentEvent.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full"
        >
          {/* Main Background Image (Blurry for atmosphere) */}
           <div className="absolute inset-0 overflow-hidden">
             <Image
               src={imageUrl}
               alt={currentEvent.title?.trim() || 'Featured event image'}
               fill
               className="object-cover blur-xl opacity-50 scale-110"
             />
             <div className="absolute inset-0 bg-background/60" />
          </div>

          {/* Content Container */}
          <div className="w-full max-w-[1400px] relative h-full mx-auto px-6 md:px-12 flex items-center justify-center md:justify-start">
             <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full mx-auto">
                
                {/* Poster Image (Card style) */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden md:block relative w-[240px] h-[360px] rounded-xl overflow-hidden shadow-2xl shrink-0"
                >
                   <Image
                     src={imageUrl}
                     alt={currentEvent.title?.trim() || 'Featured event poster'}
                     fill
                     className="object-cover"
                   />
                </motion.div>

                {/* Text Content */}
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 space-y-4 text-center md:text-left text-foreground"
                >
                   <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                        PREMIERE
                      </span>
                      <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                         {currentEvent.category}
                      </span>
                   </div>

                   <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none">
                     {currentEvent.title}
                   </h1>
                   
                   <div className="flex items-center justify-center md:justify-start gap-4 text-sm md:text-base font-medium text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {displayDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {displayTime}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {displayLocation}</span>
                   </div>

                   <p className="text-muted-foreground text-sm md:text-base line-clamp-3 max-w-xl mx-auto md:mx-0">
                      {currentEvent.description}
                   </p>

                   <div className="pt-4">
                      <Link href={`/events/${currentEvent.id}`} onClick={persistSelectedEvent}>
                        <Button size="lg" className="w-full md:w-auto font-semibold px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all">
                          Book Now
                        </Button>
                      </Link>
                   </div>
                </motion.div>
             </div>
          </div>
          
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {featuredEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 transition-all duration-300 rounded-full ${
              idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
             aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
