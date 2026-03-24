'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  qrCode: string;
  ticketId: string;
  eventTitle: string;
  attendeeName: string;
}

export function QRCodeDisplay({
  qrCode,
  ticketId,
  eventTitle,
  attendeeName,
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code image from data using a simple service
    // In production, you might use a library like 'qrcode' npm package
    const generateQRImage = async () => {
      try {
        const size = 300;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrCode)}`;
        setQrDataUrl(qrImageUrl);
      } catch (error) {
        console.error('[v0] Error generating QR code:', error);
      }
    };

    if (qrCode) {
      generateQRImage();
    }
  }, [qrCode]);

  const handleDownload = async () => {
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticketId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded successfully');
    } catch (error) {
      toast.error('Failed to download QR code');
      console.error('[v0] Download error:', error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrCode);
    toast.success('Ticket code copied to clipboard');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Ticket</CardTitle>
        <CardDescription>Present this QR code at the event entrance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Event</p>
          <p className="text-sm text-muted-foreground">{eventTitle}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Attendee</p>
          <p className="text-sm text-muted-foreground">{attendeeName}</p>
        </div>

        {qrDataUrl && (
          <div className="flex flex-col items-center space-y-4">
            <div className="border-2 border-dashed rounded-lg p-4 bg-secondary/30">
              <img
                src={qrDataUrl}
                alt="Ticket QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>
            <div className="w-full space-y-2">
              <Button
                className="w-full"
                variant="default"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleCopyCode}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Ticket Code
              </Button>
            </div>
          </div>
        )}

        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
          <p className="text-xs text-primary dark:text-primary-foreground">
            Save this ticket on your phone. You can also check your email for the ticket details.
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">Ticket ID: {ticketId}</p>
        </div>
      </CardContent>
    </Card>
  );
}
