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
  deleteReview // Ensure this is exported from your api lib
} from "@/lib/api";
import { toast } from "sonner";
import { LayoutDashboard, MessageSquare, Users, Trash2, Star } from "lucide-react";

import { EventHeader } from "@/components/events/event-header";
import { BookingFilters } from "@/components/events/booking-filters";
import { EditEventForm } from "@/components/events/edit-event-form";
import { EventStats } from "@/components/events/event-stats";
import { BookingList } from "@/components/events/booking-list";
import { Button } from "@/components/ui/button";

export default function OrganizerEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  
  const [editForm, setEditForm] = useState({ 
    title: "", description: "", category: "", date: "", 
    time: "", location: "", totalCapacity: "", ticketPrice: "" 
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [checkInFilter, setCheckInFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const [eRes, bRes, rRes] = await Promise.all([
          getEventById(eventId),
          getBookingsByEvent(eventId),
          getEventReviews(eventId),
        ]);
        
        setEvent(eRes?.data ?? eRes);
        setBookings(Array.isArray(bRes) ? bRes : (bRes as any)?.data || []);
        
        const rData = (rRes as any)?.data || rRes;
        if (rData) {
          setReviews(Array.isArray(rData.reviews) ? rData.reviews : Array.isArray(rData) ? rData : []);
          setReviewsSummary({ 
            averageRating: rData.averageRating || 0, 
            totalReviews: rData.totalReviews || 0 
          });
        }
      } catch (error) {
        toast.error("Failed to load details");
      } finally {
        setIsLoading(false);
      }
    };
    if (eventId) fetchEventData();
  }, [eventId]);

  useEffect(() => {
    if (!event) return;
    const start = event.startDatetime ? new Date(event.startDatetime) : null;
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      category: event.category || "",
      date: start ? start.toISOString().slice(0, 10) : "",
      time: start ? start.toISOString().slice(11, 16) : "",
      location: event.address || event.venueName || "",
      totalCapacity: String(event.totalCapacity || ""),
      ticketPrice: String(event.ticketPrice || 0),
    });
  }, [event]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(eventId,reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted");
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) return;
    try {
      setIsUpdatingStatus(true);
      await deleteEvent(eventId);
      toast.success("Event deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (next: any) => {
    try {
      setIsUpdatingStatus(true);
      await changeEventStatus(eventId, next);
      setEvent((p: any) => ({ ...p, status: next }));
      toast.success(`Event ${next.toLowerCase()}`);
    } catch (e) { toast.error("Failed to update status"); } finally { setIsUpdatingStatus(false); }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSavingEdit(true);
      const formData = new FormData();
      formData.append("data", JSON.stringify({ eventId, ...editForm }));
      if (newBannerFile) formData.append("file", newBannerFile);
      await updateEvent(formData);
      setEvent((p: any) => ({ ...p, ...editForm }));
      setIsEditing(false);
      toast.success("Event updated");
    } catch (e) { toast.error("Update failed"); } finally { setIsSavingEdit(false); }
  };

  const filteredBookings = useMemo(() => {
    let list = [...bookings];
    if (searchTerm) {
      list = list.filter(b => `${b.userName} ${b.userEmail}`.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== "ALL") list = list.filter(b => b.status === statusFilter);
    return list;
  }, [bookings, searchTerm, statusFilter]);

  const bookingSummary = useMemo(() => filteredBookings.reduce((acc, b) => ({
    totalBookings: acc.totalBookings + 1,
    totalSeats: acc.totalSeats + Number(b.quantity || 0),
    totalRevenue: acc.totalRevenue + Number(b.totalAmount || 0),
  }), { totalBookings: 0, totalSeats: 0, totalRevenue: 0 }), [filteredBookings]);

  if (isLoading) return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-7xl animate-pulse space-y-8">
        <div className="h-12 bg-neutral-900 rounded-xl w-1/4" />
        <div className="h-64 bg-neutral-900 rounded-3xl w-full" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Management Portal</span>
          </div>
          <EventHeader 
            event={event} 
            status={event.status} 
            isEditing={isEditing}
            onBack={() => router.push("/dashboard")}
            onEdit={() => setIsEditing(true)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            isUpdatingStatus={isUpdatingStatus}
          />
        </div>

        <main className="animate-in fade-in duration-700">
          {isEditing ? (
            <div className="max-w-4xl mx-auto">
              <EditEventForm 
                editForm={editForm} setEditForm={setEditForm} 
                onSave={handleSaveEdit} onCancel={() => setIsEditing(false)}
                isSavingEdit={isSavingEdit} setNewBannerFile={setNewBannerFile}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <Tabs defaultValue="bookings" className="w-full outline-none">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="md:col-span-3">
                    <EventStats summary={bookingSummary} formatCurrency={formatCurrency} />
                  </div>
                  <div className="flex items-end justify-end">
                    <TabsList className="bg-neutral-900/50 border border-neutral-800 p-1 h-12">
                      <TabsTrigger value="bookings" className="data-[state=active]:bg-neutral-800 gap-2">
                        <Users className="w-4 h-4" /> Bookings
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="data-[state=active]:bg-neutral-800 gap-2">
                        <MessageSquare className="w-4 h-4" /> Reviews
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="bookings" className="space-y-6 outline-none">
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 backdrop-blur-sm">
                    <BookingFilters 
                      searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                      statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                      checkInFilter={checkInFilter} setCheckInFilter={setCheckInFilter}
                      sortBy={sortBy} setSortBy={setSortBy}
                      onClear={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                    />
                    <div className="mt-6">
                      <BookingList bookings={filteredBookings} formatCurrency={formatCurrency} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="outline-none">
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        Customer Feedback <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">{reviews.length}</Badge>
                      </h3>
                      <div className="flex items-center gap-2 text-amber-500 font-bold">
                        <Star className="w-5 h-5 fill-current" />
                        <span>{reviewsSummary.averageRating.toFixed(1)} / 5.0</span>
                      </div>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="py-20 text-center">
                        <MessageSquare className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                        <p className="text-neutral-500 italic">No reviews found for this event yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="group flex justify-between items-start p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-all">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex text-amber-500">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-neutral-800'}`} />
                                  ))}
                                </div>
                                <span className="text-xs font-bold text-neutral-400">{review.userName || 'Anonymous'}</span>
                              </div>
                              <p className="text-sm text-neutral-300 leading-relaxed">{review.comment}</p>
                              <p className="text-[10px] text-neutral-600 uppercase tracking-tighter">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-neutral-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Simple internal Badge component if not imported from UI
function Badge({ children, className, variant = "secondary" }: any) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${className}`}>
      {children}
    </span>
  );
}