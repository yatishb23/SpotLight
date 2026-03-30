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
  deleteReview 
} from "@/lib/api";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Trash2, 
  Star, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Activity,
  History,
  Loader2
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
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

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
        toast.error("Registry access failure");
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
    if (!confirm("Protocol: Confirm review removal from public ledger?")) return;
    try {
      await deleteReview(eventId, reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Intelligence record purged");
    } catch (err) {
      toast.error("Purge failure");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("CRITICAL: Deleting this protocol will wipe all associated metadata. Continue?")) return;
    try {
      setIsUpdatingStatus(true);
      await deleteEvent(eventId);
      toast.success("Protocol Terminated");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Termination failed");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (next: any) => {
    try {
      setIsUpdatingStatus(true);
      await changeEventStatus(eventId, next);
      setEvent((p: any) => ({ ...p, status: next }));
      toast.success(`Protocol set to ${next}`);
    } catch (e) { toast.error("Sync failure"); } finally { setIsUpdatingStatus(false); }
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
      toast.success("Metadata synchronized");
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <Loader2 className="w-10 h-10 animate-spin text-white opacity-20" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 py-16 px-6 lg:px-12 selection:bg-neutral-800">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Management Header */}
        <header className="flex flex-col gap-4 border-b border-neutral-900 pb-10">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Event Control Center v2.0</span>
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
        </header>

        <main>
          {isEditing ? (
            <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-neutral-900 rounded-[32px] p-10 shadow-2xl">
              <EditEventForm 
                editForm={editForm} setEditForm={setEditForm} 
                onSave={handleSaveEdit} onCancel={() => setIsEditing(false)}
                isSavingEdit={isSavingEdit} setNewBannerFile={setNewBannerFile}
              />
            </div>
          ) : (
            <div className="space-y-10">
              <Tabs defaultValue="bookings" className="w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                   <div className="flex-1">
                      <EventStats summary={bookingSummary} formatCurrency={formatCurrency} />
                   </div>
                   
                   <TabsList className="bg-neutral-900/50 border border-neutral-800 p-1 h-14 rounded-2xl backdrop-blur-xl">
                      <TabsTrigger value="bookings" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-xl px-8 gap-3 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Users className="w-4 h-4" /> Bookings
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-xl px-8 gap-3 text-[10px] font-black uppercase tracking-widest transition-all">
                        <MessageSquare className="w-4 h-4" /> Intelligence
                      </TabsTrigger>
                   </TabsList>
                </div>

                {/* Bookings Node */}
                <TabsContent value="bookings" className="animate-in fade-in slide-in-from-right-4 duration-500 outline-none">
                  <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[40px] p-8 md:p-12 shadow-2xl">
                    <div className="mb-10 flex items-center justify-between">
                       <h3 className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-black">Booking Registry</h3>
                       <Badge variant="outline" className="border-neutral-800 text-neutral-400 font-mono text-[10px]">{filteredBookings.length} NODES</Badge>
                    </div>
                    
                    <BookingFilters 
                      searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                      statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                      checkInFilter={checkInFilter} setCheckInFilter={setCheckInFilter}
                      sortBy={sortBy} setSortBy={setSortBy}
                      onClear={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                    />
                    
                    <Separator className="my-10 bg-neutral-900/50" />
                    
                    <div className="overflow-hidden">
                      <BookingList bookings={filteredBookings} formatCurrency={formatCurrency} />
                    </div>
                  </div>
                </TabsContent>

                {/* Intelligence Node (Reviews) */}
                <TabsContent value="reviews" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
                  <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[40px] p-8 md:p-12 shadow-2xl">
                    <div className="flex items-center justify-between mb-12 border-b border-neutral-900 pb-8">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                          User Intelligence <Badge className="bg-blue-500/10 text-blue-500 border-none text-[10px] px-3">{reviews.length} Feedbacks</Badge>
                        </h3>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Qualitative performance metrics</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-1">Global Rating</p>
                        <div className="flex items-center gap-2 text-3xl font-medium text-white tracking-tighter italic">
                          <Star className="w-6 h-6 text-amber-500 fill-current" />
                          <span>{reviewsSummary.averageRating.toFixed(1)} <span className="text-neutral-700 text-lg">/ 5.0</span></span>
                        </div>
                      </div>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="py-32 text-center opacity-20 flex flex-col items-center">
                        <History className="w-16 h-16 text-neutral-500 mb-4" />
                        <p className="text-[10px] uppercase tracking-[0.4em] font-black">Intelligence database empty</p>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="group relative bg-neutral-900/20 border border-neutral-900/50 rounded-3xl p-8 hover:border-neutral-700 transition-all duration-500">
                            <div className="flex justify-between items-start">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex text-amber-500 gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-neutral-800'}`} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] font-mono text-neutral-500">ID: {review.userName || 'ANON_USER'}</span>
                                </div>
                                <p className="text-lg font-light text-neutral-300 leading-relaxed italic">"{review.comment}"</p>
                                <p className="text-[9px] text-neutral-600 uppercase font-black tracking-widest pt-2">Sync Date: {new Date(review.createdAt).toLocaleDateString('en-GB')}</p>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-neutral-800 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                onClick={() => handleDeleteReview(review.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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

        {/* Security Footer */}
        <footer className="pt-10 border-t border-neutral-900 opacity-20 flex justify-between items-center">
           <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
             <ShieldCheck className="w-3 h-3 text-emerald-500" /> HUB_PROTOCOL_V2 // SESSION_SECURE
           </p>
           <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">LAST_SYNC: {new Date().toLocaleTimeString()}</p>
        </footer>
      </div>
    </div>
  );
}