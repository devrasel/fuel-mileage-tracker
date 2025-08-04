"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

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
        months: "flex flex-col space-y-2",
        month: "space-y-3",
        caption: "flex items-center justify-between pt-1 px-1",
        caption_label: "text-base font-semibold text-foreground hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-200",
        nav: "flex items-center justify-between gap-1",
        nav_button: "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-primary/10 rounded-md transition-all duration-200 flex items-center justify-center border border-transparent hover:border-primary/20",
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-medium text-[0.75rem] py-1.5 hover:bg-primary/5 hover:text-primary transition-colors duration-150",
        row: "flex w-full mt-1",
        cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/30 [&:has([aria-selected])]:bg-accent/80 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-sm transition-colors",
        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/20 hover:text-primary rounded-sm transition-all duration-200 cursor-pointer",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-sm transition-all duration-200",
        day_today: "bg-primary/15 text-primary font-semibold rounded-sm hover:bg-primary/25 hover:text-primary transition-all duration-200",
        day_outside:
          "day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/20 aria-selected:text-muted-foreground aria-selected:opacity-30 hover:bg-accent/15 transition-colors duration-150",
        day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent/60 aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="h-4 w-4" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="h-4 w-4" />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }