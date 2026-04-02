"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  changeEventStatus,
  getBookingsByEvent,
  getEventById,
  updateEvent,
  getEventReviews,
  deleteEvent,
  deleteReview,
} from "@/lib/api";
import { toast } from "sonner";
import {
  MessageSquare,
  Users,
  Trash2,
  Star,
  ShieldCheck,
  Activity,
  History,
  Loader2,
} from "lucide-react";

import { EventHeader } from "@/components/events/event-header";
import { BookingFilters } from "@/components/events/booking-filters";
import { EditEventForm } from "@/components/events/edit-event-form";
import { EventStats } from "@/components/events/event-stats";
import { BookingList } from "@/components/events/booking-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function OrganizerEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    totalCapacity: "",
    ticketPrice: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [checkInFilter, setCheckInFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  // ✅ FETCH DATA (FIXED NORMALIZATION)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [eRes, bRes, rRes] = await Promise.all([
          getEventById(eventId),
          getBookingsByEvent(eventId),
          getEventReviews(eventId),
        ]);

        // EVENT
        const eventData = eRes?.data ?? eRes;
        setEvent(eventData || null);

        // BOOKINGS (FIXED 🔥)
        let bookingsData =
          bRes?.data ?? bRes?.bookings ?? (Array.isArray(bRes) ? bRes : []);

        if (!Array.isArray(bookingsData)) bookingsData = [];

        setBookings(bookingsData);

        // REVIEWS
        const reviewData = rRes?.data ?? rRes ?? {};
        const reviewList =
          reviewData?.reviews ?? (Array.isArray(reviewData) ? reviewData : []);

        setReviews(Array.isArray(reviewList) ? reviewList : []);

        setReviewsSummary({
          averageRating: Number(reviewData?.averageRating ?? 0),
          totalReviews: Number(reviewData?.totalReviews ?? 0),
        });
      } catch (err) {
        toast.error("Failed to load event data");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId]);

  // ✅ PREFILL EDIT FORM
  useEffect(() => {
    if (!event) return;

    const start = event?.startDatetime ? new Date(event.startDatetime) : null;

    setEditForm({
      title: event?.title || "",
      description: event?.description || "",
      category: event?.category || "",
      date: start ? start.toISOString().slice(0, 10) : "",
      time: start ? start.toISOString().slice(11, 16) : "",
      location: event?.address || event?.venueName || "",
      totalCapacity: String(event?.totalCapacity || ""),
      ticketPrice: String(event?.ticketPrice || 0),
    });
  }, [event]);

  // ✅ DELETE REVIEW
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Delete review?")) return;

    try {
      await deleteReview(eventId, reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  // ✅ DELETE EVENT
  const handleDelete = async () => {
    if (!confirm("Delete event permanently?")) return;

    try {
      setIsUpdatingStatus(true);
      await deleteEvent(eventId);
      toast.success("Event deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ✅ STATUS CHANGE
  const handleStatusChange = async (next: any) => {
    try {
      setIsUpdatingStatus(true);
      await changeEventStatus(eventId, next);
      setEvent((p: any) => ({ ...p, status: next }));
      toast.success(`Status updated`);
    } catch {
      toast.error("Failed");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ✅ SAVE EDIT
  const handleSaveEdit = async () => {
    try {
      setIsSavingEdit(true);

      const formData = new FormData();
      formData.append("data", JSON.stringify({ eventId, ...editForm }));

      if (newBannerFile) formData.append("file", newBannerFile);

      await updateEvent(formData);

      setEvent((p: any) => ({ ...p, ...editForm }));
      setIsEditing(false);

      toast.success("Updated successfully");
    } catch {
      toast.error("Update failed");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ✅ FILTER + SORT (FIXED 🔥)
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    if (searchTerm) {
      list = list.filter((b) =>
        `${b?.userName || ""} ${b?.userEmail || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "ALL") {
      list = list.filter((b) => b?.status === statusFilter);
    }

    if (checkInFilter !== "ALL") {
      list = list.filter((b) =>
        checkInFilter === "CHECKED_IN"
          ? b?.checkedIn === true
          : b?.checkedIn === false,
      );
    }

    // SORT FIX
    if (sortBy === "NEWEST") {
      list.sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime(),
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(a?.createdAt || 0).getTime() -
          new Date(b?.createdAt || 0).getTime(),
      );
    }

    return list;
  }, [bookings, searchTerm, statusFilter, checkInFilter, sortBy]);

  // ✅ SUMMARY
  const bookingSummary = useMemo(() => {
    return filteredBookings.reduce(
      (acc, b) => ({
        totalBookings: acc.totalBookings + 1,
        totalSeats: acc.totalSeats + Number(b?.quantity || 0),
        totalRevenue: acc.totalRevenue + Number(b?.totalAmount || 0),
      }),
      { totalBookings: 0, totalSeats: 0, totalRevenue: 0 },
    );
  }, [filteredBookings]);

  // LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-white opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* HEADER */}
        <header className="border-b border-neutral-900 pb-10">
          <div className="flex items-center gap-2 text-blue-500 mb-3">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.4em]">
              Event Control Center
            </span>
          </div>

          <EventHeader
            event={event}
            status={event?.status}
            isEditing={isEditing}
            onBack={() => router.push("/dashboard")}
            onEdit={() => setIsEditing(true)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            isUpdatingStatus={isUpdatingStatus}
          />
        </header>

        {/* MAIN */}
        {isEditing ? (
          <EditEventForm
            editForm={editForm}
            setEditForm={setEditForm}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            isSavingEdit={isSavingEdit}
            setNewBannerFile={setNewBannerFile}
          />
        ) : (
          <Tabs defaultValue="bookings">
            {/* STATS */}
            <EventStats
              summary={bookingSummary}
              formatCurrency={formatCurrency}
            />

            <TabsList className="bg-neutral-900/50 border border-neutral-800 p-1 h-14 rounded-2xl">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* BOOKINGS */}
            <TabsContent value="bookings">
              <BookingFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                checkInFilter={checkInFilter}
                setCheckInFilter={setCheckInFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onClear={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
              />

              <Separator className="my-6 bg-neutral-900/50" />

              {/* 🔥 ALWAYS SHOW */}
              <BookingList
                bookings={filteredBookings || []}
                formatCurrency={formatCurrency}
              />
            </TabsContent>

            {/* REVIEWS */}
            <TabsContent value="reviews">
              {reviews.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <History className="w-12 h-12 mx-auto mb-4" />
                  No reviews yet
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="mb-4">
                    <p>{r.comment}</p>
                    <Button onClick={() => handleDeleteReview(r.id)}>
                      <Trash2 />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* FOOTER */}
        <footer className="pt-10 border-t border-neutral-900 opacity-20 flex justify-between">
          <p className="text-xs">SECURE SESSION</p>
          <p className="text-xs">{new Date().toLocaleTimeString()}</p>
        </footer>
      </div>
    </div>
  );
}
