import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import Image from "next/image";

export default function GiftCardsPage() {
  return (
    <div className="container py-10 mx-auto">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Gift Cards</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Give the gift of entertainment. Perfect for birthdays, anniversaries, and special occasions.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Physical Gift Cards */}
        <Card className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer group">
          <div className="aspect-video bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white p-6 relative">
             <Gift className="h-12 w-12 mb-2" />
             <span className="absolute bottom-4 left-4 font-bold text-xl">Physical Gift Card</span>
          </div>
          <CardHeader>
            <CardTitle>Physical Gift Cards</CardTitle>
            <CardDescription>Beautifully designed cards delivered to your doorstep.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">Buy Now</Button>
          </CardFooter>
        </Card>

        {/* E-Gift Cards */}
        <Card className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer group">
           <div className="aspect-video bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white p-6 relative">
             <Gift className="h-12 w-12 mb-2" />
             <span className="absolute bottom-4 left-4 font-bold text-xl">E-Gift Card</span>
          </div>
          <CardHeader>
            <CardTitle>E-Gift Cards</CardTitle>
            <CardDescription>Instant delivery via email. Perfect for last-minute gifts.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">Send Instantly</Button>
          </CardFooter>
        </Card>

        {/* Corporate Gift Cards */}
         <Card className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer group">
          <div className="aspect-video bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white p-6 relative">
             <Gift className="h-12 w-12 mb-2" />
             <span className="absolute bottom-4 left-4 font-bold text-xl">Corporate Gifting</span>
          </div>
          <CardHeader>
            <CardTitle>Corporate Gifting</CardTitle>
            <CardDescription>Bulk orders for employees and clients with custom branding.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">Enquire Now</Button>
          </CardFooter>
        </Card>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Check Balance</h2>
        <Card className="max-w-md">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Card Number (16 digits)" />
                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="PIN (6 digits)" />
                    <Button variant="secondary" className="w-full">Check Balance</Button>
                </div>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
