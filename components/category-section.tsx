'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
  viewAllLink = '#',
  background = 'default',
}: CategorySectionProps) {
  if (!events || events.length === 0) return null;

  return (
    <section
      className={cn(
        'py-12 border-b border-white/[0.04] last:border-0',
        background === 'muted' && 'bg-white/[0.015]',
        background === 'subtle' && 'bg-white/[0.008]',
        className
      )}
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-semibold tracking-[0.5em] text-white/20 uppercase select-none">
              —
            </span>
            <h2 className="text-[11px] font-semibold tracking-[0.35em] text-white/40 uppercase">
              {title}
            </h2>
          </div>

          <Link
            href={viewAllLink}
            className="group flex items-center gap-1.5 text-[10px] font-medium tracking-[0.2em] text-white/20 hover:text-white/60 uppercase transition-colors duration-300"
          >
            View all
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Cards Row */}
        <ScrollArea className="w-full whitespace-nowrap -mx-1">
          <div className="flex gap-4 pb-4 px-1">
            {events.map((event) => (
              <div
                key={event.id || event._id}
                className="w-[190px] md:w-[230px] shrink-0"
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
          <ScrollBar
            orientation="horizontal"
            className="h-[2px] bg-white/[0.04] [&>div]:bg-white/20"
          />
        </ScrollArea>
      </div>
    </section>
  );
}