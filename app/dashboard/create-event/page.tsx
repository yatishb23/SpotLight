"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { useSession } from "next-auth/react";

const uuidSchema = z.string().uuid();

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  organizer: z.string().min(2, "Organizer name is required"),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      capacity: 100,
      price: 25,
      organizer: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: EventFormData) => {
    if (status !== "authenticated" || !session?.user) {
      toast.error("You must be logged in");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    try {
      setIsLoading(true);

      const startDatetime = new Date(`${data.date}T${data.time}`).toISOString();

      const endDate = new Date(`${data.date}T${data.time}`);
      endDate.setHours(endDate.getHours() + 3);
      const endDatetime = endDate.toISOString();

      const ticketType = data.price > 0 ? "PAID" : "FREE";

      const eventPayload = {
        title: data.title,
        description: data.description,
        startDatetime,
        endDatetime,
        timezone: "Asia/Kolkata",
        venueName: data.location.split(",")[0] || data.location,
        address: data.location,
        city: "Pune",
        country: "India",
        category: data.category,
        totalCapacity: data.capacity,
        availableCapacity: data.capacity,
        ticketPrice: data.price,
        currency: "INR",
        ticketType,
        bannerS3Url: "",
        status: "PUBLISHED",
        organizerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      };

      const formData = new FormData();

      // ✅ FIX 1: Send JSON as Blob (VERY IMPORTANT)
      formData.append(
        "data",
        new Blob([JSON.stringify(eventPayload)], {
          type: "application/json",
        }),
      );

      // ✅ FIX 2: Match backend key name EXACTLY
      formData.append("file", imageFile);

      const response = await fetch("/api/events/create", {
        method: "POST",
        body: formData,
        headers: {
          "X-User-Id": "123e4567-e89b-12d3-a456-426614174000",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create event");
      }

      toast.success("Event created successfully");
      router.push("/dashboard/events");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground mb-8">
          Fill in the details below to create and publish your event
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>
              Provide all the necessary details for your event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit as any)}
                className="space-y-6"
              >
                {/* Image Upload */}
                <FieldGroup>
                  <FieldLabel>Event Image</FieldLabel>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer block"
                    >
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">
                            Click to change image
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-muted-foreground">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </FieldGroup>

                {/* Basic Info */}
                <FieldGroup>
                  <FieldLabel>Event Title</FieldLabel>
                  <Input
                    placeholder="e.g., Annual Tech Conference 2026"
                    {...form.register("title")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    placeholder="Describe your event in detail..."
                    {...form.register("description")}
                    disabled={isLoading}
                    rows={4}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </FieldGroup>

                {/* Category */}
                <FieldGroup>
                  <FieldLabel>Category</FieldLabel>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger disabled={isLoading}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </FieldGroup>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup>
                    <FieldLabel>Date</FieldLabel>
                    <Input
                      type="date"
                      {...form.register("date")}
                      disabled={isLoading}
                    />
                    {form.formState.errors.date && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.date.message}
                      </p>
                    )}
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Time</FieldLabel>
                    <Input
                      type="time"
                      {...form.register("time")}
                      disabled={isLoading}
                    />
                    {form.formState.errors.time && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.time.message}
                      </p>
                    )}
                  </FieldGroup>
                </div>

                {/* Location */}
                <FieldGroup>
                  <FieldLabel>Location</FieldLabel>
                  <Input
                    placeholder="e.g., San Francisco Convention Center"
                    {...form.register("location")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </FieldGroup>

                {/* Capacity & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup>
                    <FieldLabel>Capacity (attendees)</FieldLabel>
                    <Input
                      type="number"
                      min="1"
                      {...form.register("capacity")}
                      disabled={isLoading}
                    />
                    {form.formState.errors.capacity && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.capacity.message}
                      </p>
                    )}
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Ticket Price (INR)</FieldLabel>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register("price")}
                      disabled={isLoading}
                    />
                    {form.formState.errors.price && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </FieldGroup>
                </div>

                {/* Organizer */}
                <FieldGroup>
                  <FieldLabel>Organizer Name</FieldLabel>
                  <Input
                    placeholder="Your name or organization"
                    {...form.register("organizer")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.organizer && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.organizer.message}
                    </p>
                  )}
                </FieldGroup>

                {/* Submit */}
                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        Creating Event...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full" type="button">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
