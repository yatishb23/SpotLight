"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  Loader2, 
  Fingerprint, 
  ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json().catch(() => null);

      if (!loginResponse.ok || !loginData?.success) {
        toast.error(loginData?.message || "Invalid credentials provided.");
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error("Authentication failed. Please check your credentials.");
      } else {
        toast.success("Access authorized. Redirecting...");
        
        // Refresh and redirect
        setTimeout(() => {
          router.push('/dashboard'); // Or your desired landing page
          router.refresh();
        }, 800);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("A system error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center p-6 selection:bg-neutral-800">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding Area */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 group hover:rotate-6 transition-transform">
            <Fingerprint className="text-black w-7 h-7" />
          </div>
          <h1 className="text-3xl font-medium tracking-tighter text-white">
            EventHub<span className="text-neutral-500 font-light">.</span>
          </h1>
          <p className="text-sm text-neutral-500 font-light tracking-wide">
            Identify yourself to access the command center.
          </p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 ml-1">
              Email Identity
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="bg-neutral-900/50 border-neutral-800 h-12 pl-10 focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-700" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                Security Password
              </Label>
              <Link href="/auth/reset" className="text-[10px] text-neutral-600 hover:text-white transition-colors uppercase tracking-widest">
                Recovery?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <Input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-neutral-900/50 border-neutral-800 h-12 pl-10 focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-700" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs rounded-xl group transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Authorize Access <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-neutral-600 font-light tracking-wide">
          New to the hub?{" "}
          <Link href="/auth/signup" className="text-neutral-300 hover:text-white transition-colors font-medium underline underline-offset-4">
            Register Identity
          </Link>
        </p>

        {/* Security Badge */}
        <div className="pt-8 flex justify-center opacity-30">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800">
            <ShieldCheck className="w-3 h-3 text-neutral-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              End-to-End Encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}