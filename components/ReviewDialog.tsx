"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createReview } from "@/lib/api"; // Ensure this is in your API lib
import { useSession } from "next-auth/react";

export function ReviewDialog({ booking, isOpen, onClose, onRefresh }: any) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Rating protocol required");
    if (comment.length < 5) return toast.error("Observation data too short");

    try {
      setIsSubmitting(true);
      console.log({
        eventId: booking.eventId,
        rating,
        comment,
        userName: session?.user?.name,
        bookingId: booking.id,
        userId: localStorage.getItem("userId") || "unknown",
      });

      const response = await createReview({
        eventId: booking.eventId,
        rating,
        comment,
        userName: localStorage.getItem("userName") || "Anonymous",
        bookingId: booking.id,
        userId: localStorage.getItem("userId") || "unknown",
      });
      if(response.status===400){
        const errorData = await response.json();
        return toast.message(errorData?.message || "Failed to submit review");
      }
      else toast.success("Intelligence data logged. Thank you.");
      onRefresh?.();
      onClose();
    } catch (error) {
      toast.error("Registry sync failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#050505] border-neutral-900 text-neutral-200 max-w-md rounded-[32px] p-8 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-2 text-blue-500">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Post-Event Intelligence
            </span>
          </div>
          <DialogTitle className="text-3xl font-medium tracking-tighter text-white italic">
            Event Review.
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-xs font-light italic leading-relaxed">
            Logging feedback for{" "}
            <span className="text-neutral-300 font-bold underline decoration-neutral-800 underline-offset-4">
              {booking?.eventName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">
              Experience Rating
            </p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center group ${
                    rating >= s
                      ? "bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "bg-neutral-900 border-neutral-800 text-neutral-600 hover:border-neutral-600"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${rating >= s ? "fill-current" : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">
              Observations / Insights
            </p>
            <Textarea
              placeholder="Provide technical feedback or personal highlights..."
              className="bg-neutral-900/50 border-neutral-800 rounded-2xl min-h-[140px] focus:ring-0 focus:border-neutral-600 text-sm p-4 leading-relaxed"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-6 sm:flex-col">
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Syncing
                Intelligence...
              </div>
            ) : (
              "Commit Review"
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 opacity-30">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-500">
              Identity Verified Feedback
            </span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
