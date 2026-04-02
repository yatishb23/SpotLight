'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoadingState } from '@/components/loading-state';
import { ErrorFallback } from '@/components/error-fallback';
import Link from 'next/link';
import type { Event as AppEvent } from '@/lib/types';
import { FeaturedCarousel } from '@/components/featured-carousel';
import { CategorySection } from '@/components/category-section';
import { apiClient } from '@/lib/api';
import { Globe, ShieldCheck, Headphones, Sparkles } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');

  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const savedCity = localStorage.getItem('selectedCity') || 'Mumbai';
    setSelectedCity(savedCity);
    const handleCityChanged = (event: any) => {
      const newCity = event.detail?.city;
      if (newCity) setSelectedCity(newCity);
    };
    window.addEventListener('cityChanged', handleCityChanged as EventListener);
    return () => window.removeEventListener('cityChanged', handleCityChanged as EventListener);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCity) return;
      try {
        setIsLoading(true);
        setError(null);
        const payload = await apiClient.getEventsByCity(selectedCity);
        const nextEvents = Array.isArray(payload) ? payload : (payload as any)?.data || [];
        setEvents(nextEvents);
      } catch {
        setError('Unable to load events for this city.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      setTimeout(() => {
        sectionRefs.current[selectedCategory]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [selectedCategory, isLoading]);

  const eventsByCategory = useMemo(() => {
    return events.reduce((acc, event) => {
      const cat = event.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(event);
      return acc;
    }, {} as Record<string, AppEvent[]>);
  }, [events]);

  const categoriesToShow = useMemo(() => Object.keys(eventsByCategory), [eventsByCategory]);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200">

      {/* Hero */}
      {(!selectedCategory || selectedCategory === 'All') && !isLoading && events.length > 0 && (
        <FeaturedCarousel events={events.slice(0, 5)} />
      )}

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto pb-24">
        {error ? (
          <div className="px-6 py-24 flex items-center justify-center">
            <ErrorFallback
              title="Couldn't load events"
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : isLoading ? (
          <div className="px-6 py-16">
            <LoadingState count={8} />
          </div>
        ) : (
          <div>
            {selectedCategory && selectedCategory !== 'All' ? (

              /* Filtered category view */
              <div className="px-6 md:px-10">
                <div className="flex items-center gap-3 py-12 border-b border-white/[0.04]">
                  <Sparkles className="w-4 h-4 text-white/20" />
                  <h1 className="text-2xl font-light tracking-tight text-white">
                    {selectedCategory}
                  </h1>
                </div>
                <CategorySection
                  title="All Events"
                  events={eventsByCategory[selectedCategory] || []}
                  className="border-0 pt-10"
                />
              </div>

            ) : (

              /* Default all-category view */
              <div>
                <CategorySection
                  title="Recommended for you"
                  events={events.slice(0, 10)}
                  background="subtle"
                />
                {categoriesToShow.map((category, index) => (
                  <div
                    key={category}
                    ref={(el) => { sectionRefs.current[category] = el; }}
                  >
                    <CategorySection
                      title={category}
                      events={eventsByCategory[category]}
                      background={index % 2 === 0 ? 'default' : 'muted'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#050505] pt-16 pb-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">

          {/* Footer columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="text-[15px] font-semibold text-white tracking-tight block mb-3">
                EventHub
              </span>
              <p className="text-[12px] text-white/25 leading-relaxed max-w-[200px]">
                Discover and book tickets for the best events in your city.
              </p>
            </div>

            {/* Links */}
            {[
              { title: 'Explore', links: ['Movies', 'Concerts', 'Workshops', 'Sports'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Impact'] },
              { title: 'Legal', links: ['Terms', 'Privacy', 'Cookies', 'Safety'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.4em] mb-5">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-[12px] text-white/30 hover:text-white/70 transition-colors duration-200"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.04] gap-4">
            <p className="text-[10px] text-white/15 font-medium tracking-wide">
              © 2026 EventHub Global Inc.
            </p>
            <div className="flex items-center gap-5">
              <Globe className="w-3.5 h-3.5 text-white/20 hover:text-white/50 cursor-pointer transition-colors" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60 hover:text-emerald-500 cursor-pointer transition-colors" />
              <Headphones className="w-3.5 h-3.5 text-white/20 hover:text-white/50 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}