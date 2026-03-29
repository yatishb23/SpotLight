import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Ticket, Trash2 } from "lucide-react";
import Image from "next/image";

export const EventHeader = ({ 
  event, 
  status, 
  isEditing, 
  onBack, 
  onEdit, 
  onStatusChange, 
  onDelete,
  isUpdatingStatus 
}: any) => (
  <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Button variant="outline" onClick={onBack} className="border-neutral-800 hover:bg-neutral-900">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>
      {!isEditing && (
        <div className="flex gap-2">
          {/* Delete Button - Only visible in DRAFT */}
          {status === "DRAFT" && (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={onDelete} 
              disabled={isUpdatingStatus}
              className="bg-red-950/30 border border-red-900/50 hover:bg-red-900 text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          <Button variant="secondary" onClick={onEdit}>Edit Event</Button>
          
          {status === "DRAFT" && (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onStatusChange("PUBLISHED")} disabled={isUpdatingStatus}>
              Publish
            </Button>
          )}
          
          {(status === "DRAFT" || status === "PUBLISHED") && (
            <Button variant="outline" className="border-red-900 text-red-500 hover:bg-red-950/30" onClick={() => onStatusChange("CANCELLED")} disabled={isUpdatingStatus}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>

    {!isEditing && (
      <div className="relative group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="relative h-64 md:h-80 w-full">
          <Image 
            src={event.bannerS3Url || event.image || "/placeholder.svg"} 
            alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 p-6 w-full">
          <Badge className="mb-3 bg-neutral-950/50 text-neutral-300 border-neutral-800 backdrop-blur-md uppercase tracking-widest text-[10px]">
            {status}
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">{event.title}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-neutral-400">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> {new Date(event.startDatetime).toLocaleString()}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {event.venueName || event.city}</div>
            <div className="flex items-center gap-2"><Ticket className="w-4 h-4 text-emerald-500" /> ₹{event.ticketPrice}</div>
          </div>
        </div>
      </div>
    )}
  </div>
);