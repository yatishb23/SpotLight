"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { ArrowLeft, Upload, ShieldCheck, Zap, Globe, Clock, Banknote, Users, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { createEvent } from "@/lib/api";
import { Separator } from "@/components/ui/separator";

const uuidSchema = z.string().uuid();

const eventSchema = z.object({
  title: z.string().min(3, "Protocol designation too short"),
  description: z.string().min(10, "Abstract must be more descriptive"),
  date: z.string().min(1, "Temporal date required"),
  time: z.string().min(1, "Start time required"),
  location: z.string().min(3, "Geographic node required"),
  category: z.string().min(1, "Classification required"),
  capacity: z.coerce.number().min(1, "Minimum 1 unit required"),
  price: z.coerce.number().min(0, "Valuation cannot be negative"),
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
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: EventFormData) => {
    if (status !== "authenticated" || !session?.user) {
      toast.error("Authorization required");
      return;
    }

    const organizerId = uuidSchema.safeParse(session.user.id);
    if (!organizerId.success) {
      toast.error("Invalid session identity");
      return;
    }

    if (!imageFile) {
      toast.error("Media asset required");
      return;
    }

    try {
      setIsLoading(true);
      const startDatetime = new Date(`${data.date}T${data.time}`).toISOString();
      const endDate = new Date(`${data.date}T${data.time}`);
      endDate.setHours(endDate.getHours() + 3);

      const eventPayload = {
        title: data.title,
        description: data.description,
        startDatetime,
        endDatetime: endDate.toISOString(),
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
        ticketType: data.price > 0 ? "PAID" : "FREE",
        bannerS3Url: "",
        status: "PUBLISHED",
        organizerId: organizerId.data,
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(eventPayload));
      formData.append("file", imageFile);

      const result = await createEvent(formData);
      if (result?.error) throw new Error(result.error);

      toast.success("Registry Entry Created");
      router.push("/dashboard/my-events");
    } catch (err: any) {
      toast.error(err.message || "Protocol sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 py-12 px-6 lg:px-12 selection:bg-neutral-800">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Ledger */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-10">
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <div className="space-y-2">
              
              <h1 className="text-4xl font-medium tracking-tighter text-white">Create Event.</h1>
              <p className="text-sm text-neutral-500 font-light italic leading-relaxed max-w-lg">
                Initialize a new event record in the global distribution ledger. All parameters are cryptographically logged.
              </p>
            </div>
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Media Asset Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-3 h-3 text-blue-500" />
                  <h2 className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-black">Visual Identity</h2>
                </div>
                <div className="relative group border border-neutral-800 rounded-[32px] overflow-hidden bg-neutral-900/20 hover:border-neutral-700 transition-all duration-500">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    disabled={isLoading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    {imagePreview ? (
                      <div className="relative h-72 w-full">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <p className="text-[10px] uppercase tracking-widest font-black text-white">Replace Asset</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-72 flex flex-col items-center justify-center gap-4 text-neutral-600 group-hover:text-neutral-400 transition-colors">
                        <Upload className="w-8 h-8 stroke-1" />
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest font-black">Upload Protocol Banner</p>
                          <p className="text-[9px] mt-1 opacity-50 font-mono">1200 x 630 recommended // JPG, PNG</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </section>

              {/* Data Registry Section */}
              <section className="space-y-10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <h2 className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-black">Registry Metadata</h2>
                </div>
                
                <div className="grid gap-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Event Designation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., TECH_SUMMIT_2026" className="bg-neutral-900/50 border-neutral-800 rounded-xl h-12 focus:ring-0 focus:border-neutral-600 text-sm" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-mono text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Abstract / Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Detailed protocol abstract..." className="bg-neutral-900/50 border-neutral-800 rounded-xl min-h-[150px] focus:ring-0 focus:border-neutral-600 text-sm leading-relaxed" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-mono text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Classification</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-neutral-900/50 border-neutral-800 rounded-xl h-12 text-[10px] uppercase tracking-widest">
                                <SelectValue placeholder="SELECT_CATEGORY" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                              {EVENT_CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c} className="text-[10px] uppercase tracking-widest">{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Geographic Node</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Venue / City" className="bg-neutral-900/50 border-neutral-800 rounded-xl h-12 text-sm" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Registry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-neutral-900/50 border-neutral-800 rounded-xl h-12 text-sm text-neutral-400" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Temporal Slot</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="bg-neutral-900/50 border-neutral-800 rounded-xl h-12 text-sm text-neutral-400" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Unit Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-neutral-900/50 border-neutral-800 rounded-xl h-12" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Base Valuation (INR)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-neutral-900/50 border-neutral-800 rounded-xl h-12" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>

              <div className="pt-10 flex flex-col sm:flex-row gap-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-16 bg-white text-black hover:bg-neutral-200 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  {isLoading ? <Spinner className="text-black" /> : "Disseminate Protocol"}
                </Button>
                <Button 
                  variant="ghost" 
                  type="button"
                  onClick={() => router.back()}
                  className="h-16 px-10 text-neutral-600 hover:text-white uppercase tracking-widest text-[10px] font-bold border border-transparent hover:border-neutral-800 rounded-2xl"
                >
                  Abort Registry
                </Button>
              </div>
            </div>

            {/* Right Column: Node Guidelines */}
            <div className="lg:col-span-4 space-y-8">
              <aside className="sticky top-12 space-y-6">
                <div className="p-8 rounded-[32px] bg-neutral-900/20 border border-neutral-900 space-y-8 backdrop-blur-xl">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Node Guidelines</h3>
                  
                  <div className="space-y-8">
                    <GuidelineItem 
                      icon={<Globe className="w-4 h-4" />} 
                      title="Global Visibility" 
                      desc="Entry status 'PUBLISHED' makes the protocol visible on the global ledger instantly." 
                    />
                    <GuidelineItem 
                      icon={<Clock className="w-4 h-4" />} 
                      title="Temporal Standards" 
                      desc="All timestamps are recorded in Asia/Kolkata (IST) by default." 
                    />
                    <GuidelineItem 
                      icon={<Banknote className="w-4 h-4" />} 
                      title="Asset Valuation" 
                      desc="Free events are classified as 'FREE' protocol. All PAID events incur standard processing fees." 
                    />
                  </div>

                  <Separator className="bg-neutral-800/50" />

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-950/50 border border-neutral-900">
                    <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-neutral-500 uppercase font-bold tracking-tight">
                      Compliance verified via AES-256 encrypted tunnel. Hub Registry node: INTEL_CORE_09.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </Form>

        {/* Security Footer */}
        <footer className="pt-10 border-t border-neutral-900 opacity-20 flex justify-between items-center">
           <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
             <ShieldCheck className="w-3 h-3" /> HUB_PROTOCOL_V2 // SESSION_ENCRYPTED
           </p>
           <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">Sync: ACTIVE</p>
        </footer>
      </div>
    </div>
  );
}

function GuidelineItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-900 flex items-center justify-center text-neutral-600 group-hover:border-neutral-700 transition-all">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-black">{title}</p>
        <p className="text-[10px] text-neutral-500 leading-relaxed font-medium uppercase tracking-tight">{desc}</p>
      </div>
    </div>
  );
}