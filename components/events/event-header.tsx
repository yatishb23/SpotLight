import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

export function EventHeader({ event }: { event: any }) {
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
      <div className="relative h-64 w-full">
        <Image 
          src={event.bannerS3Url || event.image || "/placeholder.svg"} 
          alt="Banner" 
          fill 
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <Badge className="mb-3 bg-white/10 backdrop-blur-md text-white border-white/20 uppercase tracking-widest text-[10px]">
            {event.status}
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-neutral-300 text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-500" /> {new Date(event.startDatetime).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-500" /> {event.venueName || event.city}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-500" /> {event.totalCapacity} Capacity</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-neutral-400 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
}