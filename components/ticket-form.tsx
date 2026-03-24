"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import type { Event } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";

const ticketSchema = z.object({
  attendeeName: z.string().min(2, "Name must be at least 2 characters"),
  attendeeEmail: z.string().email("Invalid email address"),
  quantity: z.coerce
    .number()
    .min(1, "Quantity must be at least 1")
    .max(10, "Maximum 10 tickets per booking"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  event: Event;
  onSubmit: (
    data: TicketFormData & { eventId: string; totalPrice: number },
  ) => Promise<void>;
  isLoading?: boolean;
}

export function TicketForm({
  event,
  onSubmit,
  isLoading = false,
}: TicketFormProps) {
  const [quantity, setQuantity] = useState(1);
  const availableTickets = event.availableCapacity;
  const totalPrice = quantity * event.ticketPrice;
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      attendeeName: "",
      attendeeEmail: "",
      quantity: 1,
    },
  });

  const handleSubmit = async (data: TicketFormData) => {
    await onSubmit({
      ...data,
      eventId: event.id,
      totalPrice,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Tickets</CardTitle>
        <CardDescription>{availableTickets} tickets available</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              <FieldLabel>Full Name</FieldLabel>
              <Input
                placeholder="John Doe"
                {...form.register("attendeeName")}
                disabled={isLoading}
              />
              {form.formState.errors.attendeeName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.attendeeName.message}
                </p>
              )}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Email Address</FieldLabel>
              <Input
                type="email"
                placeholder="john@example.com"
                {...form.register("attendeeEmail")}
                disabled={isLoading}
              />
              {form.formState.errors.attendeeEmail && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.attendeeEmail.message}
                </p>
              )}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Number of Tickets</FieldLabel>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newQty = Math.max(1, quantity - 1);
                    setQuantity(newQty);
                    form.setValue("quantity", newQty);
                  }}
                  disabled={quantity <= 1 || isLoading}
                >
                  −
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={availableTickets}
                  value={quantity}
                  onChange={(e) => {
                    const newQty = Math.min(
                      availableTickets,
                      Math.max(1, parseInt(e.target.value) || 1),
                    );
                    setQuantity(newQty);
                    form.setValue("quantity", newQty);
                  }}
                  disabled={isLoading}
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newQty = Math.min(availableTickets, quantity + 1);
                    setQuantity(newQty);
                    form.setValue("quantity", newQty);
                  }}
                  disabled={quantity >= availableTickets || isLoading}
                >
                  +
                </Button>
              </div>
              {form.formState.errors.quantity && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </FieldGroup>

            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Price per ticket:</span>
                <span>{formatINR(event.ticketPrice)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatINR(totalPrice)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || availableTickets <= 0}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Processing...
                </>
              ) : (
                "Complete Purchase"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
