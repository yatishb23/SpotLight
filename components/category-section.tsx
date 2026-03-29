'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { EventCard } from '@/components/event-card'; 
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategorySectionProps {
  title: string;
  events: any[];
  className?: string;
  viewAllLink?: string;
  background?: 'default' | 'muted' | 'subtle';
}

export function CategorySection({ 
    title, 
    events = [], 
    className, 
    viewAllLink = "#",
    background = "default" 
}: CategorySectionProps) {
  
  if (!events || events.length === 0) return null;

  return (
    <section className={cn(
        "py-10 border-b border-zinc-900 last:border-0", 
        background === 'muted' && "bg-zinc-900/30",
        background === 'subtle' && "bg-zinc-100/[0.01]",
        className
    )}>
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-100 uppercase italic">
              {title}
            </h2>
            <div className="h-0.5 w-10 bg-zinc-100 rounded-full" />
          </div>
          
          <Link 
            href={viewAllLink} 
            className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center hover:text-zinc-100 transition-colors group"
          >
            Explore <ChevronRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-6 pb-6">
            {events.map((event) => (
              <div key={event.id || event._id} className="w-[180px] md:w-[220px] shrink-0">
                <EventCard event={event} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-zinc-800/40" />
        </ScrollArea>
      </div>
    </section>
  );
}