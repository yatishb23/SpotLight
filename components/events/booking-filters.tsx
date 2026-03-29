import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const BookingFilters = ({ 
  searchTerm, setSearchTerm, 
  statusFilter, setStatusFilter, 
  checkInFilter, setCheckInFilter, 
  sortBy, setSortBy, 
  onClear 
}: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-neutral-900/20 p-4 rounded-xl border border-neutral-800">
    <Input 
      placeholder="Search attendees..." 
      value={searchTerm} 
      onChange={(e) => setSearchTerm(e.target.value)}
      className="bg-neutral-950 border-neutral-800"
    />
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="bg-neutral-950 border-neutral-800"><SelectValue placeholder="Status" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Status</SelectItem>
        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
        <SelectItem value="PENDING_PAYMENT">Pending</SelectItem>
        <SelectItem value="CANCELLED">Cancelled</SelectItem>
      </SelectContent>
    </Select>
    <Select value={checkInFilter} onValueChange={setCheckInFilter}>
      <SelectTrigger className="bg-neutral-950 border-neutral-800"><SelectValue placeholder="Check-In" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Check-in Status</SelectItem>
        <SelectItem value="CHECKED_IN">Checked In</SelectItem>
        <SelectItem value="NOT_CHECKED_IN">Not Checked In</SelectItem>
      </SelectContent>
    </Select>
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className="bg-neutral-950 border-neutral-800"><SelectValue placeholder="Sort By" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="NEWEST">Newest First</SelectItem>
        <SelectItem value="HIGHEST_AMOUNT">Highest Paid</SelectItem>
        <SelectItem value="MOST_SEATS">Most Seats</SelectItem>
      </SelectContent>
    </Select>
    <Button variant="ghost" onClick={onClear} className="text-neutral-400 hover:text-white">Clear All</Button>
  </div>
);