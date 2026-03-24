import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { SiteLayout } from '@/components/site-layout' // Import SiteLayout
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'EventHub - Discover & Book Events',
  description: 'Find and book amazing events from concerts to conferences. Discover experiences that match your interests.',
  // ... (rest of metadata)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, geistMono.variable)}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
           <SiteLayout>
             {children}
           </SiteLayout>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
