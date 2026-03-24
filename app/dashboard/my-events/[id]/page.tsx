"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeEventStatus, getBookingsByEvent, getEventById } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";

export default function OrganizerEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
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

        const [eventResponse, bookingsResponse] = await Promise.all([
          getEventById(eventId),
          getBookingsByEvent(eventId),
        ]);

        setEvent(eventResponse?.data ?? eventResponse ?? null);

        const normalizedBookings = normalizeResponse(bookingsResponse);
        setBookings(normalizedBookings);
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
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }

    if (statusValue === "PENDING_PAYMENT") {
      return "bg-amber-100 text-amber-900 border-amber-200";
    }

    if (statusValue === "CANCELLED") {
      return "bg-red-100 text-red-800 border-red-200";
    }

    return "bg-slate-100 text-slate-700 border-slate-200";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Events
        </Button>

        <div className="flex gap-2">
          {status === "DRAFT" && (
            <Button
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("PUBLISHED")}
            >
              Publish
            </Button>
          )}
          {(status === "DRAFT" || status === "PUBLISHED") && (
            <Button
              variant="destructive"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("CANCELLED")}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="relative h-56 w-full overflow-hidden rounded-t-lg md:h-72">
          <Image
            src={event.bannerS3Url || event.image || "/placeholder.svg"}
            alt={event.title?.trim() || "Event banner"}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
        </div>
        <CardHeader>    
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {event.description || "No description"}
              </p>
            </div>
            <Badge variant="outline">{status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {event.startDatetime
                ? new Date(event.startDatetime).toLocaleString()
                : "Date not set"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>
              {event.venueName ||
                event.city ||
                event.address ||
                "Location not set"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-muted-foreground" />
            <span>
              Price: {formatCurrency(Number(event.ticketPrice || 0), "INR")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-muted-foreground" />
            <span>
              Capacity: {Number(event.availableCapacity ?? 0)} /{" "}
              {Number(event.totalCapacity ?? event.capacity ?? 0)} available
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>
              Bookings ({filteredBookings.length})
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                of {mergedBookings.length}
              </span>
            </CardTitle>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <div className="rounded-md border px-3 py-2">
                <p className="text-muted-foreground">Total Bookings</p>
                <p className="font-semibold">{bookingSummary.totalBookings}</p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-muted-foreground">Seats Booked</p>
                <p className="font-semibold">{bookingSummary.totalSeats}</p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-muted-foreground">Gross Amount</p>
                <p className="font-semibold">
                  {formatCurrency(bookingSummary.totalRevenue, "INR")}
                </p>
              </div>
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
                <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
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
                <SelectItem value="NOT_CHECKED_IN">Not Checked In</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEWEST">Newest</SelectItem>
                <SelectItem value="OLDEST">Oldest</SelectItem>
                <SelectItem value="HIGHEST_AMOUNT">Highest Amount</SelectItem>
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
            <p className="text-sm text-muted-foreground">
              No bookings match the selected filters.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredBookings.map((booking: any) => (
                <div
                  key={booking.userId || booking.id || `${booking.quantity}`}
                  className="rounded-lg border px-4 py-3 text-sm space-y-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {booking.userName || "Unknown User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
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

                  <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
                    <p>
                      Booking ID:{" "}
                      <span className="font-medium text-foreground">
                        {booking.id || "N/A"}
                      </span>
                    </p>
                    <p>
                      Event:{" "}
                      <span className="font-medium text-foreground">
                        {booking.eventName || event.title || "N/A"}
                      </span>
                    </p>
                    <p>
                      Seats:{" "}
                      <span className="font-medium text-foreground">
                        {Number(booking.quantity || 0)}
                      </span>
                    </p>
                    <p>
                      Unit Price:{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(
                          Number(booking.unitPrice || 0),
                          booking.currency || "INR",
                        )}
                      </span>
                    </p>
                    <p>
                      Total:{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(
                          Number(booking.totalAmount || 0),
                          booking.currency || "INR",
                        )}
                      </span>
                    </p>
                    <p>
                      Checked In:{" "}
                      <span className="font-medium text-foreground">
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
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View QR
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
