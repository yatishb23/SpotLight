import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BookingFilters({ filters, setFilters }: { filters: any; setFilters: any }) {
  const updateFilter = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "ALL" && v !== "NEWEST");

  return (
    <div className="p-4 border-b border-neutral-800 space-y-4 bg-neutral-900/20">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Search attendees or IDs..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
            className="pl-9 bg-neutral-950 border-neutral-800 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.statusFilter} onValueChange={(v) => updateFilter("statusFilter", v)}>
          <SelectTrigger className="w-[160px] bg-neutral-950 border-neutral-800">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PENDING_PAYMENT">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Check-in Filter */}
        <Select value={filters.checkInFilter} onValueChange={(v) => updateFilter("checkInFilter", v)}>
          <SelectTrigger className="w-[160px] bg-neutral-950 border-neutral-800">
            <SelectValue placeholder="Check-in" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
            <SelectItem value="ALL">All Attendance</SelectItem>
            <SelectItem value="CHECKED_IN">Checked In</SelectItem>
            <SelectItem value="NOT_CHECKED_IN">Remaining</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
          <SelectTrigger className="w-[140px] bg-neutral-950 border-neutral-800">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
            <SelectItem value="NEWEST">Newest First</SelectItem>
            <SelectItem value="OLDEST">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilters({
              searchTerm: "",
              statusFilter: "ALL",
              checkInFilter: "ALL",
              minAmount: "",
              maxAmount: "",
              fromDate: "",
              toDate: "",
              sortBy: "NEWEST",
            })}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
}