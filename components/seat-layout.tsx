"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: "available" | "booked" | "locked" | "selected";
  price: number;
  type: "VIP" | "Gold" | "Silver" | "General";
}

interface SeatLayoutProps {
  seats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  selectedSeats: string[];
  maxSelectable?: number;
}

export function SeatLayout({
  seats,
  onSeatSelect,
  selectedSeats,
  maxSelectable = 10,
}: SeatLayoutProps) {
  // Group seats by row
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();
  const hasTierSections = seats.some(
    (seat) => seat.type === "VIP" || seat.type === "Gold",
  );
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="w-full overflow-x-auto pb-12">
      <div className="min-w-[600px] flex flex-col items-center gap-8">
        {/* Screen */}
        <div className="w-3/4 h-12 bg-gradient-to-b from-primary/20 to-transparent rounded-t-[50%] border-t-4 border-primary/30 flex items-center justify-center text-muted-foreground text-sm uppercase tracking-widest shadow-[0_-10px_20px_-5px_rgba(var(--primary),0.2)]">
          Screen
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-center gap-3">
              <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                {row}
              </span>
              <div className="flex gap-1.5 md:gap-3">
                {seats
                  .filter((s) => s.row === row)
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    const isBooked = seat.status === "booked";
                    const isLocked = seat.status === "locked";

                    return (
                      <button
                        key={seat.id}
                        disabled={isBooked || isLocked}
                        onClick={() => onSeatSelect(seat)}
                        className={cn(
                          "w-8 h-8 md:w-10 md:h-10 rounded-t-lg border-b-4 text-xs font-medium transition-all duration-200 flex items-center justify-center relative group",
                          isBooked
                            ? "bg-muted text-muted-foreground cursor-not-allowed border-muted-foreground/30"
                            : isLocked
                              ? "bg-yellow-500/20 text-yellow-600 border-yellow-500 cursor-not-allowed"
                              : isSelected
                                ? "bg-primary text-primary-foreground border-primary-foreground/50 shadow-lg translate-y-[-2px]"
                                : seat.type === "VIP"
                                  ? "bg-purple-100 hover:bg-purple-200 border-purple-400 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-600"
                                  : seat.type === "Gold"
                                    ? "bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-600"
                                    : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300",
                        )}
                        title={`${seat.type} - ${formatINR(seat.price)}`}
                      >
                        {seat.number}
                        {/* Hover Tooltip */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {seat.row}
                          {seat.number} • {formatINR(seat.price)}
                        </span>
                      </button>
                    );
                  })}
              </div>
              <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                {row}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-6 border-t w-full max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-t-lg border-b-4 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600" />
            <span className="text-sm text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-t-lg border-b-4 bg-primary border-primary-foreground/50" />
            <span className="text-sm text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-t-lg border-b-4 bg-muted border-muted-foreground/30" />
            <span className="text-sm text-muted-foreground">Sold</span>
          </div>
          {hasTierSections && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-t-lg border-b-4 bg-purple-100 border-purple-400 dark:bg-purple-900/40 dark:border-purple-600" />
              <span className="text-sm text-muted-foreground">VIP</span>
            </div>
          )}
          {hasTierSections && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-t-lg border-b-4 bg-amber-100 border-amber-400 dark:bg-amber-900/40 dark:border-amber-600" />
              <span className="text-sm text-muted-foreground">Gold</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
