import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hydration-safe date formatting with UTC consistency
export const formatDate = (
  dateString: string,
  options: {
    formatStr?: string
    timezone?: string
  } = {}
) => {
  const { formatStr = 'dd MMM yyyy HH:mm', timezone = 'UTC' } = options
  
  try {
    // Create date in UTC and validate
    const date = new Date(dateString)
    if (!isValid(date)) return 'Invalid Date'
    
    // Offset for timezone if needed (simple UTC handling)
    const offset = timezone === 'UTC' ? 0 : date.getTimezoneOffset()
    const utcDate = new Date(date.getTime() + (offset * 60 * 1000))
    
    return format(utcDate, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}
