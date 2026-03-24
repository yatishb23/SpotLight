'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative h-[500px] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full container flex flex-col items-center justify-center text-center text-white space-y-6 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        >
          Discover Events Near You
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-200 max-w-2xl"
        >
          From concerts to conferences, find the perfect experience for your next adventure.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-2xl bg-white rounded-full flex items-center p-1 shadow-lg"
        >
           <Search className="h-5 w-5 text-gray-400 ml-4 hidden sm:block" />
           <input 
             type="text" 
             placeholder="Search for movies, events, sports..." 
             className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400 px-4 py-3 outline-none"
           />
           <Button size="lg" className="rounded-full px-8">
             Search
           </Button>
        </motion.div>
      </div>
    </section>
  );
}
