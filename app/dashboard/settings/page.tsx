'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Shield, Save, UserCog, ChevronRight, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);

  const handleRequestOrganizer = async () => {
    if (!session?.user?.email) return;
    
    try {
      setRequesting(true);
      const res = await fetch('/api/users/request-organizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email })
      });

      if (!res.ok) throw new Error("Request failed");

      toast({
        title: "Request Sent",
        description: "Your request for organizer access has been submitted.",
      });
    } catch (error) {
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
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <div className="max-w-3xl mx-auto py-10 px-6 space-y-12">
        
        {/* Header Section */}
        <header className="space-y-2 pb-8 border-b border-neutral-900">
          <h1 className="text-4xl font-medium tracking-tight text-white">Settings</h1>
          <p className="text-sm text-neutral-500 font-light">
            Manage your account identity and system preferences.
          </p>
        </header>

        <div className="space-y-12">
          
          {/* Notifications Section */}
          <section className="grid md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </h2>
              <p className="text-xs text-neutral-600 italic">Configure alert protocols.</p>
            </div>
            <div className="md:col-span-2 space-y-6 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-900">
              <div className="flex items-center justify-between group">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1 cursor-pointer">
                  <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Email Notifications</span>
                  <span className="font-light text-xs text-neutral-500">Alerts for bookings and event updates.</span>
                </Label>
                <Switch id="email-notifications" defaultChecked className="data-[state=checked]:bg-white" />
              </div>
              <div className="flex items-center justify-between group">
                <Label htmlFor="marketing-emails" className="flex flex-col space-y-1 cursor-pointer">
                  <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Marketing Emails</span>
                  <span className="font-light text-xs text-neutral-500">Feature updates and usage insights.</span>
                </Label>
                <Switch id="marketing-emails" className="data-[state=checked]:bg-white" />
              </div>
            </div>
          </section>

          {/* Account Upgrade Section (Conditional) */}
          {session?.user?.role === 'user' && (
            <section className="grid md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                  <UserCog className="h-4 w-4" /> Identity
                </h2>
                <p className="text-xs text-neutral-600 italic">Upgrade access levels.</p>
              </div>
              <div className="md:col-span-2 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-900">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-300">Organizer Access</p>
                    <p className="text-xs text-neutral-500 font-light max-w-[240px]">Initialize the process to host and manage your own events.</p>
                  </div>
                  <Button 
                    onClick={handleRequestOrganizer} 
                    disabled={requesting}
                    variant="outline"
                    className="border-neutral-800 hover:bg-neutral-900 text-xs uppercase tracking-widest px-6"
                  > 
                    {requesting ? "Processing..." : "Upgrade"}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Privacy & Security Section */}
          <section className="grid md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </h2>
              <p className="text-xs text-neutral-600 italic">Privacy and encryption.</p>
            </div>
            <div className="md:col-span-2 space-y-6 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-900">
              <div className="flex items-center justify-between group">
                <Label htmlFor="public-profile" className="flex flex-col space-y-1 cursor-pointer">
                  <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Public Profile</span>
                  <span className="font-light text-xs text-neutral-500">Visible to other platform members.</span>
                </Label>
                <Switch id="public-profile" defaultChecked className="data-[state=checked]:bg-white" />
              </div>
              <div className="pt-4 border-t border-neutral-900">
                 <button className="flex items-center justify-between w-full text-left group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-900 rounded-lg group-hover:bg-neutral-800 transition-colors">
                        <Lock className="h-4 w-4 text-neutral-400" />
                      </div>
                      <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">Change Password</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-700 group-hover:text-white transition-all" />
                 </button>
              </div>
            </div>
          </section>

          {/* Save Action */}
          <footer className="flex justify-end pt-8">
              <Button className="bg-white text-black hover:bg-neutral-200 px-8 h-11 text-xs uppercase tracking-[0.2em] font-bold">
                  <Save className="mr-2 h-4 w-4" /> Commit Changes
              </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}