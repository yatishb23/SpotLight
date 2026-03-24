'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { EventCard } from '@/components/event-card'; 
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Event } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategorySectionProps {
  title: string;
  events: Event[];
  className?: string;
  viewAllLink?: string;
  background?: 'default' | 'muted' | 'subtle';
}

export function CategorySection({ 
    title, 
    events, 
    className, 
    viewAllLink = "#",
    background = "default" 
}: CategorySectionProps) {
  if (!events || events.length === 0) return null;

  return (
    <section className={cn(
        "py-8 md:py-12 border-b last:border-0", 
        background === 'muted' && "bg-muted/30",
        background === 'subtle' && "bg-primary/5",
        className
    )}>
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
            {title}
          </h2>
          <Link 
            href={viewAllLink} 
            className="text-primary text-sm font-medium flex items-center hover:underline group"
          >
            See all <ChevronRight className="w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap -mx-4 px-4 sm:overflow-visible sm:px-0">
          <div className="flex space-x-4 pb-4">
            {events.map((event) => (
              <div key={event.id} className="w-[160px] md:w-[200px] flex-none">
                <EventCard event={event} variant="portrait" />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible sm:visible" />
        </ScrollArea>
      </div>
    </section>
  );
}
