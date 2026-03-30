"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Loader2,
  Fingerprint,
  Zap,
  UserCheck,
  UserX,
  FileDown
} from "lucide-react";
import { changeUserStatus, getRequestStatus } from "@/lib/api"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface OrganizerRequest {
  id: string;
  fullName: string;
  email: string;
  role: string;
  organizerId: string;
  isActive: boolean | null;
}

export default function OrganizerRequestsPage() {
  const [requests, setRequests] = useState<OrganizerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getRequestStatus();
      const normalizedData = Array.isArray(data) ? data : data?.data || [];
      setRequests(normalizedData);
    } catch (error) {
      toast.error("Registry sync failed: Unable to load pending nodes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const filteredRequests = requests.filter(req => 
    (req.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (req.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleAction = async (userId: string, isApproved: boolean) => {
    try {
      setIsProcessing(userId);
      const response = await changeUserStatus(userId, isApproved);
      
      if (!response.ok) {
        throw new Error(response.message || "System error during action");
      }
      
      toast.success(isApproved ? "Identity Authorized" : "Identity Rejected");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Protocol override failed");
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-700" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Synchronizing Ledger</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-2 md:p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-neutral-900 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800">
            <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Verification Terminal v4.0</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-medium tracking-tight text-white italic">Requests.</h1>
            <p className="text-sm text-neutral-500 font-light">Reviewing pending organizer identities for registry access.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-transparent border-neutral-800 hover:bg-neutral-900 text-neutral-400">
            <FileDown className="mr-2 h-4 w-4" /> Export Ledger
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 text-neutral-500">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[10px] font-mono uppercase tracking-widest">Status: Monitoring Pending Nodes</span>
        </div>

        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-white transition-colors" />
          <Input
            placeholder="Search registry identities..."
            className="pl-10 bg-neutral-900 border-neutral-800 focus:ring-1 focus:ring-neutral-700 h-11 text-sm uppercase font-mono tracking-tighter"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Requests Table */}
      <Card className="bg-transparent border-neutral-900">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-900/50">
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Identity Protocol</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Node Credentials</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold text-neutral-500">Registry Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id} className="border-neutral-900 hover:bg-neutral-900/30 transition-colors">
                  <TableCell className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                        <Fingerprint className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-200">{req.fullName}</span>
                        <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-tighter">UID: {req.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold border-neutral-800 text-blue-400 bg-blue-400/5">
                          {req.role}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold border-neutral-800 text-neutral-500">
                          Pending_Auth
                        </Badge>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 lowercase">{req.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isProcessing === req.id ? (
                      <div className="flex items-center justify-end gap-2 text-neutral-600">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Processing</span>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleAction(req.id, true)}
                          className="bg-white text-black hover:bg-emerald-500 hover:text-white transition-all h-8 text-[10px] font-bold uppercase"
                        >
                          <UserCheck className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAction(req.id, false)}
                          className="text-neutral-500 hover:text-red-500 hover:bg-red-500/10 h-8 text-[10px] font-bold uppercase"
                        >
                          <UserX className="w-3 h-3 mr-1" /> Deny
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRequests.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center justify-center space-y-4 opacity-20">
              <ShieldCheck className="w-12 h-12 text-neutral-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Registry Clear // No Pending Nodes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Footer */}
      <div className="pt-10 flex flex-col md:flex-row justify-between items-center opacity-30 border-t border-neutral-900 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Secure Connection: AES-256-GCM Active</span>
        </div>
        <p className="text-[9px] font-mono uppercase tracking-[0.2em]">Node Registry Last Sync: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}