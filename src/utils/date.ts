import { format, isValid } from 'date-fns'

export const formatDate = (
  dateString: string, 
  options: {
    formatStr?: string
    timezone?: string
  } = {}
) => {
  const { formatStr = 'dd MMM yyyy HH:mm', timezone = 'UTC' } = options
  
  try {
    const date = new Date(dateString)
    if (!isValid(date)) return 'Invalid Date'
    
    const offset = timezone === 'UTC' ? 0 : date.getTimezoneOffset()
    const utcDate = new Date(date.getTime() + (offset * 60 * 1000))
    
    return format(utcDate, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}