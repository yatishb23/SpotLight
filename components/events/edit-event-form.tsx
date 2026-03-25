import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateEvent } from "@/lib/api";
import { toast } from "sonner";
import { Save, X, UploadCloud } from "lucide-react";

export function EditEventForm({ event, onClose, onSave }: { event: any; onClose: () => void; onSave: (data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title || "",
    description: event.description || "",
    category: event.category || "",
    location: event.address || event.venueName || "",
    totalCapacity: event.totalCapacity || "",
    ticketPrice: event.ticketPrice || 0,
    date: event.startDatetime ? new Date(event.startDatetime).toISOString().split('T')[0] : "",
    time: event.startDatetime ? new Date(event.startDatetime).toTimeString().slice(0, 5) : "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const startDatetime = new Date(`${formData.date}T${formData.time}`).toISOString();
      const payload = new FormData();
      
      payload.append("data", JSON.stringify({
        eventId: event.id,
        ...formData,
        startDatetime,
        ticketType: Number(formData.ticketPrice) > 0 ? "PAID" : "FREE",
      }));

      if (file) payload.append("file", file);

      await updateEvent(payload);
      onSave({ ...event, ...formData, startDatetime });
      toast.success("Event updated successfully");
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900 animate-in fade-in zoom-in duration-200">
      <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-800">
        <CardTitle className="text-xl font-bold">Edit Event Details</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Event Title</label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="bg-neutral-950 border-neutral-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="bg-neutral-950 border-neutral-800 min-h-[120px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Date</label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="bg-neutral-950 border-neutral-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Time</label>
                <Input 
                  type="time" 
                  value={formData.time} 
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="bg-neutral-950 border-neutral-800"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Venue / Location</label>
              <Input 
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="bg-neutral-950 border-neutral-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Price (INR)</label>
                <Input 
                  type="number" 
                  value={formData.ticketPrice} 
                  onChange={e => setFormData({...formData, ticketPrice: e.target.value})}
                  className="bg-neutral-950 border-neutral-800 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Capacity</label>
                <Input 
                  type="number" 
                  value={formData.totalCapacity} 
                  onChange={e => setFormData({...formData, totalCapacity: e.target.value})}
                  className="bg-neutral-950 border-neutral-800 font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Replace Banner Image</label>
              <div className="relative group cursor-pointer border-2 border-dashed border-neutral-800 rounded-lg p-4 hover:border-emerald-500/50 transition-colors">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <div className="text-center">
                  <UploadCloud className="w-6 h-6 mx-auto mb-2 text-neutral-500" />
                  <p className="text-xs text-neutral-400">{file ? file.name : "Click to upload new image"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}