"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Loader2,
  Hash,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { checkUserExistence } from "@/lib/api";

type ResetStep = "IDENTIFY" | "VERIFY" | "RESET" | "SUCCESS";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>("IDENTIFY");
  const [loading, setLoading] = useState(false);

  // Data State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newOtp = generateOTP();
      setOtp(newOtp);
      const res = await checkUserExistence(email, newOtp);
      if (!res.success) throw new Error();
      setStep("VERIFY");
      toast.success("Security code dispatched to your identity.");
    } catch (err) {
      toast.error("Account synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

const handleVerifyOTP = async () => {
  if (userOtp !== otp) return toast.error("Invalid code.");

  setLoading(true);
  toast.success("Identity verified.");

  // Redirecting with the email as a hardcoded parameter
  setTimeout(() => {
    router.push(`/auth/reset/password?email=${encodeURIComponent(email)}`);
  }, 800);
};


  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center p-6 selection:bg-neutral-800">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Step-specific Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 group hover:rotate-6 transition-transform">
            {step === "VERIFY" ? (
              <Hash className="text-black w-6 h-6" />
            ) : step === "SUCCESS" ? (
              <ShieldCheck className="text-emerald-600 w-6 h-6" />
            ) : (
              <KeyRound className="text-black w-6 h-6" />
            )}
          </div>
          <h1 className="text-3xl font-medium tracking-tighter text-white">
            {step === "IDENTIFY" && "Reset Password"}
            {step === "VERIFY" && "Verify Identity"}
            {step === "RESET" && "New Credentials"}
            {step === "SUCCESS" && "Access Restored"}
          </h1>
          <p className="text-sm text-neutral-500 font-light tracking-wide max-w-[300px]">
            {step === "IDENTIFY" &&
              "Enter your email identity to request an OTP."}
            {step === "VERIFY" && `A 6-digit code was sent to your registry.`}
            {step === "RESET" && "Initialize your new security password."}
            {step === "SUCCESS" &&
              "Protocol synchronized. Redirecting to Login..."}
          </p>
        </div>

        {/* Step 1: Identify */}
        {step === "IDENTIFY" && (
          <form
            onSubmit={handleSendOTP}
            className="space-y-5 animate-in fade-in duration-500"
          >
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
            <Button
              disabled={loading}
              className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs rounded-xl group transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <span className="flex items-center gap-2">
                  Request OTP{" "}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === "VERIFY" && (
          <form
            onSubmit={handleVerifyOTP}
            className="space-y-5 animate-in slide-in-from-right-4 duration-500"
          >
            <div className="space-y-2 text-center">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                Verification Code
              </Label>
              <Input
                required
                type="text"
                maxLength={6}
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value)}
                placeholder="000000"
                className="bg-neutral-900/50 border-neutral-800 h-16 text-center text-3xl tracking-[0.4em] font-mono focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-800"
              />
            </div>
            <Button
              onClick={() => handleVerifyOTP()}
              disabled={loading}
              className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs rounded-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Verify Protocol"
              )}
            </Button>
            <button
              type="button"
              onClick={() => setStep("IDENTIFY")}
              className="w-full text-[10px] text-neutral-600 uppercase tracking-widest hover:text-white transition-colors"
            >
              Wrong email? Back to Identity
            </button>
          </form>
        )}

     
        {/* Footer Security Badge */}
        <div className="pt-8 flex flex-col items-center gap-4 opacity-20 group">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800">
            <Fingerprint className="w-3 h-3 text-neutral-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
              Session Encrypted // {step}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
