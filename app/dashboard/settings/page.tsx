'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Shield, Save, UserCog } from 'lucide-react';
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifications
            </CardTitle>
            <CardDescription>Configure how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal text-xs text-muted-foreground">Receive emails about your bookings and events.</span>
              </Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
                <span>Marketing Emails</span>
                <span className="font-normal text-xs text-muted-foreground">Receive usage tips and new feature updates.</span>
              </Label>
              <Switch id="marketing-emails" />
            </div>
          </CardContent>
        </Card>

        {session?.user?.role === 'user' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" /> Account Type
            </CardTitle>
            <CardDescription>Upgrade your account to create events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="organizer-request" className="flex flex-col space-y-1">
                <span>Request Organizer Access</span>
                <span className="font-normal text-xs text-muted-foreground">Become an event organizer to host events.</span>
              </Label>
              <Button onClick={handleRequestOrganizer} disabled={requesting}> 
                {requesting ? "Requesting..." : "Request Access"}
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Privacy & Security
            </CardTitle>
            <CardDescription>Manage your security preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="public-profile" className="flex flex-col space-y-1">
                <span>Public Profile</span>
                <span className="font-normal text-xs text-muted-foreground">Allow others to see your events profile.</span>
              </Label>
              <Switch id="public-profile" defaultChecked />
            </div>
            <div className="pt-4">
               <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button>
                <Save className="mr-2 h-4 w-4" /> Save Preferences
            </Button>
        </div>
      </div>
    </div>
  );
}
