"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Guard: If someone tries to access this URL directly without params
  useEffect(() => {
    if (!email) {
      toast.error("Invalid session. Restarting protocol.");
      router.replace("/auth/reset"); // Adjust to your initial reset route
    }
  }, [email, router]);

  const handleFinalReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords do not correlate.");
    
    setLoading(true);
    try {
      const res = await resetPassword(email!, password);
      
      if (!res.success) throw new Error();

      setSuccess(true);
      toast.success(res.message);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err) {
      toast.error("Please restart protocol.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-xl font-medium text-white">Access Restored</p>
        <p className="text-sm text-neutral-500 mt-2">Redirecting to login identity...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4">
          <KeyRound className="text-black w-6 h-6" />
        </div>
        <h1 className="text-3xl font-medium tracking-tighter text-white">New Credentials</h1>
        <p className="text-sm text-neutral-500 font-light tracking-wide">
          Initialize your new security password for <span className="text-neutral-300">{email}</span>
        </p>
      </div>

      <form onSubmit={handleFinalReset} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 ml-1">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-neutral-900/50 border-neutral-800 h-12 pl-10 focus:ring-1 focus:ring-neutral-700"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 ml-1">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-neutral-900/50 border-neutral-800 h-12 pl-10 focus:ring-1 focus:ring-neutral-700"
              />
            </div>
          </div>
        </div>
        <Button disabled={loading} className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs rounded-xl">
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Update Password"}
        </Button>
      </form>
    </div>
  );
}

export default function FinalResetPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center p-6 selection:bg-neutral-800">
      <Suspense fallback={<Loader2 className="animate-spin w-8 h-8 text-neutral-500" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}