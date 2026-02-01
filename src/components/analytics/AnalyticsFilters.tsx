import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter, RotateCcw } from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";

interface AnalyticsFiltersProps {
  startDate: Date;
  endDate: Date;
  category: string;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
  categories: string[];
}

const DATE_PRESETS = [
  { label: "Last 7 Days", getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: "Last 30 Days", getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: "Last 90 Days", getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  { label: "This Month", getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: "Last Month", getValue: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "This Year", getValue: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }) },
];

export const AnalyticsFilters = ({
  startDate,
  endDate,
  category,
  onStartDateChange,
  onEndDateChange,
  onCategoryChange,
  onReset,
  categories,
}: AnalyticsFiltersProps) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const handlePresetSelect = (preset: typeof DATE_PRESETS[0]) => {
    const { start, end } = preset.getValue();
    onStartDateChange(start);
    onEndDateChange(end);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filters:</span>
      </div>

      {/* Date Presets */}
      <Select onValueChange={(value) => {
        const preset = DATE_PRESETS.find(p => p.label === value);
        if (preset) handlePresetSelect(preset);
      }}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Quick select" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((preset) => (
            <SelectItem key={preset.label} value={preset.label}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Start Date */}
      <Popover open={startOpen} onOpenChange={setStartOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] h-9 justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              if (date) {
                onStartDateChange(date);
                setStartOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">to</span>

      {/* End Date */}
      <Popover open={endOpen} onOpenChange={setEndOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] h-9 justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              if (date) {
                onEndDateChange(date);
                setEndOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Category Filter */}
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Button */}
      <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset
      </Button>
    </div>
  );
};
