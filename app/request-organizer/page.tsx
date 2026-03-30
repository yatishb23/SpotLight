"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldCheck,
  Zap,
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  Loader2,
  Info,
  ExternalLink,
  History,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { requestOrganizerAccess } from "@/lib/api";

const requestSchema = z.object({
  organizationName: z.string().min(2, "Registry name required"),
  website: z
    .string()
    .url("Invalid URL protocol")
    .optional()
    .or(z.string().length(0)),
  email: z.string().email("Invalid communication node (email)"),
  phone: z.string().min(10, "Invalid contact string"),
  bio: z.string().min(20, "Please provide a more detailed abstract"),
  experience: z.string().min(10, "Experience history required"),
  termsAgreed: z.boolean().refine((val) => val === true, "Agreement required"),
  policyAgreed: z
    .boolean()
    .refine((val) => val === true, "Policy compliance required"),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function RequestOrganizerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      organizationName: "",
      website: "",
      email: "",
      phone: "",
      bio: "",
      experience: "",
      termsAgreed: false,
      policyAgreed: false,
    },
  });

  const termsAgreed = form.watch("termsAgreed");
  const policyAgreed = form.watch("policyAgreed");
  const isButtonDisabled = !termsAgreed || !policyAgreed || isSubmitting;

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Note: Adjust the API call to send the 'data' object if your backend supports it
      const response = await requestOrganizerAccess(
        localStorage.getItem("userId") || "unknown",
      );
      console.log(response);
      
      if(!response.success){
        toast.error("Request failed: " + (response.message || "Unknown error"));
        return
      }
      toast.success(response.message || "Request submitted successfully");
      router.push("/");
      
    } catch (error) {
      toast.error("Registry Sync Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 py-20 px-6 lg:px-12 selection:bg-neutral-800">
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <header className="space-y-6 border-b border-neutral-900 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-neutral-600 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Return to Terminal
          </Link>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 opacity-50" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Upgrade Protocol // Level: 2
              </span>
            </div>
            <h1 className="text-6xl font-medium tracking-tighter text-white italic">
              Apply as Organizer.
            </h1>
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-7 space-y-12">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-[9px] uppercase tracking-widest text-neutral-600 font-black">
                            Organization Designation
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-neutral-950 border-neutral-900 rounded-xl h-12"
                              placeholder="e.g. Cyberdyne Systems"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Agreement Section */}
                <section className="space-y-6 pt-10 border-t border-neutral-900">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-neutral-700 font-mono">
                      03
                    </span>
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">
                      Protocol Agreement
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="termsAgreed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border border-neutral-900 bg-neutral-900/20 p-5 transition-all hover:border-neutral-700">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1 border-neutral-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-neutral-300">
                              Accept Dissemination Terms
                            </FormLabel>
                            <FormDescription className="text-[10px] text-neutral-500 italic">
                              I agree to adhere to the Hub Registry distribution
                              protocols and metadata accuracy standards.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="policyAgreed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border border-neutral-900 bg-neutral-900/20 p-5 transition-all hover:border-neutral-700">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1 border-neutral-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-neutral-300">
                              Financial Settlement Compliance
                            </FormLabel>
                            <FormDescription className="text-[10px] text-neutral-500 italic">
                              I confirm agreement to the 12% standard settlement
                              fee for all PAID access tokens generated.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <div className="pt-8">
                  <motion.div
                    whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
                    whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
                    animate={
                      !isButtonDisabled && !isSubmitting
                        ? {
                            boxShadow: [
                              "0 0 20px rgba(255,255,255,0)",
                              "0 0 20px rgba(255,255,255,0.1)",
                              "0 0 20px rgba(255,255,255,0)",
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Button
                      type="submit"
                      disabled={isButtonDisabled}
                      onClick= {() => onSubmit()}
                      className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-300 ${
                        isButtonDisabled
                          ? "bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed opacity-50"
                          : "bg-white text-black hover:bg-neutral-200"
                      }`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-3">
                          Initialize Application{" "}
                          <Zap
                            className={`w-4 h-4 ${!isButtonDisabled ? "fill-current" : ""}`}
                          />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Sidebar Info */}
              <aside className="lg:col-span-5 hidden lg:block">
                <div className="sticky top-12 space-y-6">
                  <Card className="bg-neutral-950 border-neutral-900 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-10 space-y-8">
                      <div className="space-y-2">
                        <h4 className="text-white font-bold italic text-xl">
                          Governance Notice.
                        </h4>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                          Organizers are subject to manual review by the System
                          Governance board before dissemination rights are
                          granted.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/30 border border-neutral-900">
                          <ExternalLink className="w-4 h-4 text-neutral-600 mt-1" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                              Identity Verification
                            </p>
                            <p className="text-[11px] text-neutral-500 font-mono">
                              Ensure all contact strings are active nodes.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/30 border border-neutral-900">
                          <ExternalLink className="w-4 h-4 text-neutral-600 mt-1" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                              Settlement Protocol
                            </p>
                            <p className="text-[11px] text-neutral-500 font-mono">
                              12% fee applied per successful transaction.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-neutral-900 flex items-center justify-between opacity-30">
                        <span className="text-[9px] font-mono uppercase tracking-widest">
                          Protocol: 0x-ORG-AUTH
                        </span>
                        <span className="text-[9px] font-mono">v4.0.12</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
