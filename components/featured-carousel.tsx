'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import type { Event } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedCarouselProps {
  events: Event[];
}

export function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const featuredEvents = events.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredEvents.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  if (featuredEvents.length === 0) return null;

  const currentEvent = featuredEvents[currentIndex];
  
  const imageUrl = currentEvent.bannerS3Url || (currentEvent as any).image || '/placeholder.svg';
  const displayDate = currentEvent.startDatetime 
    ? new Date(currentEvent.startDatetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : (currentEvent as any).date || "Awaiting Data";
  const displayTime = currentEvent.startDatetime
    ? new Date(currentEvent.startDatetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : (currentEvent as any).time || "TBD";
  const displayLocation = currentEvent.venueName 
    ? `${currentEvent.venueName}, ${currentEvent.city || ''}` 
    : (currentEvent as any).location || "Registry Location Error";

  const persistSelectedEvent = () => {
    sessionStorage.setItem('selectedEvent', JSON.stringify(currentEvent));
  };

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden bg-[#0a0a0a] border-b border-neutral-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full"
        >
          {/* Main Background Image */}
           <div className="absolute inset-0 overflow-hidden">
             <Image
               src={imageUrl}
               alt={currentEvent.title?.trim() || 'Featured event image'}
               fill
               className="object-cover blur-[100px] opacity-30 scale-110 grayscale"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#0a0a0a]/80 to-transparent" />
          </div>

          {/* Content Container */}
          <div className="w-full max-w-7xl relative h-full mx-auto px-6 lg:px-12 flex items-center justify-center md:justify-start">
             <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full mx-auto">
                
                {/* Poster Image */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden md:block relative w-[240px] h-[360px] rounded-[24px] overflow-hidden shadow-2xl shrink-0 border border-neutral-800 bg-[#050505]"
                >
                   <Image
                     src={imageUrl}
                     alt={currentEvent.title?.trim() || 'Featured event poster'}
                     fill
                     className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                   />
                </motion.div>

                {/* Text Content */}
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 space-y-6 text-center md:text-left text-neutral-200"
                >
                   <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                      <span className="bg-white text-black px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest">
                        Tier 1 Network
                      </span>
                      <span className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em]">
                         Protocol: {currentEvent.category || "UNCLASSIFIED"}
                      </span>
                   </div>

                   <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none text-white italic">
                     {currentEvent.title}
                   </h1>
                   
                   <div className="flex items-center justify-center md:justify-start gap-6 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                      <span className="flex items-center gap-2"><Calendar className="w-3 h-3"/> {displayDate}</span>
                      <span className="flex items-center gap-2"><Clock className="w-3 h-3"/> {displayTime}</span>
                      <span className="flex items-center gap-2 truncate max-w-[200px]"><MapPin className="w-3 h-3"/> {displayLocation}</span>
                   </div>

                   <p className="text-neutral-500 text-sm font-light leading-relaxed line-clamp-2 max-w-xl mx-auto md:mx-0 pr-4">
                      {currentEvent.description}
                   </p>

                   <div className="pt-4">
                      <Link href={`/events/${currentEvent.id}`} onClick={persistSelectedEvent}>
                        <Button className="w-full md:w-auto bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-[0.2em] text-[10px] px-10 h-12 rounded-xl group transition-all">
                          Initialize Access <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                   </div>
                </motion.div>
             </div>
          </div>
          
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20 items-center">
        {featuredEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-500 rounded-sm outline-none ${
              idx === currentIndex ? 'w-6 h-1 bg-white' : 'w-2 h-1 bg-neutral-800 hover:bg-neutral-600'
            }`}
             aria-label={`Go to Registry Key ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
