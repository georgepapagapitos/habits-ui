import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isToday,
  startOfMonth,
  subDays,
} from "date-fns";
import { useState } from "react";
import { Habit } from "../../types";
import { isCompletedOnDate, isHabitDueOnDate } from "../../utils";
import {
  CalendarContainer,
  CalendarGrid,
  CalendarHeader,
  DateCell,
  DayHeader,
  Legend,
  LegendItem,
  LegendSwatch,
  MonthTitle,
  NavigationButton,
} from "./habitCalendar.styles";

interface HabitCalendarProps {
  habit: Habit;
  onToggleDate: (habitId: string, date: Date) => void;
}

export const HabitCalendar = ({ habit, onToggleDate }: HabitCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get user's timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Generate days for the current month in user's timezone
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Calculate day headers
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Functions to navigate months
  const previousMonth = () => {
    setCurrentMonth((prevMonth) => subDays(prevMonth, 30));
  };

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => addDays(prevMonth, 30));
  };

  // Get today's date in user's timezone
  const today = new Date();

  // Function to handle day click
  const handleDayClick = (date: Date) => {
    // Only allow toggling past or current dates
    if (isAfter(date, today)) return;

    // Only allow toggling if the habit was scheduled for this day
    if (!isHabitDueOnDate(habit, date)) return;

    onToggleDate(habit._id, date);
  };

  return (
    <CalendarContainer>
      <CalendarHeader>
        <NavigationButton onClick={previousMonth}>←</NavigationButton>
        <MonthTitle>{format(currentMonth, "MMMM yyyy")}</MonthTitle>
        <NavigationButton onClick={nextMonth}>→</NavigationButton>
      </CalendarHeader>

      <CalendarGrid>
        {/* Day headers */}
        {dayNames.map((day) => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}

        {/* Calendar days */}
        {days.map((date) => {
          const isCompleted = isCompletedOnDate(habit, date);
          const isDue = isHabitDueOnDate(habit, date);
          const isPast = !isAfter(date, today);
          const isFutureDate = isAfter(date, today);
          
          // Convert date to user's timezone for "isToday" check
          const dateInUserTZ = new Date(date.toLocaleString('en-US', { timeZone: userTimeZone }));
          const todayInUserTZ = new Date(today.toLocaleString('en-US', { timeZone: userTimeZone }));
          
          // Check if it's today by comparing year, month, and day
          const isTodayInUserTZ = 
            dateInUserTZ.getFullYear() === todayInUserTZ.getFullYear() &&
            dateInUserTZ.getMonth() === todayInUserTZ.getMonth() &&
            dateInUserTZ.getDate() === todayInUserTZ.getDate();

          return (
            <DateCell
              key={date.toString()}
              $isToday={isTodayInUserTZ}
              $isCompleted={isCompleted}
              $isDue={isDue}
              $isPast={isPast}
              $isFuture={isFutureDate}
              onClick={() => handleDayClick(date)}
            >
              {format(date, "d")}
            </DateCell>
          );
        })}
      </CalendarGrid>

      <Legend>
        <LegendItem>
          <LegendSwatch $color="#a5d6a7" />
          <span>Completed</span>
        </LegendItem>
        <LegendItem>
          <LegendSwatch $color="#ffcdd2" />
          <span>Missed</span>
        </LegendItem>
        <LegendItem>
          <LegendSwatch $color="#E6D9FF" />
          <span>Scheduled</span>
        </LegendItem>
      </Legend>
    </CalendarContainer>
  );
};
