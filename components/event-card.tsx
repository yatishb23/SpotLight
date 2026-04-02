"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/date-utils";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  variant?: "default" | "portrait" | "compact";
  className?: string;
}

export function EventCard({
  event,
  variant = "default",
  className,
}: EventCardProps) {
  const persistSelectedEvent = () => {
    sessionStorage.setItem("selectedEvent", JSON.stringify(event));
  };

  const eventImage =
    event.bannerS3Url || (event as any).image || "/placeholder.svg";

  return (
    <Link
      href={`/events/${event.id}`}
      className="block group outline-none"
      onClick={persistSelectedEvent}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className={cn("flex flex-col gap-3", className)}
      >
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/[0.05] transition-all duration-300 group-hover:border-white/[0.12]",
            variant === "portrait" ? "aspect-[2/3]" : "aspect-[4/3]",
          )}
        >
          <Image
            src={eventImage}
            alt={event.title || "Event"}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category badge */}
          {event.category && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] font-medium tracking-wide uppercase bg-black/50 backdrop-blur-sm text-white/70 border border-white/10 px-2 py-0.5 rounded-md">
                {event.category}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5 px-0.5">
          <h3 className="text-[13px] font-medium text-white leading-snug line-clamp-1 group-hover:text-white/80 transition-colors">
            {event.title}
          </h3>

          <div className="flex items-center gap-1.5 text-white/35">
            <Calendar className="w-3 h-3 shrink-0" />
            <span className="text-[11px]">
              {formatDate(
                event.startDatetime || (event as any).date || new Date(),
              )}
            </span>
          </div>

          {(event.venueName || (event as any).location) && (
            <div className="flex items-center gap-1.5 text-white/30">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="text-[11px] truncate">
                {event.venueName || (event as any).location}
                {event.city ? `, ${event.city}` : ""}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
