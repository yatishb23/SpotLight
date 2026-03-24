"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/date-utils";
import Image from "next/image";
import { Calendar, MapPin, Users } from "lucide-react";

interface EventBannerProps {
  event: Event;
  onBookClick?: () => void;
}

export function EventBanner({ event, onBookClick }: EventBannerProps) {
  const availableTickets = event.availableCapacity;
  const isSoldOut = availableTickets <= 0;
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="relative w-full">
      <div className="relative h-80 md:h-96 w-full overflow-hidden rounded-lg">
        <Image
          src={event.bannerS3Url || (event as any).image || "/placeholder.svg"}
          alt={event.title?.trim() || "Event banner image"}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-white text-black hover:bg-gray-200">
                {event.category}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                {event.organizerId}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {event.title}
            </h1>

            <div className="space-y-2 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {formatDate(
                    event.startDatetime || (event as any).date || new Date(),
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>
                  {event.venueName || (event as any).location},{" "}
                  {event.city || ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>
                  {availableTickets} of {event.totalCapacity} tickets available
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:min-w-fit">
            <div className="text-white text-center">
              <p className="text-sm text-white/70">Price per ticket</p>
              <p className="text-3xl font-bold">
                {formatINR(event.ticketPrice)}
              </p>
            </div>
            <Button
              size="lg"
              onClick={onBookClick}
              disabled={isSoldOut}
              className="w-full md:w-auto"
            >
              {isSoldOut ? "Sold Out" : "Book Tickets"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
