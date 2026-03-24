"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const POPULAR_CITIES = [
  "Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad", 
  "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow"
]

const OTHER_CITIES = [
  "Agra", "Amritsar", "Bhopal", "Bhubaneswar", "Chandigarh", "Coimbatore",
  "Dehradun", "Goa", "Guwahati", "Indore", "Kanpur", "Kochi", 
  "Ludhiana", "Madurai", "Nagpur", "Nashik", "Patna", "Raipur", 
  "Rajkot", "Ranchi", "Surat", "Thiruvananthapuram", "Vadodara", 
  "Varanasi", "Vijayawada", "Visakhapatnam"
]

interface CitySelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void // Detect close
  onSelect: (city: string) => void
}

export function CitySelectorModal({ open, onOpenChange, onSelect }: CitySelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")

  const filteredCities = OTHER_CITIES.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ✅ Default city
  useEffect(() => {
    setSelectedCity("Mumbai")
    onSelect("Mumbai") // pass to parent
  }, [])

  const handleSelect = (city: string) => {
    setSelectedCity(city)
    onSelect(city)
    onOpenChange(false) // close modal after selection
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl text-center">Select Your City</DialogTitle>
          <DialogDescription className="text-center">
            Find events and activities near you
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 pt-2">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for your city..." 
              className="pl-9 bg-muted/50" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {!searchQuery && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider text-[11px]">Popular Cities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {POPULAR_CITIES.map((city) => (
                  <Button
                    key={city}
                    variant="outline"
                    className="h-auto py-3 justify-center text-sm font-normal hover:border-primary hover:text-primary transition-colors"
                    onClick={() => handleSelect(city)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <MapPin className="h-4 w-4 opacity-50" />
                      {city}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            {searchQuery && <h4 className="text-sm font-medium text-muted-foreground mb-2 sticky top-0 bg-background py-1 uppercase tracking-wider text-[11px]">All Cities</h4>}
            <ScrollArea className="h-[200px] pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(searchQuery ? filteredCities : OTHER_CITIES).map((city) => (
                  <Button
                    key={city}
                    variant="ghost"
                    className="justify-start h-9 font-normal"
                    onClick={() => handleSelect(city)}
                  >
                    {city}
                  </Button>
                ))}
                {searchQuery && filteredCities.length === 0 && (
                   <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                     No cities found matching "{searchQuery}"
                   </div>
                )}
              </div>
            </ScrollArea>
           {!searchQuery && <div className="text-center mt-4">
               <button className="text-xs text-primary underline" onClick={() => setSearchQuery(" ")}>View all cities</button>
           </div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}