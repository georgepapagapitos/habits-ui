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
import styled from "styled-components";
import { Habit } from "../../types";
import { isCompletedOnDate, isHabitDueOnDate } from "../../utils";

// Styled Components
const CalendarContainer = styled.div`
  margin-top: 16px;
  overflow-x: auto;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-top: 8px;
`;

const DayHeader = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
  padding: 4px;
`;

const DateCell = styled.div<{
  $isToday: boolean;
  $isCompleted: boolean;
  $isDue: boolean;
  $isPast: boolean;
  $isFuture: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: ${(props) =>
    props.$isDue && !props.$isFuture ? "pointer" : "default"};
  opacity: ${(props) => (props.$isDue && !props.$isFuture ? 1 : 0.5)};
  background-color: ${(props) => {
    if (props.$isToday)
      return props.$isCompleted
        ? props.theme.colors.successLight
        : props.theme.colors.backgroundAlt;
    if (props.$isCompleted) return props.theme.colors.successLight;
    if (props.$isDue && props.$isPast) return props.theme.colors.errorLight;
    return props.theme.colors.background;
  }};
  border: ${(props) =>
    props.$isToday ? `2px solid ${props.theme.colors.primary}` : "none"};
  color: ${(props) =>
    props.$isCompleted ? props.theme.colors.success : props.theme.colors.text};
  font-weight: ${(props) => (props.$isToday ? "bold" : "normal")};

  &:hover {
    background-color: ${(props) =>
      props.$isDue && !props.$isFuture
        ? props.$isCompleted
          ? props.theme.colors.success
          : props.theme.colors.primaryLight
        : props.$isCompleted
        ? props.theme.colors.successLight
        : props.theme.colors.background};
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MonthTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primaryText};
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendSwatch = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${(props) => props.$color};
`;

interface HabitCalendarProps {
  habit: Habit;
  onToggleDate: (habitId: string, date: Date) => void;
}

export const HabitCalendar = ({ habit, onToggleDate }: HabitCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate days for the current month
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

          return (
            <DateCell
              key={date.toString()}
              $isToday={isToday(date)}
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
          <LegendSwatch $color="#f2e6f5" />
          <span>Not scheduled</span>
        </LegendItem>
      </Legend>
    </CalendarContainer>
  );
};
