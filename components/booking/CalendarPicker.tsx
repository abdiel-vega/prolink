"use client";

import { useState } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/types";

interface CalendarPickerProps {
  availableSlots: TimeSlot[];
  selectedDateTime: Date | null;
  onDateTimeSelect: (dateTime: Date) => void;
  onLoadSlots: (date: Date) => void;
  isLoading?: boolean;
  className?: string;
}

export function CalendarPicker({
  availableSlots,
  selectedDateTime,
  onDateTimeSelect,
  onLoadSlots,
  isLoading = false,
  className = ""
}: CalendarPickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get calendar days for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isDateDisabled = (date: Date) => {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    return dateOnly < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    setSelectedDate(date);
    onLoadSlots(date);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    onDateTimeSelect(slot.start);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateSlots = selectedDate ? 
    availableSlots.filter(slot => 
      slot.start.toDateString() === selectedDate.toDateString()
    ) : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar */}
      <Card className="card-secondary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Date
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                disabled={currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const currentMonth = isCurrentMonth(day);
              
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateSelect(day)}
                  disabled={disabled}
                  className={cn(
                    "h-10 p-0 font-normal",
                    {
                      "text-muted-foreground": !currentMonth,
                      "bg-primary text-primary-foreground hover:bg-primary/90": selected,
                      "text-foreground hover:bg-accent": currentMonth && !selected && !disabled,
                      "opacity-50 cursor-not-allowed": disabled,
                    }
                  )}
                >
                  {day.getDate()}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card className="card-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Times
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDate(selectedDate)}
            </p>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading available times...</p>
              </div>
            ) : selectedDateSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No available times</p>
                <p className="text-sm text-muted-foreground">
                  Please select a different date or contact the professional directly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedDateSlots.map((slot, index) => {
                  const isSelected = selectedDateTime && 
                    slot.start.getTime() === selectedDateTime.getTime();
                  
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeSelect(slot)}
                      disabled={!slot.available}
                      className={cn(
                        "flex flex-col items-center justify-center h-16",
                        {
                          "bg-white text-gray-900 hover:bg-gray-100": isSelected,
                          "opacity-50 cursor-not-allowed": !slot.available,
                        }
                      )}
                    >
                      <span className="font-medium">{formatTime(slot.start)}</span>
                      {slot.available ? (
                        <Badge variant="outline" className="status-success text-xs mt-1">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="status-error text-xs mt-1">
                          Booked
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Time Summary */}
      {selectedDateTime && (
        <Card className="card-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Selected Time</p>
                <p className="text-sm opacity-90">
                  {formatDate(selectedDateTime)} at {formatTime(selectedDateTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
