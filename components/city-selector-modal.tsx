"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, X, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const POPULAR_CITIES = [
  "Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad",
  "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow"
];

const OTHER_CITIES = [
  "Agra", "Amritsar", "Bhopal", "Bhubaneswar", "Chandigarh", "Coimbatore",
  "Dehradun", "Goa", "Guwahati", "Indore", "Kanpur", "Kochi",
  "Ludhiana", "Madurai", "Nagpur", "Nashik", "Patna", "Raipur",
  "Rajkot", "Ranchi", "Surat", "Thiruvananthapuram", "Vadodara",
  "Varanasi", "Vijayawada", "Visakhapatnam"
];

// Combine lists for a global search experience
const ALL_CITIES = [...new Set([...POPULAR_CITIES, ...OTHER_CITIES])].sort();

interface CitySelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (city: string) => void;
}

export function CitySelectorModal({ open, onOpenChange, onSelect }: CitySelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter logic: This now searches through EVERYTHING
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return ALL_CITIES.filter(city =>
      city.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [searchQuery]);

  const handleSelect = (city: string) => {
    onSelect(city);
    onOpenChange(false);
    setSearchQuery(""); // Clear search for next time
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-tighter">
            <MapPin className="h-5 w-5 text-zinc-500" /> 
            Select City
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Current location helps us find the best events near you.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 pt-2">
          {/* Search Input */}
          <div className="relative mb-6 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-zinc-100 transition-colors" />
            <Input 
              placeholder="Search for your city (e.g. Mumbai, Goa...)" 
              className="pl-11 h-12 bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 text-zinc-100 rounded-xl transition-all" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <ScrollArea className="h-[320px] pr-4 -mr-4">
            {/* If NO search query: Show Popular + Others */}
            {!searchQuery ? (
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Popular Cities</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSelect(city)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                      >
                        <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-100 text-center">
                          {city}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Other Cities</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {OTHER_CITIES.map((city) => (
                      <Button
                        key={city}
                        variant="ghost"
                        className="justify-start h-10 font-medium text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50 rounded-lg px-3"
                        onClick={() => handleSelect(city)}
                      >
                        {city}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* If SEARCH query: Show Results */
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Search Results</h4>
                <div className="flex flex-col gap-1">
                  {filteredCities.map((city) => (
                    <Button
                      key={city}
                      variant="ghost"
                      className="justify-between h-12 font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl px-4 group"
                      onClick={() => handleSelect(city)}
                    >
                      {city}
                      <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  ))}
                  
                  {filteredCities.length === 0 && (
                    <div className="py-20 text-center">
                      <p className="text-zinc-500 text-sm italic">" {searchQuery} " not found.</p>
                      <Button 
                        variant="link" 
                        className="text-zinc-400 mt-2 text-xs"
                        onClick={() => setSearchQuery("")}
                      >
                        View all cities
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}