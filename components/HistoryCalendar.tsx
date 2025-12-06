import React, { useState } from 'react';
import { WorkoutSession, ExerciseDefinition } from '../types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import WorkoutHistoryCard from './WorkoutHistoryCard';

interface HistoryCalendarProps {
  history: WorkoutSession[];
  exercises: ExerciseDefinition[];
  userWeight?: number;
  onDelete: (sessionId: string) => void;
}

const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ history, exercises, userWeight, onDelete }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const parseDateString = (dateStr: string): Date => {
    if (dateStr.length === 10 && dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get all workout dates as a Set for quick lookup
  const workoutDates = new Set(history.map(session => {
    const sessionDate = parseDateString(session.date);
    return formatDateString(sessionDate);
  }));

  // Get workouts for a specific date
  const getWorkoutsForDate = (dateStr: string) => {
    return history.filter(session => {
      const sessionDate = parseDateString(session.date);
      return formatDateString(sessionDate) === dateStr;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days: Array<{ date: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: prevMonthLastDay - i,
        dateStr: formatDateString(prevDate),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: i,
        dateStr: formatDateString(currentDate),
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks = 42 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: i,
        dateStr: formatDateString(nextDate),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (dateStr: string) => {
    const workouts = getWorkoutsForDate(dateStr);
    if (workouts.length > 0) {
      setSelectedDate(dateStr);
    } else {
      // Show brief "no workout" message
      setSelectedDate(dateStr);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
  const selectedWorkouts = selectedDate ? getWorkoutsForDate(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-300" />
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white capitalize">{monthName}</h3>
          <button
            onClick={handleToday}
            className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30 transition-colors"
          >
            I dag
          </button>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-slate-300" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const hasWorkout = workoutDates.has(day.dateStr);
            const isToday = day.dateStr === formatDateString(new Date());
            const isSelected = day.dateStr === selectedDate;

            return (
              <button
                key={index}
                onClick={() => handleDayClick(day.dateStr)}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                  transition-all relative
                  ${!day.isCurrentMonth ? 'text-slate-600' : 'text-slate-300'}
                  ${isToday ? 'ring-2 ring-primary' : ''}
                  ${isSelected ? 'bg-slate-700' : 'hover:bg-slate-800'}
                  ${hasWorkout ? 'font-bold' : ''}
                `}
              >
                <span className="relative z-10">{day.date}</span>
                {hasWorkout && (
                  <div className="absolute inset-0 rounded-lg border-2 border-green-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Workouts */}
      {selectedDate && (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-white">
              {new Date(selectedDate).toLocaleDateString('nb-NO', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {selectedWorkouts.length > 0 ? (
            <div className="space-y-3">
              {selectedWorkouts.map(session => (
                <WorkoutHistoryCard
                  key={session.id}
                  session={session}
                  exercises={exercises}
                  userWeight={userWeight}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">Ingen treningsøkt denne dagen</p>
              <p className="text-xs text-slate-500 mt-1">Trykk på en grønn dato for å se økter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryCalendar;
