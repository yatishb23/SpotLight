import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Calendar, User, ShoppingBag } from "lucide-react";

export default function OffersPage() {
  const offers = [
    {
      id: 1,
      bank: "HDFC Bank",
      title: "Buy 1 Get 1 Free",
      description: "Get 1 free movie ticket on booking of 1 ticket with HDFC Credit Cards.",
      code: "HDFC100",
      validTill: "31st Dec 2024",
      type: "Card Offer"
    },
    {
      id: 2,
      bank: "ICICI Bank",
      title: "25% Cashback",
      description: "Get 25% cashback up to ₹100 on movie tickets with ICICI Bank Net Banking.",
      code: "ICICI25",
      validTill: "30th Nov 2024",
      type: "Bank Offer"
    },
    {
      id: 3,
      bank: "Amazon Pay",
      title: "Win ₹500 Cashback",
      description: "Pay using Amazon Pay and win straight ₹500 cashback on bookings above ₹1000.",
      code: "AMAZON500",
      validTill: "15th Oct 2024",
      type: "Wallet Offer"
    },
     {
      id: 4,
      bank: "EventHub",
      title: "Student Discount",
      description: "Flat 50% off for students on weekdays before 5 PM shows.",
      code: "STUDENT50",
      validTill: "valid always",
      type: "Special Offer"
    }
  ];

  return (
    <div className="container py-10 mx-auto">
      <div className="flex flex-col items-center text-center space-y-4 mb-10">
         <h1 className="text-4xl font-bold tracking-tight">Offers & Promotions</h1>
         <p className="text-xl text-muted-foreground max-w-2xl">
           Save on your favorite events with our exclusive bank and wallet offers.
         </p>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <Card key={offer.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 p-4">
               <Badge variant={offer.type === 'Bank Offer' ? 'default' : 'secondary'}>{offer.type}</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                 <Tag className="h-5 w-5 text-primary" />
                 <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{offer.bank}</span>
              </div>
              <CardTitle className="text-xl">{offer.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{offer.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <Calendar className="h-4 w-4" />
                 Valid till {offer.validTill}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t flex justify-between items-center group-hover:bg-muted transition-colors">
              <div className="font-mono font-bold text-lg text-primary">{offer.code}</div>
              <Button size="sm" variant="outline">Copy Code</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
