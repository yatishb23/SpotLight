'use client';

import { motion } from 'framer-motion';
import { 
  Film, 
  Music, 
  MapPin, 
  Activity, 
  Theater, 
  Gamepad2, 
  Laugh, 
  Mic2,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { name: 'All', icon: LayoutGrid, color: 'text-gray-500' },
  { name: 'Movies', icon: Film, color: 'text-red-500' },
  { name: 'Music', icon: Music, color: 'text-blue-500' },
  { name: 'Sports', icon: Activity, color: 'text-orange-500' },
  { name: 'Arts', icon: Theater, color: 'text-purple-500' },
  { name: 'Comedy', icon: Laugh, color: 'text-yellow-500' },
  { name: 'Activities', icon: MapPin, color: 'text-green-500' },
  { name: 'Technology', icon: Gamepad2, color: 'text-indigo-500' },
];

export function CategoryBar({ selectedCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <div className="w-full bg-background/80 backdrop-blur sticky top-16 z-30 border-b">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-2">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-2 pb-1">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.name || (selectedCategory === '' && category.name === 'All');
              return (
              <button
                key={category.name}
                onClick={() => onSelectCategory(category.name === 'All' ? '' : category.name)}
                className={cn(
                  "flex flex-col items-center gap-1 group cursor-pointer min-w-[56px] py-1 px-2 rounded-md transition-all duration-200",
                  isSelected ? "bg-primary/5" : "hover:bg-muted"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-full transition-colors",
                  isSelected ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  <category.icon className="h-4 w-4" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors", 
                  isSelected ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {category.name}
                </span>
              </button>
            )})}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </div>
  );
}
