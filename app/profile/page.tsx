"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Camera, 
  Fingerprint, 
  RefreshCcw, 
  Loader2,
  Hash,
  Globe,
  ArrowRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { changePassword } from "@/lib/api";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Verification mismatch: New passwords do not match.");
    }

    try {
      setIsUpdating(true);
      const response = await changePassword(localStorage.getItem("userId") || "", passwords.oldPassword, passwords.newPassword);
      if(response.success) {
        toast.success("Security credentials updated successfully.");
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
      else {
        toast.error(response.message || "Failed to update credentials.");
      }
    } catch (error) {
      toast.error("Authentication failure: Verify current password.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 selection:bg-neutral-800">
      <div className="max-w-4xl mx-auto py-16 px-6 space-y-12">
        
        {/* Identity Overview Section */}
        <section className="relative flex flex-col md:flex-row items-center md:items-start gap-10 pb-12 border-b border-neutral-900">
          <div className="relative">
            <div className="p-1 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
              <Avatar className="h-32 w-32 border-4 border-[#0a0a0a]">
                <AvatarImage src={session?.user?.image || ""} className="object-cover" />
                <AvatarFallback className="bg-neutral-900 text-neutral-500 text-2xl font-light">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left pt-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-5xl font-medium tracking-tighter text-white">
                {session?.user?.name?.split(' ')[0] || "User"}
              </h1>
              <p className="text-neutral-500 font-mono text-sm tracking-tight italic">
                {session?.user?.email}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                {session?.user?.role || "Member"}
              </span>
              <span className="px-3 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> System Verified
              </span>
            </div>
          </div>
        </section>

        {/* Tabbed Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b border-neutral-900 w-full justify-start rounded-none h-auto p-0 gap-8 mb-10">
            <TabsTrigger 
              value="overview" 
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent rounded-none px-0 pb-4 text-xs uppercase tracking-widest text-neutral-500 data-[state=active]:text-white transition-all font-bold"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent rounded-none px-0 pb-4 text-xs uppercase tracking-widest text-neutral-500 data-[state=active]:text-white transition-all font-bold"
            >
              Security
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile Overview */}
          <TabsContent value="overview" className="animate-in fade-in duration-700">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Fingerprint className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Display Name</span>
                </div>
                <p className="text-xl text-neutral-200 font-medium tracking-tight">
                  {session?.user?.name || "Unassigned"}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Email Identity</span>
                </div>
                <p className="text-xl text-neutral-200 font-medium tracking-tight">
                  {session?.user?.email || "Locked"}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Access Zone</span>
                </div>
                <p className="text-xl text-neutral-200 font-medium tracking-tight">Universal</p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Hash className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Registry UID</span>
                </div>
                <p className="text-sm font-mono text-neutral-600 truncate">{session?.user?.id || "ID_PENDING"}</p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Security & Password */}
          <TabsContent value="security" className="animate-in slide-in-from-right-4 duration-500">
            <div className="max-w-xl bg-neutral-950 border border-neutral-900 rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="mb-10 space-y-2">
                <h3 className="text-xl font-medium text-white flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 text-neutral-500" />
                  Update Credentials
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  Rotate your account password regularly to maintain high-level protection.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Current Password</Label>
                  <Input 
                    type="password" 
                    required 
                    placeholder="Enter existing password"
                    className="bg-neutral-900/50 border-neutral-800 focus:ring-neutral-700 h-12" 
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">New Password</Label>
                    <Input 
                      type="password" 
                      required 
                      className="bg-neutral-900 border-neutral-800 focus:ring-neutral-700 h-12" 
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Confirm Password</Label>
                    <Input 
                      type="password" 
                      required 
                      className="bg-neutral-900 border-neutral-800 focus:ring-neutral-700 h-12" 
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-900 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="bg-white text-black hover:bg-neutral-200 text-xs uppercase tracking-widest font-bold px-10 h-12 rounded-xl group"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Change Password <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>

        {/* System Footer Info */}
        <div className="pt-12 flex justify-between items-center border-t border-neutral-900 opacity-50">
          <div className="flex gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Active Session</span>
          </div>
          <p className="text-[10px] text-neutral-800 font-mono">PROTOCOL: AUTH_V2</p>
        </div>
      </div>
    </div>
  );
}