"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Add your registration logic here
    setTimeout(() => {
      setLoading(false);
      toast.success("Account initialized successfully.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 mb-2">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Join the ecosystem
            </span>
          </div>
          <h1 className="text-3xl font-medium tracking-tighter text-white">
            Initialize Account
          </h1>
          <p className="text-sm text-neutral-500 font-light max-w-[280px]">
            Create your global identity on EventHub and start hosting events.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 ml-1">
              Full Legal Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input 
                required
                type="text" 
                placeholder="Johnathan Doe"
                className="bg-neutral-900/50 border-neutral-800 h-12 pl-10 focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-700" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 ml-1">
              Electronic Mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input 
                required
                type="email" 
                placeholder="john@example.com"
                className="bg-neutral-900/50 border-neutral-800 h-12 pl-10 focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-700" 
              />
            </div>
          </div>

          <div className="space-y-2 pb-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 ml-1">
              Choose Security Key
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input 
                required
                type="password" 
                placeholder="Create password"
                className="bg-neutral-900/50 border-neutral-800 h-12 pl-10 focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-700" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs rounded-xl group"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Begin Journey <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-neutral-600 font-light tracking-wide">
          Already registered?{" "}
          <Link href="/auth/login" className="text-neutral-300 hover:text-white transition-colors font-medium">
            Authorize Identity
          </Link>
        </p>

        {/* Minimal Footer */}
        <div className="pt-10 flex flex-col items-center gap-4 opacity-40">
           <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-neutral-700">Protocol Auth V2.0</p>
        </div>
      </div>
    </div>
  );
}