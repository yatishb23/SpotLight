'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const POPULAR_CITIES = [
  'Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad',
  'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow',
];

const OTHER_CITIES = [
  'Agra', 'Amritsar', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Coimbatore',
  'Dehradun', 'Goa', 'Guwahati', 'Indore', 'Kanpur', 'Kochi',
  'Ludhiana', 'Madurai', 'Nagpur', 'Nashik', 'Patna', 'Raipur',
  'Rajkot', 'Ranchi', 'Surat', 'Thiruvananthapuram', 'Vadodara',
  'Varanasi', 'Vijayawada', 'Visakhapatnam',
];

const ALL_CITIES = [...new Set([...POPULAR_CITIES, ...OTHER_CITIES])].sort();

interface CitySelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (city: string) => void;
}

export function CitySelectorModal({ open, onOpenChange, onSelect }: CitySelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return ALL_CITIES.filter((c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [searchQuery]);

  const handleSelect = (city: string) => {
    onSelect(city);
    onOpenChange(false);
    setSearchQuery('');
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 border-white/[0.07] bg-[#0d0d0d] shadow-2xl overflow-hidden rounded-2xl">
        <DialogHeader className="px-7 pt-7 pb-4">
          <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-white/30" />
            Choose your city
          </DialogTitle>
          <DialogDescription className="text-[12px] text-white/30 mt-1">
            We'll show events happening near you.
          </DialogDescription>
        </DialogHeader>

        <div className="px-7 pb-7">
          {/* Search */}
          <div className="relative mb-5 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 group-focus-within:text-white/50 transition-colors" />
            <Input
              placeholder="Search cities…"
              className="pl-10 h-10 bg-white/[0.04] border-white/[0.07] focus-visible:ring-1 focus-visible:ring-white/20 text-[13px] text-white rounded-xl placeholder:text-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <ScrollArea className="h-[300px] pr-2 -mr-2">
            {!searchQuery ? (
              <div className="space-y-6">
                {/* Popular */}
                <div>
                  <p className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.4em] mb-3">Popular</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSelect(city)}
                        className="px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.12] text-[11px] font-medium text-white/50 hover:text-white/80 transition-all text-center"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other */}
                <div>
                  <p className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.4em] mb-3">More cities</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5">
                    {OTHER_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSelect(city)}
                        className="text-left px-3 py-2 rounded-lg text-[12px] text-white/35 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSelect(city)}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-[12px] text-white/25">No results for "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[11px] text-white/30 hover:text-white/60 mt-2 transition-colors"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}