"use client";

import * as React from "react";
import { DayPicker, UI, DayFlag, SelectionState } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        [UI.Root]: "w-full",
        [UI.Months]: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        [UI.Month]: "space-y-4",
        [UI.MonthCaption]:
          "flex justify-center pt-1 relative items-center font-headline font-bold text-on-surface",
        [UI.CaptionLabel]: "text-sm",
        [UI.Nav]: "space-x-1 flex items-center justify-between",
        [UI.PreviousMonthButton]:
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 hover:bg-surface-container-high text-on-surface size-8",
        [UI.NextMonthButton]:
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 hover:bg-surface-container-high text-on-surface size-8",
        [UI.MonthGrid]: "w-full border-collapse space-y-1",
        [UI.Weekdays]:
          "flex",
        [UI.Weekday]:
          "text-on-surface-variant rounded-md w-9 font-label text-[10px] uppercase tracking-wider",
        [UI.Week]: "flex w-full mt-2",
        [UI.Day]:
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent",
        [UI.DayButton]:
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors size-9 p-0 aria-selected:opacity-100 hover:bg-surface-container-high text-on-surface",
        [DayFlag.outside]:
          "text-on-surface-variant/30 aria-selected:bg-surface-container-high/50",
        [DayFlag.disabled]: "text-on-surface-variant/20 pointer-events-none",
        [DayFlag.hidden]: "invisible pointer-events-none",
        [DayFlag.today]:
          "text-secondary font-bold",
        [SelectionState.selected]:
          "bg-primary/20 text-primary hover:bg-primary/30 focus:bg-primary/30 rounded-lg",
        [SelectionState.range_end]: "rounded-l-none rounded-r-lg",
        [SelectionState.range_middle]:
          "bg-primary/10 text-primary rounded-none hover:bg-primary/20",
        [SelectionState.range_start]: "rounded-r-none rounded-l-lg",
        [UI.Chevron]:
          "size-4 text-on-surface fill-current",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
