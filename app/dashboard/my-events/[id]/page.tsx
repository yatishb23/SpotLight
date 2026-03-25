"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  changeEventStatus,
  getBookingsByEvent,
  getEventById,
  updateEvent,
  getEventReviews,
} from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";

export default function OrganizerEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<{
    averageRating: number;
    totalReviews: number;
  }>({ averageRating: 0, totalReviews: 0 });
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
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST");

  const normalizeResponse = (response: any): any[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.bookings)) return response.bookings;
    return [];
  };

  const formatCurrency = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);

        const [eventResponse, bookingsResponse, reviewsResponse] =
          await Promise.all([
            getEventById(eventId),
            getBookingsByEvent(eventId),
            getEventReviews(eventId),
          ]);

        setEvent(eventResponse?.data ?? eventResponse ?? null);

        const normalizedBookings = normalizeResponse(bookingsResponse as any);
        setBookings(normalizedBookings);

        const reviewsData = (reviewsResponse as any)?.data || reviewsResponse;
        if (reviewsData && typeof reviewsData === "object") {
          setReviewsSummary({
            averageRating: reviewsData.averageRating || 0,
            totalReviews: reviewsData.totalReviews || 0,
          });
          const normalizedReviews = Array.isArray(reviewsData.reviews)
            ? reviewsData.reviews
            : [];
          setReviews(normalizedReviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Failed to load event details:", error);
        toast.error("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const status = String(event?.status || "DRAFT").toUpperCase();
  const canEdit = status === "DRAFT" || status === "PUBLISHED";

  useEffect(() => {
    if (!event) return;

    const start = event.startDatetime ? new Date(event.startDatetime) : null;
    const date = start ? start.toISOString().slice(0, 10) : "";
    const time = start ? start.toISOString().slice(11, 16) : "";

    setEditForm({
      title: String(event.title || ""),
      description: String(event.description || ""),
      category: String(event.category || ""),
      date,
      time,
      location: String(event.address || event.venueName || event.city || ""),
      totalCapacity: String(event.totalCapacity ?? event.capacity ?? ""),
      ticketPrice: String(event.ticketPrice ?? 0),
    });
    setNewBannerFile(null);
  }, [event]);
  const mergedBookings = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    if (safeBookings.length > 0) return safeBookings;
    if (!event) return [];
    if (Array.isArray(event.bookings)) return event.bookings;
    if (Array.isArray(event.tickets)) return event.tickets;
    return [];
  }, [bookings, event]);

  const filteredBookings = useMemo(() => {
    const safeBookings = Array.isArray(mergedBookings)
      ? [...mergedBookings]
      : [];
    const search = searchTerm.trim().toLowerCase();
    const min = minAmount.trim() === "" ? null : Number(minAmount);
    const max = maxAmount.trim() === "" ? null : Number(maxAmount);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    const filtered = safeBookings.filter((booking: any) => {
      const bookingStatus = String(booking?.status || "UNKNOWN").toUpperCase();
      const bookingTotal = Number(booking?.totalAmount || 0);
      const bookingDate = booking?.createdAt
        ? new Date(booking.createdAt)
        : null;
      const isCheckedIn = Boolean(booking?.checkedInAt);

      const text = [
        booking?.id,
        booking?.eventName,
        booking?.userName,
        booking?.userEmail,
        booking?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = search === "" || text.includes(search);
      const matchesStatus =
        statusFilter === "ALL" || bookingStatus === statusFilter;
      const matchesCheckIn =
        checkInFilter === "ALL" ||
        (checkInFilter === "CHECKED_IN" && isCheckedIn) ||
        (checkInFilter === "NOT_CHECKED_IN" && !isCheckedIn);
      const matchesMin = min === null || (!isNaN(min) && bookingTotal >= min);
      const matchesMax = max === null || (!isNaN(max) && bookingTotal <= max);
      const matchesFrom = !from || (bookingDate && bookingDate >= from);
      const matchesTo = !to || (bookingDate && bookingDate <= to);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCheckIn &&
        matchesMin &&
        matchesMax &&
        matchesFrom &&
        matchesTo
      );
    });

    filtered.sort((a: any, b: any) => {
      const aAmount = Number(a?.totalAmount || 0);
      const bAmount = Number(b?.totalAmount || 0);
      const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      const aSeats = Number(a?.quantity || 0);
      const bSeats = Number(b?.quantity || 0);

      if (sortBy === "OLDEST") return aDate - bDate;
      if (sortBy === "HIGHEST_AMOUNT") return bAmount - aAmount;
      if (sortBy === "LOWEST_AMOUNT") return aAmount - bAmount;
      if (sortBy === "MOST_SEATS") return bSeats - aSeats;
      if (sortBy === "LEAST_SEATS") return aSeats - bSeats;
      return bDate - aDate;
    });

    return filtered;
  }, [
    mergedBookings,
    searchTerm,
    statusFilter,
    checkInFilter,
    minAmount,
    maxAmount,
    fromDate,
    toDate,
    sortBy,
  ]);

  const bookingSummary = useMemo(() => {
    const list = Array.isArray(filteredBookings) ? filteredBookings : [];
    return list.reduce(
      (acc, booking) => {
        acc.totalBookings += 1;
        acc.totalSeats += Number(booking?.quantity || 0);
        acc.totalRevenue += Number(booking?.totalAmount || 0);
        return acc;
      },
      { totalBookings: 0, totalSeats: 0, totalRevenue: 0 },
    );
  }, [filteredBookings]);

  const getBookingStatusClasses = (bookingStatus: string) => {
    const statusValue = String(bookingStatus || "UNKNOWN").toUpperCase();

    if (statusValue === "CONFIRMED") {
      return "bg-neutral-800 text-neutral-100 border-neutral-700";
    }

    if (statusValue === "PENDING_PAYMENT") {
      return "bg-neutral-900 text-neutral-300 border-neutral-700";
    }

    if (statusValue === "CANCELLED") {
      return "bg-neutral-900 text-neutral-400 border-neutral-800";
    }

    return "bg-neutral-900 text-neutral-300 border-neutral-700";
  };

  const handleStatusChange = async (nextStatus: "PUBLISHED" | "CANCELLED") => {
    if (!event?.id) return;

    try {
      setIsUpdatingStatus(true);
      await changeEventStatus(String(event.id), nextStatus);
      setEvent((prev: any) => ({ ...prev, status: nextStatus }));
      toast.success(`Event ${nextStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Failed to update event status:", error);
      toast.error("Failed to update event status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!event?.id) return;

    const title = editForm.title.trim();
    const description = editForm.description.trim();
    const category = editForm.category.trim();
    const location = editForm.location.trim();
    const totalCapacity = Number(editForm.totalCapacity);
    const ticketPrice = Number(editForm.ticketPrice || 0);

    if (!title || !description || !category || !location) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!editForm.date || !editForm.time) {
      toast.error("Please select date and time");
      return;
    }

    if (!Number.isFinite(totalCapacity) || totalCapacity < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
      toast.error("Ticket price must be 0 or more");
      return;
    }

    try {
      setIsSavingEdit(true);

      const startDatetime = new Date(
        `${editForm.date}T${editForm.time}`,
      ).toISOString();

      const prevStart = event?.startDatetime
        ? new Date(event.startDatetime).getTime()
        : NaN;
      const prevEnd = event?.endDatetime
        ? new Date(event.endDatetime).getTime()
        : NaN;
      const durationMs =
        Number.isFinite(prevStart) &&
        Number.isFinite(prevEnd) &&
        prevEnd > prevStart
          ? prevEnd - prevStart
          : 3 * 60 * 60 * 1000;
      const endDatetime = new Date(
        new Date(`${editForm.date}T${editForm.time}`).getTime() + durationMs,
      ).toISOString();

      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          eventId: String(event.id),
          title,
          description,
          category,
          startDatetime,
          endDatetime,
          timezone: String(event.timezone || "Asia/Kolkata"),
          venueName: location.split(",")[0] || location,
          address: location,
          city: String(event.city || "Pune"),
          country: String(event.country || "India"),
          totalCapacity,
          ticketType: ticketPrice > 0 ? "PAID" : "FREE",
          ticketPrice,
          currency: String(event.currency || "INR"),
          s3URLString: String(
            event.bannerS3Url || event.s3URLString || event.image || "",
          ),
        }),
      );

      if (newBannerFile) {
        formData.append("file", newBannerFile);
      }

      await updateEvent(formData);

      setEvent((prev: any) => ({
        ...prev,
        title,
        description,
        category,
        startDatetime,
        endDatetime,
        venueName: location.split(",")[0] || location,
        address: location,
        totalCapacity,
        ticketPrice,
        ticketType: ticketPrice > 0 ? "PAID" : "FREE",
      }));

      setIsEditing(false);
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error("Failed to update event");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const StatTile = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-neutral-100">{value}</p>
    </div>
  );

  const BookingRow = ({ booking }: { booking: any }) => (
    <div
      key={booking.userId || booking.id || `${booking.quantity}`}
      className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm space-y-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-neutral-100">
            {booking.userName || "Unknown User"}
          </p>
          <p className="text-xs text-neutral-400">
            {booking.userEmail || booking.userId || "No user email"}
          </p>
        </div>
        <Badge
          variant="outline"
          className={getBookingStatusClasses(booking.status)}
        >
          {String(booking.status || "UNKNOWN").replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 text-xs text-neutral-400 md:grid-cols-3">
        <p>
          Booking ID:{" "}
          <span className="font-medium text-neutral-100">
            {booking.id || "N/A"}
          </span>
        </p>
        <p>
          Event:{" "}
          <span className="font-medium text-neutral-100">
            {booking.eventName || event.title || "N/A"}
          </span>
        </p>
        <p>
          Seats:{" "}
          <span className="font-medium text-neutral-100">
            {Number(booking.quantity || 0)}
          </span>
        </p>
        <p>
          Unit Price:{" "}
          <span className="font-medium text-neutral-100">
            {formatCurrency(
              Number(booking.unitPrice || 0),
              booking.currency || "INR",
            )}
          </span>
        </p>
        <p>
          Total:{" "}
          <span className="font-medium text-neutral-100">
            {formatCurrency(
              Number(booking.totalAmount || 0),
              booking.currency || "INR",
            )}
          </span>
        </p>
        <p>
          Checked In:{" "}
          <span className="font-medium text-neutral-100">
            {booking.checkedInAt
              ? new Date(booking.checkedInAt).toLocaleString()
              : "Not checked in"}
          </span>
        </p>
      </div>

      {booking.qrS3Url && (
        <div>
          <a
            href={booking.qrS3Url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-neutral-300 underline-offset-4 hover:underline"
          >
            View QR
          </a>
        </div>
      )}
    </div>
  );

  const ReviewRow = ({ review, index }: { review: any; index: number }) => (
    <div
      key={review.id || `${review.userId || "review"}-${index}`}
      className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-neutral-100">
          {review.userName || review.user?.name || "Anonymous"}
        </p>
        <p className="text-sm text-neutral-400">
          Rating: {Number(review.rating || 0).toFixed(1)} / 5
        </p>
      </div>
      <p className="text-sm text-neutral-300">
        {review.comment || "No comment provided."}
      </p>
      {review.createdAt && (
        <p className="text-xs text-neutral-500">
          {new Date(review.createdAt).toLocaleString()}
        </p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 space-y-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/my-events")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Events
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Event not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-900 bg-neutral-950 p-4 text-neutral-100 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-900 pb-4">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Events
        </Button>

        <div className="flex flex-wrap gap-2">
          {canEdit && !isEditing && (
            <Button
              variant="secondary"
              disabled={isUpdatingStatus}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
          {canEdit && isEditing && (
            <>
              <Button
                variant="outline"
                disabled={isSavingEdit}
                onClick={() => setIsEditing(false)}
              >
                Discard Changes
              </Button>
              <Button disabled={isSavingEdit} onClick={handleSaveEdit}>
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
          {status === "DRAFT" && (
            <Button
              variant="outline"
              disabled={isUpdatingStatus || isEditing || isSavingEdit}
              onClick={() => handleStatusChange("PUBLISHED")}
            >
              Publish
            </Button>
          )}
          {(status === "DRAFT" || status === "PUBLISHED") && (
            <Button
              variant="destructive"
              disabled={isUpdatingStatus || isEditing || isSavingEdit}
              onClick={() => handleStatusChange("CANCELLED")}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border-neutral-800 bg-neutral-900/80">
        <div className="relative h-56 w-full overflow-hidden rounded-t-lg md:h-72">
          <Image
            src={event.bannerS3Url || event.image || "/placeholder.svg"}
            alt={event.title?.trim() || "Event banner"}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-neutral-950/90 via-neutral-950/10 to-transparent" />
        </div>
        <CardHeader className="border-b border-neutral-900/80">
          <div className="flex items-start justify-between gap-3">
            <div>
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Event title"
                  />
                  <Input
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Event description"
                  />
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl text-neutral-100">
                    {event.title}
                  </CardTitle>
                  <p className="mt-1 text-sm text-neutral-400">
                    {event.description || "No description"}
                  </p>
                </>
              )}
            </div>
            <Badge
              variant="outline"
              className="border-neutral-700 text-neutral-200"
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 pt-5 text-sm md:grid-cols-2">
          {isEditing ? (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Date</p>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Time</p>
                <Input
                  type="time"
                  value={editForm.time}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Category</p>
                <Input
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Category"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Location</p>
                <Input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Location"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ticket Price</p>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.ticketPrice}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      ticketPrice: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Capacity</p>
                <Input
                  type="number"
                  min="1"
                  value={editForm.totalCapacity}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      totalCapacity: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Banner Image (optional)
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewBannerFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span>
                  {event.startDatetime
                    ? new Date(event.startDatetime).toLocaleString()
                    : "Date not set"}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span>
                  {event.venueName ||
                    event.city ||
                    event.address ||
                    "Location not set"}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <Ticket className="w-4 h-4 text-neutral-400" />
                <span>
                  Price: {formatCurrency(Number(event.ticketPrice || 0), "INR")}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <Ticket className="w-4 h-4 text-neutral-400" />
                <span>
                  Capacity: {Number(event.availableCapacity ?? 0)} /{" "}
                  {Number(event.totalCapacity ?? event.capacity ?? 0)} available
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="bookings" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg text-neutral-100">
            Booking and Reviews
          </CardTitle>
          <TabsList className="border border-neutral-800 bg-neutral-900/70 p-1">
            <TabsTrigger value="bookings">
              Bookings ({filteredBookings.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({reviewsSummary.totalReviews})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bookings" className="mt-0">
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>
                  Bookings ({filteredBookings.length})
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    of {mergedBookings.length}
                  </span>
                </CardTitle>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                  <StatTile
                    label="Total Bookings"
                    value={bookingSummary.totalBookings}
                  />
                  <StatTile
                    label="Seats Booked"
                    value={bookingSummary.totalSeats}
                  />
                  <StatTile
                    label="Gross Amount"
                    value={formatCurrency(bookingSummary.totalRevenue, "INR")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-3 md:grid-cols-3 lg:grid-cols-4">
                <Input
                  placeholder="Search user, email, booking id"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING_PAYMENT">
                      Pending Payment
                    </SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={checkInFilter} onValueChange={setCheckInFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Check-In" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Check-In</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                    <SelectItem value="NOT_CHECKED_IN">
                      Not Checked In
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEWEST">Newest</SelectItem>
                    <SelectItem value="OLDEST">Oldest</SelectItem>
                    <SelectItem value="HIGHEST_AMOUNT">
                      Highest Amount
                    </SelectItem>
                    <SelectItem value="LOWEST_AMOUNT">Lowest Amount</SelectItem>
                    <SelectItem value="MOST_SEATS">Most Seats</SelectItem>
                    <SelectItem value="LEAST_SEATS">Least Seats</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Min total amount"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />

                <Input
                  type="number"
                  placeholder="Max total amount"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />

                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />

                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("ALL");
                      setCheckInFilter("ALL");
                      setMinAmount("");
                      setMaxAmount("");
                      setFromDate("");
                      setToDate("");
                      setSortBy("NEWEST");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No bookings match the selected filters.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredBookings.map((booking: any) => (
                    <BookingRow
                      booking={booking}
                      key={booking.id || booking.userId}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader className="border-b border-neutral-900/80">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-neutral-100">Reviews</CardTitle>
                <p className="text-sm text-neutral-400">
                  Avg rating: {reviewsSummary.averageRating.toFixed(1)} / 5
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No reviews available for this event.
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review: any, index: number) => (
                    <ReviewRow
                      review={review}
                      index={index}
                      key={review.id || `${review.userId || "review"}-${index}`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
