"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  buildDateRange,
  isOpenEndedDateRange,
  parseDateRangeEnd,
  parseDateRangeStart,
  PROFILE_DATE_FORMAT,
} from "@/lib/profile-dates";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateRangePickerProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Date Range",
}: DateRangePickerProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const preservedEndDateRef = useRef<Date | undefined>(undefined);

  const startDate = useMemo(() => parseDateRangeStart(value), [value]);
  const endDate = useMemo(() => parseDateRangeEnd(value), [value]);
  const now = useMemo(() => isOpenEndedDateRange(value), [value]);

  // Keep a copy of the last real end date so toggling "Now" off can restore it
  useEffect(() => {
    if (endDate && !now) {
      preservedEndDateRef.current = endDate;
    }
  }, [endDate, now]);

  const handleStartSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        const formatted = buildDateRange(date, endDate, now);
        onChange(formatted);
      }
      setStartOpen(false);
    },
    [endDate, now, onChange],
  );

  const handleEndSelect = useCallback(
    (date: Date | undefined) => {
      if (!startDate) {
        setEndOpen(false);
        return;
      }
      if (date && date < startDate) {
        setEndOpen(false);
        return;
      }
      if (date) {
        const formatted = buildDateRange(startDate, date, false);
        onChange(formatted);
      }
      setEndOpen(false);
    },
    [startDate, onChange],
  );

  const handleToggleNow = useCallback(() => {
    const newNow = !now;
    const restoredEndDate = newNow ? undefined : preservedEndDateRef.current;
    const formatted = buildDateRange(startDate, restoredEndDate, newNow);
    onChange(formatted);
  }, [startDate, now, onChange]);

  const startDisplay = startDate ? format(startDate, PROFILE_DATE_FORMAT) : "Start Date";
  const endDisplay = now
    ? "Present"
    : endDate
      ? format(endDate, PROFILE_DATE_FORMAT)
      : "End Date";

  const labelId = `date-range-label-${placeholder.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="space-y-2">
      <label id={labelId} className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block px-1">
        {placeholder}
      </label>
      <div className="flex items-center gap-3" aria-labelledby={labelId}>
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex-1 min-w-0 bg-surface-container-low rounded-lg px-4 py-2 text-sm text-left transition-colors hover:bg-surface-container-high focus:ring-1 focus:ring-primary/30 outline-none",
                !startDate && "text-on-surface-variant",
                startDate && "text-on-surface",
              )}
            >
              {startDisplay}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 bg-surface-container border-white/5" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartSelect}
              initialFocus
              defaultMonth={startDate}
            />
          </PopoverContent>
        </Popover>

        <span className="text-on-surface-variant text-sm font-medium">-</span>

        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={now}
              className={cn(
                "flex-1 min-w-0 bg-surface-container-low rounded-lg px-4 py-2 text-sm text-left transition-colors hover:bg-surface-container-high focus:ring-1 focus:ring-primary/30 outline-none",
                !endDate && !now && "text-on-surface-variant",
                (endDate || now) && "text-on-surface",
                now && "opacity-40 cursor-not-allowed",
              )}
            >
              {endDisplay}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 bg-surface-container border-white/5" align="end">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={handleEndSelect}
              initialFocus
              defaultMonth={endDate || startDate}
              startMonth={startDate}
              disabled={startDate ? { before: startDate } : undefined}
              hidden={startDate ? { before: startDate } : undefined}
            />
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={handleToggleNow}
          aria-pressed={now}
          className={cn(
            "px-3 py-2 rounded-lg text-xs font-bold font-label uppercase tracking-wider transition-all shrink-0",
            now
              ? "bg-primary/20 text-primary ring-1 ring-primary/30"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface",
          )}
        >
          Now
        </button>
      </div>
    </div>
  );
}
