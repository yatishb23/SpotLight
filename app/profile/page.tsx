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
  ArrowRight,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

    if (!session?.user?.id) {
      return toast.error("Session expired. Please login again.");
    }

    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      setIsUpdating(true);

      const res = await changePassword(
        session.user.id,
        passwords.oldPassword,
        passwords.newPassword
      );

      if (res?.success) {
        toast.success("Password updated successfully.");
        setPasswords({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res?.message || "Failed to update password.");
      }
    } catch (err) {
      toast.error("Invalid current password.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200">
      <div className="max-w-5xl mx-auto py-16 px-6 space-y-12">

        {/* Header */}
        <header className="pb-10 border-b border-neutral-900">
          <h1 className="text-4xl font-medium text-white">Profile</h1>
          <p className="text-sm text-neutral-500 font-light">
            Manage identity and account security
          </p>
        </header>

        {/* Profile Section */}
        <section className="flex flex-col md:flex-row items-center gap-10 border-b border-neutral-900 pb-12">
          <div className="relative">
            <Avatar className="h-28 w-28 border border-neutral-800">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-neutral-900 text-neutral-500 text-xl">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <button className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full hover:scale-110 transition">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-3xl text-white">
              {session?.user?.name || "User"}
            </h2>

            <p className="text-neutral-500 text-sm">
              {session?.user?.email}
            </p>

            <div className="flex gap-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-xs uppercase text-neutral-400">
                {session?.user?.role}
              </span>

              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="border-b border-neutral-900 bg-transparent gap-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6 mt-6">

              <InfoCard icon={<Fingerprint />} label="Name" value={session?.user?.name} />
              <InfoCard icon={<Mail />} label="Email" value={session?.user?.email} />
              <InfoCard icon={<Globe />} label="Access" value="Global" />
              <InfoCard icon={<Hash />} label="User ID" value={session?.user?.id} small />

            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <div className="max-w-xl mt-6 p-8 bg-neutral-950 border border-neutral-900 rounded-2xl">

              <h3 className="text-lg text-white mb-6 flex items-center gap-2">
                <Lock className="w-4 h-4 text-neutral-500" />
                Change Password
              </h3>

              <form onSubmit={handlePasswordChange} className="space-y-6">

                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    required
                    value={passwords.oldPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, oldPassword: e.target.value })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      required
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      required
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    disabled={isUpdating}
                    className="bg-white text-black hover:bg-neutral-200"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Update <ArrowRight className="ml-2 w-3 h-3" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="pt-10 border-t border-neutral-900 text-xs text-neutral-600 flex justify-between">
          <span>SESSION ACTIVE</span>
          <span>AUTH_SECURE_V2</span>
        </footer>

      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, small }: any) {
  return (
    <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl">
      <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase mb-2">
        {icon}
        {label}
      </div>
      <p className={`${small ? "text-xs" : "text-lg"} text-white break-all`}>
        {value || "N/A"}
      </p>
    </div>
  );
}