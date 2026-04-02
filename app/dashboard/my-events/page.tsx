"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Loader2,
  Plus,
  Ticket,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function MyEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!session?.user?.id) return;
      try {
        setIsLoading(true);
        const data = await apiClient.getOrganizerEvents(session.user.id);
        const normalizedEvents = Array.isArray(data)
          ? data
          : (data as any)?.events || (data as any)?.data || [];
        setEvents(normalizedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Registry synchronization failed");
      } finally {
        setIsLoading(false);
      }
    };

    if (
      session?.user?.role === "organizer" ||
      session?.user?.role === "admin"
    ) {
      fetchEvents();
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Protocol Warning: Deleting this event will remove all metadata from the ledger.",
      )
    )
      return;
    toast.info("Deletion sequence initialized");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-white opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Header Ledger */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 mb-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">
                Registry: MANAGED_PROTOCOLS
              </span>
            </div>
            <h1 className="text-5xl font-medium tracking-tighter text-white italic">
              Event Management.
            </h1>
            <p className="text-sm text-neutral-500 font-light italic leading-relaxed max-w-lg">
              Authorized controller for active event identities and historical
              dissemination records.
            </p>
          </div>
          <Link href="/dashboard/create-event">
            <Button className="bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] px-8 h-12 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Plus className="w-3 h-3 mr-2 stroke-[3px]" /> Create Protocol
            </Button>
          </Link>
        </header>

        {events.length === 0 ? (
          <div className="py-32 text-center bg-neutral-900/10 border border-dashed border-neutral-800 rounded-[40px]">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-800">
              <Calendar className="h-6 w-6 text-neutral-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2 tracking-tight">
              Zero Protocols Found
            </h3>
            <p className="text-neutral-500 mb-8 max-w-xs mx-auto text-sm italic">
              No active event identities currently registered under this
              organizer ID.
            </p>
            <Button
              variant="outline"
              className="border-neutral-800 hover:bg-neutral-900 rounded-xl"
              asChild
            >
              <Link href="/dashboard/create-event">Initialize First Entry</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card
                key={event.id}
                className="group relative bg-[#0a0a0a] border-neutral-900 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-neutral-700 shadow-2xl"
              >
                {/* Visual Identity Section */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={
                      event.image ||
                      event.bannerS3Url ||
                      "/placeholder-event.jpg"
                    }
                    alt={event.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 text-[8px] uppercase font-black tracking-widest px-3 py-1 rounded-full">
                      {event.category}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="space-y-4 p-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                      Protocol Designation
                    </p>
                    <CardTitle className="text-xl font-bold text-white tracking-tight leading-tight line-clamp-1">
                      {event.title}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-tighter">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-neutral-700" />
                      {format(
                        new Date(
                          event.startDatetime || event.date || new Date(),
                        ),
                        "dd.MM.yy",
                      )}
                    </span>
                    <Separator
                      orientation="vertical"
                      className="h-3 bg-neutral-800"
                    />
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-neutral-700" />
                      {event.city || "REMOTE"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-4 space-y-6">
                  {/* Performance Indicators */}
                  <div className="bg-neutral-900/40 rounded-2xl p-4 border border-neutral-800/50 space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                          Inventory Dispatched
                        </p>
                        <p className="text-sm font-medium text-white">
                          {event.ticketsSold || 0} /{" "}
                          {event.capacity || event.totalCapacity}
                        </p>
                      </div>
                      <p className="text-[10px] font-mono text-emerald-500">
                        {Math.round(
                          ((event.ticketsSold || 0) /
                            (event.capacity || event.totalCapacity)) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                    <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        style={{
                          width: `${((event.ticketsSold || 0) / (event.capacity || event.totalCapacity)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl text-[9px] font-black uppercase tracking-widest h-10"
                    asChild
                  >
                    <Link href={`/events/${event.id}`}>
                      <Eye className="w-3.5 h-3.5 mr-2" /> Inspect
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-neutral-800 hover:bg-neutral-900 text-neutral-500 rounded-xl h-10 w-10"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-neutral-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl h-10 w-10"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Security Note */}
        <footer className="pt-10 border-t border-neutral-900 opacity-20 flex justify-between items-center">
          <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> HUB_NODE_V2 // ACCESS_RESTRICTED
          </p>
          <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
            Registry Sync: 100%
          </p>
        </footer>
      </div>
    </div>
  );
}
