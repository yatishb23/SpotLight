'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Shield, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
              <AvatarFallback className="text-lg">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Avatar</Button>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" defaultValue={user?.name || ''} className="pl-9" />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" defaultValue={user?.email || ''} className="pl-9" disabled />
              </div>
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
            
            <div className="grid gap-2">
               <label className="text-sm font-medium">Account Role</label>
               <div className="relative">
                 <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input value={user?.role || 'User'} className="pl-9 capitalize" disabled />
               </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
              <Button>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
