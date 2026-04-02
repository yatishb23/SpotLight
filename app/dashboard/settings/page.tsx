"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Save, UserCog, ChevronRight, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);

  const handleRequestOrganizer = async () => {
    if (!session?.user?.email) return;

    try {
      setRequesting(true);
      const res = await fetch("/api/users/request-organizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!res.ok) throw new Error("Request failed");

      toast({
        title: "Request Sent",
        description: "Your request for organizer access has been submitted.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit request.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="max-w-[900px] mx-auto px-6 md:px-10 py-12 space-y-14">
        {/* Header */}
        <header className="pb-10 border-b border-white/[0.04]">
          <h1 className="text-2xl font-light text-white tracking-tight">
            Settings
          </h1>
          <p className="text-[12px] text-white/30 mt-1">
            Manage your account identity and system preferences.
          </p>
        </header>

        <div className="space-y-14">
          {/* Notifications */}
          <section className="grid md:grid-cols-3 gap-10">
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/20 flex items-center gap-2 mb-2">
                <Bell className="w-3.5 h-3.5" /> Notifications
              </h2>
              <p className="text-[11px] text-white/25">
                Configure alert protocols.
              </p>
            </div>

            <div className="md:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <Label className="space-y-1 cursor-pointer">
                  <span className="text-[13px] text-white/70">
                    Email Notifications
                  </span>
                  <span className="text-[11px] text-white/25">
                    Alerts for bookings and event updates.
                  </span>
                </Label>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="space-y-1 cursor-pointer">
                  <span className="text-[13px] text-white/70">
                    Marketing Emails
                  </span>
                  <span className="text-[11px] text-white/25">
                    Feature updates and insights.
                  </span>
                </Label>
                <Switch className="data-[state=checked]:bg-white" />
              </div>
            </div>
          </section>

          {/* Upgrade */}
          {session?.user?.role === "user" && (
            <section className="grid md:grid-cols-3 gap-10">
              <div>
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/20 flex items-center gap-2 mb-2">
                  <UserCog className="w-3.5 h-3.5" /> Identity
                </h2>
                <p className="text-[11px] text-white/25">
                  Upgrade access level.
                </p>
              </div>

              <div className="md:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-white/70">Organizer Access</p>
                  <p className="text-[11px] text-white/25 max-w-xs">
                    Initialize the process to host and manage your events.
                  </p>
                </div>

                <Button
                  onClick={handleRequestOrganizer}
                  disabled={requesting}
                  variant="outline"
                  className="border-white/[0.08] hover:bg-white/[0.05] text-[11px] uppercase tracking-widest px-6 h-10"
                >
                  {requesting ? "Processing..." : "Upgrade"}
                </Button>
              </div>
            </section>
          )}

          {/* Security */}
          <section className="grid md:grid-cols-3 gap-10">
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/20 flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5" /> Security
              </h2>
              <p className="text-[11px] text-white/25">
                Privacy and encryption.
              </p>
            </div>

            <div className="md:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <Label className="space-y-1 cursor-pointer">
                  <span className="text-[13px] text-white/70">
                    Public Profile
                  </span>
                  <span className="text-[11px] text-white/25">
                    Visible to other users.
                  </span>
                </Label>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.04]">
                <button className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/[0.04] rounded-lg">
                      <Lock className="w-4 h-4 text-white/30" />
                    </div>
                    <span className="text-[13px] text-white/50 group-hover:text-white transition">
                      Change Password
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white" />
                </button>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end pt-6">
            <Button className="bg-white text-black hover:bg-neutral-200 px-8 h-11 text-[11px] uppercase tracking-[0.3em] font-semibold">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
