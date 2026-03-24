'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Shield, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const PENDING_EVENTS = [
  { id: 101, title: 'Summer Jazz Festival', organizer: 'City Vibes', date: '2026-06-15', status: 'pending' },
  { id: 102, title: 'Startup Pitch Night', organizer: 'TechHub', date: '2026-05-20', status: 'pending' },
  { id: 103, title: 'Charity Gala', organizer: 'Hope Fdn.', date: '2026-07-01', status: 'flagged' },
];

export default function AdminDashboardPage() {
  const [events, setEvents] = useState(PENDING_EVENTS);

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    setEvents(events.filter(e => e.id !== id));
    toast.success(`Event ${action === 'approve' ? 'Approved' : 'Rejected'}`);
  };

  return (
    <div className="container py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Shield className="w-8 h-8 text-primary" />
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
           <p className="text-muted-foreground">Manage platform content and users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="text-muted-foreground w-4 h-4" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">12,345</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                  <Calendar className="text-muted-foreground w-4 h-4" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">573</div>
                  <p className="text-xs text-muted-foreground">+50 new this week</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Shield className="text-muted-foreground w-4 h-4" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
          </Card>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Event Approval Queue</CardTitle>
              <CardDescription>Review and approve new event listings.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Event Name</TableHead>
                          <TableHead>Organizer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {events.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground h-24">No pending approvals</TableCell>
                          </TableRow>
                      ) : (
                          events.map(event => (
                              <TableRow key={event.id}>
                                  <TableCell className="font-medium">{event.title}</TableCell>
                                  <TableCell>{event.organizer}</TableCell>
                                  <TableCell>{(event as any).startDatetime ? new Date((event as any).startDatetime).toLocaleDateString() : (event as any).date}</TableCell>
                                  <TableCell>
                                      <Badge variant={event.status === 'flagged' ? 'destructive' : 'secondary'}>
                                          {event.status}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(event.id, 'reject')}>
                                              <X className="w-4 h-4" />
                                          </Button>
                                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAction(event.id, 'approve')}>
                                              <Check className="w-4 h-4" />
                                          </Button>
                                      </div>
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
