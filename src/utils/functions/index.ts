import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
import { IntervalDates } from '../types'
import { Interval } from '@prisma/client'

export function generateIntervalDates(currentDate: Date): IntervalDates {
  return {
    weekly: generateWeeklyDates(currentDate),
    monthly: generateMonthlyDates(currentDate),
    yearly: generateYearlyDates(currentDate),
  }
}

export function generateDatesByInterval(currentDate: Date, interval: Interval) {
  switch (interval) {
    case Interval.weekly:
      return generateWeeklyDates(currentDate)
    case Interval.monthly:
      return generateMonthlyDates(currentDate)
    case Interval.yearly:
      return generateYearlyDates(currentDate)
    default:
      return generateWeeklyDates(currentDate)
  }
}

export function generateWeeklyDates(currentDate: Date) {
  return {
    from: startOfWeek(currentDate),
    to: endOfWeek(currentDate),
  }
}

export function generateMonthlyDates(currentDate: Date) {
  return {
    from: startOfMonth(currentDate),
    to: endOfMonth(currentDate),
  }
}

export function generateYearlyDates(currentDate: Date) {
  return {
    from: startOfYear(currentDate),
    to: endOfYear(currentDate),
  }
}
