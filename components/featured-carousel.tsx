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
  const imageUrl =
    currentEvent.bannerS3Url || (currentEvent as any).image || '/placeholder.svg';
  const displayDate = currentEvent.startDatetime
    ? new Date(currentEvent.startDatetime).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : (currentEvent as any).date || 'TBA';
  const displayTime = currentEvent.startDatetime
    ? new Date(currentEvent.startDatetime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : (currentEvent as any).time || 'TBA';
  const displayLocation = currentEvent.venueName
    ? `${currentEvent.venueName}${currentEvent.city ? `, ${currentEvent.city}` : ''}`
    : (currentEvent as any).location || 'Location TBA';

  const persistSelectedEvent = () => {
    sessionStorage.setItem('selectedEvent', JSON.stringify(currentEvent));
  };

  return (
    <div className="relative w-full h-[340px] md:h-[480px] overflow-hidden">

      {/* Blurred background */}
      <AnimatePresence>
        <motion.div
          key={`bg-${currentEvent.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover scale-110 blur-[80px] opacity-20 grayscale"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-10 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex items-center gap-10 md:gap-16 w-full"
          >
            {/* Poster */}
            <div className="hidden md:block relative w-[200px] h-[300px] shrink-0 rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/60">
              <Image
                src={imageUrl}
                alt={currentEvent.title || 'Event poster'}
                fill
                className="object-cover"
                priority
              />
              {/* Subtle inner shadow */}
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]" />
            </div>

            {/* Text */}
            <div className="flex-1 space-y-5 max-w-xl">

              {/* Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.4em] uppercase text-white/30">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                  {currentEvent.category || 'Featured'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[1.1] text-white">
                {currentEvent.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {[
                  { icon: Calendar, label: displayDate },
                  { icon: Clock, label: displayTime },
                  { icon: MapPin, label: displayLocation },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-white/30"
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[180px]">{label}</span>
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-[13px] text-white/35 leading-relaxed line-clamp-2 font-light">
                {currentEvent.description}
              </p>

              {/* CTA */}
              <Link href={`/events/${currentEvent.id}`} onClick={persistSelectedEvent}>
                <Button className="mt-2 group bg-white text-black hover:bg-white/90 text-[11px] font-semibold tracking-[0.15em] uppercase h-11 px-8 rounded-xl transition-all duration-200">
                  Get Tickets
                  <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 right-8 flex items-center gap-2 z-20">
        {featuredEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`rounded-full transition-all duration-400 outline-none ${
              idx === currentIndex
                ? 'w-5 h-[3px] bg-white rounded-sm'
                : 'w-[3px] h-[3px] bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}