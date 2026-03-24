import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="container py-10 mx-auto max-w-3xl">
      <h1 className="text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h1>
      <p className="text-center text-xl text-muted-foreground mb-10">
        Find answers to common questions about booking, cancellations, and more.
      </p>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>How do I book tickets?</AccordionTrigger>
          <AccordionContent>
            Browsing events is easy! Simply use the search bar or browse by category. 
            Once you find an event you like, click "Book Now", select your seats/tickets, and proceed to payment.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Can I cancel my booking?</AccordionTrigger>
          <AccordionContent>
            Cancellation policies vary by event. You can check the specific cancellation policy 
            on the event details page before booking. If allowed, you can cancel via "My Bookings".
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Where can I see my tickets?</AccordionTrigger>
          <AccordionContent>
            Your tickets are available in the "My Bookings" section of your profile. 
            We also send a confirmation email with tickets attached.
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="item-4">
          <AccordionTrigger>Do you offer group discounts?</AccordionTrigger>
          <AccordionContent>
            Yes! For bulk bookings (usually 10+ tickets), please visit our Corporate page 
            or contact our support team for specialized rates.
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="item-5">
          <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
          <AccordionContent>
            Absolutely. We use industry-standard encryption and trusted payment gateways 
            to ensure your data is always safe and secure.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
