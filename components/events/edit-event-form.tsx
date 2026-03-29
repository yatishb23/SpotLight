import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const EditEventForm = ({ 
  editForm, 
  setEditForm, 
  onSave, 
  onCancel, 
  isSavingEdit,
  setNewBannerFile 
}: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-neutral-900/50 rounded-xl border border-neutral-800 animate-in fade-in slide-in-from-top-4">
    <div className="md:col-span-2 space-y-2">
      <Label className="text-neutral-400">Event Title</Label>
      <Input 
        value={editForm.title} 
        onChange={(e) => setEditForm((prev: any) => ({ ...prev, title: e.target.value }))} 
        className="bg-neutral-950 border-neutral-700"
      />
    </div>
    <div className="md:col-span-2 space-y-2">
      <Label className="text-neutral-400">Description</Label>
      <Textarea 
        value={editForm.description} 
        onChange={(e) => setEditForm((prev: any) => ({ ...prev, description: e.target.value }))}
        className="bg-neutral-950 border-neutral-700 min-h-[100px]"
      />
    </div>
    <div className="space-y-2">
      <Label className="text-neutral-400">Date</Label>
      <Input type="date" value={editForm.date} onChange={(e) => setEditForm((prev: any) => ({ ...prev, date: e.target.value }))} className="bg-neutral-950 border-neutral-700" />
    </div>
    <div className="space-y-2">
      <Label className="text-neutral-400">Time</Label>
      <Input type="time" value={editForm.time} onChange={(e) => setEditForm((prev: any) => ({ ...prev, time: e.target.value }))} className="bg-neutral-950 border-neutral-700" />
    </div>
    <div className="space-y-2">
      <Label className="text-neutral-400">Location</Label>
      <Input value={editForm.location} onChange={(e) => setEditForm((prev: any) => ({ ...prev, location: e.target.value }))} className="bg-neutral-950 border-neutral-700" />
    </div>
    <div className="space-y-2">
      <Label className="text-neutral-400">Category</Label>
      <Input value={editForm.category} onChange={(e) => setEditForm((prev: any) => ({ ...prev, category: e.target.value }))} className="bg-neutral-950 border-neutral-700" />
    </div>
    <div className="space-y-2">
      <Label className="text-neutral-400">Ticket Price (INR)</Label>
      <Input type="number" value={editForm.ticketPrice} onChange={(e) => setEditForm((prev: any) => ({ ...prev, ticketPrice: e.target.value }))} className="bg-neutral-950 border-neutral-700" />
    </div>
    <div className="space-y-2">
      <Label className="text-neutral-400">Total Capacity</Label>
      <Input type="number" value={editForm.totalCapacity} onChange={(e) => setEditForm((prev: any) => ({ ...prev, totalCapacity: e.target.value }))} className="bg-neutral-950 border-neutral-700" />
    </div>
    <div className="md:col-span-2 space-y-2">
      <Label className="text-neutral-400">Update Banner Image</Label>
      <Input type="file" accept="image/*" onChange={(e) => setNewBannerFile(e.target.files?.[0] ?? null)} className="bg-neutral-950 border-neutral-700 file:text-neutral-200" />
    </div>
    <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-neutral-800">
      <Button variant="outline" onClick={onCancel} disabled={isSavingEdit}>Discard</Button>
      <Button onClick={onSave} disabled={isSavingEdit}>{isSavingEdit ? "Saving..." : "Save Changes"}</Button>
    </div>
  </div>
);