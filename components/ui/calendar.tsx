"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  markedDates?: string[]; // Array of date strings (YYYY-MM-DD) to show a dot under the day
}

export function Calendar({ selectedDate, onSelectDate, minDate, markedDates = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isSameDay = (date1: Date, date2?: Date) => {
    if (!date2) return false
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
  }

  const isBeforeMinDate = (date: Date) => {
    if (!minDate) return false
    const d1 = new Date(date)
    d1.setHours(0, 0, 0, 0)
    const d2 = new Date(minDate)
    d2.setHours(0, 0, 0, 0)
    return d1 < d2
  }

  const formatDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  return (
    <div className="bg-background rounded-xl border shadow-sm p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={handlePrevMonth} 
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNextMonth} 
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs font-semibold text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
          const isSelected = isSameDay(date, selectedDate)
          const isDisabled = isBeforeMinDate(date)
          const dateString = formatDateString(date)
          const isMarked = markedDates.includes(dateString)

          return (
            <button
              key={i}
              disabled={isDisabled}
              onClick={() => onSelectDate(date)}
              className={`
                relative h-10 w-full rounded-md flex items-center justify-center text-sm transition-all
                ${isDisabled ? 'text-muted-foreground/40 cursor-not-allowed' : 'hover:bg-primary/10 hover:text-primary cursor-pointer'}
                ${isSelected ? 'bg-primary text-primary-foreground font-semibold hover:bg-primary hover:text-primary-foreground shadow-md' : ''}
              `}
            >
              {i + 1}
              {isMarked && !isSelected && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              {isMarked && isSelected && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
