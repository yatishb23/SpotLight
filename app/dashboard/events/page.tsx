"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, RotateCcw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { changeEventStatus, getAdminStats, provideVerifier } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ManageEventsPage() {
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // 🔥 NEW
  const [isLoading, setIsLoading] = useState(true);
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedOrganizer, setSelectedOrganizer] = useState("ALL");

  useEffect(() => {
    if (status === "loading") return;

    const role = session?.user?.role?.toLowerCase();
    if (role !== "admin" && role !== "super_admin") {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);

        const adminData: any = await getAdminStats();

        console.log("ADMIN DATA:", adminData);

        let extractedEvents: any[] = [];
        let extractedUsers: any[] = [];

        // 🔥 handle all cases
        extractedEvents =
          adminData?.events?.events ||
          adminData?.events?.data ||
          adminData?.events ||
          adminData?.data ||
          (Array.isArray(adminData) ? adminData : []);

        extractedUsers =
          adminData?.users?.users ||
          adminData?.users?.data ||
          adminData?.users ||
          [];

        setEvents(extractedEvents || []);
        setUsers(extractedUsers || []);
      } catch (error) {
        console.error(error);
        toast.error("Security sync failed: Could not load platform data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [session, status]);

  // =========================
  // 🔥 FIND ORGANIZER EMAIL
  // =========================
  const getOrganizerEmail = (event: any) => {
    const organizerId = event?.organizerId || event?.userId || event?.createdBy;

    const user = users.find((u) => u.id === organizerId);

    return user?.email || null;
  };

  // =========================
  // 🔥 HANDLE STATUS CHANGE
  // =========================
  const handleStatusChange = async (
    id: string,
    nextStatus: "PUBLISHED" | "CANCELLED",
  ) => {
    try {
      setUpdatingEventId(id);

      await changeEventStatus(id, nextStatus);

      if (nextStatus === "PUBLISHED") {
        const event = events.find((e) => e.id === id);

        const email = getOrganizerEmail(event);

        if (!email) {
          toast.error("Organizer email not found");
          return;
        }

        // 🔥 Get verifier credentials
        const verifierRes: any = await provideVerifier(id);

        const { loginId, password } = verifierRes;

        await fetch("/api/mail/send-mail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            loginId,
            password,
          }),
        });

        toast.success("Verifier sent to organizer email");
      }

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: nextStatus } : e)),
      );
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setUpdatingEventId(null);
    }
  };

  // =========================
  // FILTERS
  // =========================
  const filteredEvents = events.filter((event) => {
    const title = String(event?.title || "").toLowerCase();
    const organizer = String(event?.organizer || "").toLowerCase();
    const currentStatus = String(event?.status || "").toUpperCase();

    return (
      (title.includes(searchTerm.toLowerCase()) ||
        organizer.includes(searchTerm.toLowerCase())) &&
      (selectedStatus === "ALL" || currentStatus === selectedStatus) &&
      (selectedOrganizer === "ALL" ||
        organizer === selectedOrganizer.toLowerCase())
    );
  });

  const organizers = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.organizer).filter(Boolean)));
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 border-b border-white/[0.04] pb-10">
        <div>
          <p className="text-[11px] text-white/25">Administrator</p>
          <h1 className="text-2xl font-light text-white">Events Management</h1>
          <p className="text-[12px] text-white/30">
            Monitor and control all platform events.
          </p>
        </div>

        {/* SEARCH + RESET */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="Search events..."
              className="pl-10 bg-white/[0.03] border-white/[0.06] h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            className="h-10 w-10 text-white/30 hover:text-white hover:bg-white/[0.05]"
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("ALL");
              setSelectedOrganizer("ALL");
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="bg-white/[0.03] border-white/[0.06] h-10 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#050505] border-white/[0.08]">
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
          <SelectTrigger className="bg-white/[0.03] border-white/[0.06] h-10 text-xs">
            <SelectValue placeholder="Organizer" />
          </SelectTrigger>
          <SelectContent className="bg-[#050505] border-white/[0.08]">
            <SelectItem value="ALL">All</SelectItem>
            {organizers.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.05]">
              <TableHead className="text-[10px] text-white/20 uppercase">
                Event
              </TableHead>
              <TableHead className="text-[10px] text-white/20 uppercase">
                Organizer
              </TableHead>
              <TableHead className="text-[10px] text-white/20 uppercase">
                Date
              </TableHead>
              <TableHead className="text-[10px] text-white/20 uppercase">
                Status
              </TableHead>
              <TableHead className="text-right text-[10px] text-white/20 uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow
                key={event.id}
                className="border-white/[0.04] hover:bg-white/[0.02]"
              >
                <TableCell>
                  <div>
                    <p className="text-white">{event.title}</p>
                    <p className="text-[11px] text-white/30">
                      {event.category}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="text-white/50 text-sm">
                  {event.organizer}
                </TableCell>

                <TableCell className="text-white/40 text-sm">
                  {event.startDatetime
                    ? new Date(event.startDatetime).toLocaleDateString("en-IN")
                    : "-"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      event.status === "PUBLISHED"
                        ? "text-emerald-400 border-emerald-500/20"
                        : "text-red-400 border-red-500/20",
                    )}
                  >
                    {event.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white/30 hover:text-white hover:bg-white/[0.05]"
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="bg-[#050505] border-white/[0.08]">
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(event.id, "PUBLISHED")
                        }
                      >
                        Publish
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(event.id, "CANCELLED")
                        }
                      >
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
