import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Building2, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function CorporatesPage() {
  return (
    <div className="container py-10 mx-auto">
      <div className="flex flex-col items-center text-center space-y-4 mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Corporate Events & Bulk Bookings</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Exclusive solutions for employee engagement, client entertainment, and bulk booking needs.
        </p>
        <Button size="lg" className="mt-4">Contact Sales</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-16">
        <Card>
          <CardHeader>
            <Building2 className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Employee Engagement</CardTitle>
            <CardDescription>
              Reward your team with movie vouchers, event tickets, and experiences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Bulk Booking Discounts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Team Outings</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Gift Vouchers</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Client Entertainment</CardTitle>
            <CardDescription>
              Impress your clients with premium experiences and exclusive access.
            </CardDescription>
          </CardHeader>
           <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> VIP Access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Private Screenings</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Concierge Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Event Partners</CardTitle>
            <CardDescription>
              Partner with us to host your corporate events and conferences.
            </CardDescription>
          </CardHeader>
           <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Venue Booking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Event Management</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Marketing Support</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted p-8 rounded-lg">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Partner with us</h2>
            <p className="text-muted-foreground mb-6">
              Get in touch with our corporate team to discuss your specific requirements and get a customized quote.
            </p>
            <form className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="First Name" />
                 <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Last Name" />
               </div>
               <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Work Email" />
               <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Company Name" />
               <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Phone Number" />
               <Button className="w-full">Submit Request</Button>
            </form>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">Our Clients</h3>
             <div className="grid grid-cols-3 gap-4 opacity-70">
                <div className="h-12 bg-muted rounded flex items-center justify-center font-bold">GOOGLE</div>
                <div className="h-12 bg-muted rounded flex items-center justify-center font-bold">META</div>
                <div className="h-12 bg-muted rounded flex items-center justify-center font-bold">AMAZON</div>
                <div className="h-12 bg-muted rounded flex items-center justify-center font-bold">MICROSOFT</div>
                <div className="h-12 bg-muted rounded flex items-center justify-center font-bold">NETFLIX</div>
                <div className="h-12 bg-muted rounded flex items-center justify-center font-bold">SPOTIFY</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
