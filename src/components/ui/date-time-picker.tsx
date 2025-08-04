"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
  timezone?: string
  autoTime?: boolean
}

export function DateTimePicker({ value, onChange, disabled, className, timezone, autoTime = false }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState<string>(value ? format(value, 'HH:mm') : autoTime ? format(new Date(), 'HH:mm') : '')

  React.useEffect(() => {
    setDate(value)
    setTime(value ? format(value, 'HH:mm') : autoTime ? format(new Date(), 'HH:mm') : '')
  }, [value, autoTime])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Combine the selected date with the existing time or current time if autoTime
      const newDateTime = new Date(selectedDate)
      let timeToUse = time
      if (autoTime && !time) {
        timeToUse = format(new Date(), 'HH:mm')
        setTime(timeToUse)
      }
      if (timeToUse) {
        const [hours, minutes] = timeToUse.split(':').map(Number)
        newDateTime.setHours(hours, minutes, 0, 0)
      }
      setDate(newDateTime)
      onChange?.(newDateTime)
    } else {
      setDate(undefined)
      onChange?.(undefined)
    }
  }

  const handleTimeChange = (timeString: string) => {
    setTime(timeString)
    if (date) {
      const newDateTime = new Date(date)
      const [hours, minutes] = timeString.split(':').map(Number)
      if (!isNaN(hours) && !isNaN(minutes)) {
        newDateTime.setHours(hours, minutes, 0, 0)
        setDate(newDateTime)
        onChange?.(newDateTime)
      }
    }
  }

  const formatDateTime = (date: Date | undefined) => {
    if (!date) return ''
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone || 'UTC'
    })
  }

  return (
    <div className="flex gap-1 sm:gap-2">
      <Popover className={autoTime ? "w-full" : "flex-1"}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-10 sm:h-10 justify-start text-left font-normal border focus:border-primary/30 px-3 sm:px-3",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <div className="flex flex-col items-start truncate min-w-0">
              <span className="text-xs sm:text-sm font-medium">
                {date ? format(date, 'dd MMM yyyy') : <span>Select Date</span>}
              </span>
              {date && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {format(date, 'EEEE, MMMM dd, yyyy')}
                </span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabled}
            initialFocus
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      
      {!autoTime && (
        <div className="flex items-center gap-1 flex-1">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="h-10 sm:h-10 border focus:border-primary/30 text-xs sm:text-sm px-3"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}