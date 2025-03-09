import { Habit } from "@habits/types";
import {
  dateInUserTimezone,
  getUserTimezone,
  isCompletedOnDate,
  isHabitDueOnDate,
  normalizeDate,
} from "@habits/utils";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isSameDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { useState } from "react";
import theme from "@common/theme";
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
  // For debugging
  console.log("Calendar render - current date:", new Date().toISOString());
  console.log("User timezone:", getUserTimezone());

  // Print today's date in user timezone for debugging
  const nowInUserTz = dateInUserTimezone(new Date());
  try {
    console.log(
      "Today in user timezone:",
      nowInUserTz.toISOString(),
      `Day of month: ${nowInUserTz.getDate()}`,
      `Day of week: ${nowInUserTz.getDay()} (${
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][nowInUserTz.getDay()]
      })`
    );
  } catch (error) {
    console.error("Error logging date information:", error);
  }
  // Get a date object for the current month in user's timezone
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return dateInUserTimezone(now);
  });

  // Generate days for the current month in user's timezone
  // Make sure to use the user's timezone for month boundaries
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);

  // Debug the month bounds
  console.log(
    "Month start:",
    startDate.toISOString(),
    `(${startDate.getDate()}, ${startDate.getDay()})`
  );
  console.log(
    "Month end:",
    endDate.toISOString(),
    `(${endDate.getDate()}, ${endDate.getDay()})`
  );

  // Get all days in the month
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  // Create a debug log of all days in the month for inspection
  console.log(
    "Calendar days:",
    daysInMonth
      .map((d) => `${format(d, "EEE")} ${format(d, "d")} (${d.getDay()})`)
      .join(", ")
  );

  // Calculate days for a proper calendar grid (including days from prev/next month)
  const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const endDayOfWeek = endDate.getDay();

  // Add days from previous month to fill the first row
  const daysFromPrevMonth = startDayOfWeek > 0 ? startDayOfWeek : 0;
  const prevMonthDays =
    daysFromPrevMonth > 0
      ? Array.from({ length: daysFromPrevMonth }, (_, i) =>
          subDays(startDate, daysFromPrevMonth - i)
        )
      : [];

  // Add days from next month to fill the last row
  const daysFromNextMonth = 6 - endDayOfWeek;
  const nextMonthDays =
    daysFromNextMonth > 0
      ? Array.from({ length: daysFromNextMonth }, (_, i) =>
          addDays(endDate, i + 1)
        )
      : [];

  // Combine all days to create a complete calendar grid
  const days = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

  // Debug the complete grid
  console.log(
    "Complete calendar grid:",
    days
      .map(
        (d) =>
          `${format(d, "EEE")} ${format(d, "MMM")} ${format(
            d,
            "d"
          )} (${d.getDay()})`
      )
      .join(", ")
  );

  // Calculate day headers
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Functions to navigate months - use proper month navigation
  const previousMonth = () => {
    setCurrentMonth((prevMonth) => {
      console.log("Navigating to previous month from:", prevMonth);

      // Create a new date for the previous month
      const newDate = new Date(prevMonth);
      // Subtract 1 from the month (months are 0-indexed)
      newDate.setMonth(prevMonth.getMonth() - 1);

      // Ensure we're staying at the same day of month when possible
      // (to avoid skipping to the end of the previous month for days like 31st)
      const day = Math.min(
        prevMonth.getDate(),
        new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate()
      );
      newDate.setDate(day);

      const result = dateInUserTimezone(newDate);
      console.log("New month will be:", format(result, "MMMM yyyy"));
      return result;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => {
      console.log("Navigating to next month from:", prevMonth);

      // Create a new date for the next month
      const newDate = new Date(prevMonth);
      // Add 1 to the month (months are 0-indexed)
      newDate.setMonth(prevMonth.getMonth() + 1);

      // Ensure we're staying at the same day of month when possible
      // (to avoid skipping to the end of the next month for days like 31st)
      const day = Math.min(
        prevMonth.getDate(),
        new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate()
      );
      newDate.setDate(day);

      const result = dateInUserTimezone(newDate);
      console.log("New month will be:", format(result, "MMMM yyyy"));
      return result;
    });
  };

  // Get today's date normalized to user's timezone
  const today = normalizeDate(new Date());

  // Function to handle day click
  const handleDayClick = (date: Date) => {
    // Normalize the date to user timezone start of day
    const normalizedDate = normalizeDate(date);

    // Only allow toggling past or current dates
    if (isAfter(normalizedDate, today)) {
      console.log("Can't toggle future date:", normalizedDate, "today:", today);
      return;
    }

    console.log("Toggling date:", normalizedDate.toISOString());
    onToggleDate(habit._id, normalizedDate);
  };

  return (
    <CalendarContainer role="region" aria-label={`Calendar for ${habit.name}`}>
      <CalendarHeader>
        <NavigationButton
          onClick={previousMonth}
          aria-label={`Previous month: ${format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1), "MMMM yyyy")}`}
        >
          ←
        </NavigationButton>
        <MonthTitle>{format(currentMonth, "MMMM yyyy")}</MonthTitle>
        <NavigationButton
          onClick={nextMonth}
          aria-label={`Next month: ${format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1), "MMMM yyyy")}`}
        >
          →
        </NavigationButton>
      </CalendarHeader>

      <CalendarGrid
        role="grid"
        aria-label={`${format(currentMonth, "MMMM yyyy")} calendar`}
      >
        {/* Day headers */}
        {dayNames.map((day) => (
          <DayHeader key={day} role="columnheader" aria-label={day}>
            {day}
          </DayHeader>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          // Normalize the date to the user's timezone start of day
          const normalizedDate = normalizeDate(date);

          // Check if this date is in the current month
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

          // Only calculate other properties for current month dates
          const isCompleted =
            isCurrentMonth && isCompletedOnDate(habit, normalizedDate);
          const isDue =
            isCurrentMonth && isHabitDueOnDate(habit, normalizedDate);
          const isPast = !isAfter(normalizedDate, today);
          const isFutureDate = isAfter(normalizedDate, today);

          // Use date-fns isSameDay for simple comparison
          const isTodayInUserTZ = isSameDay(normalizedDate, today);

          const isClickable = isCurrentMonth && (isPast || isTodayInUserTZ);
          const dateLabel = format(date, "EEEE, MMMM d, yyyy");
          let statusDescription = "";

          if (isCompleted && isDue) statusDescription = "Completed habit";
          else if (isCompleted && !isDue)
            statusDescription = "Bonus completion";
          else if (!isCompleted && isDue && isPast)
            statusDescription = "Missed habit";
          else if (isDue) statusDescription = "Scheduled habit";

          return (
            <DateCell
              key={`${date.toISOString()}-${index}`}
              $isToday={isTodayInUserTZ}
              $isCompleted={isCompleted}
              $isDue={isDue}
              $isPast={isPast}
              $isFuture={isFutureDate}
              $isCurrentMonth={isCurrentMonth}
              onClick={() => (isCurrentMonth ? handleDayClick(date) : null)}
              style={{
                opacity: isCurrentMonth ? 1 : 0.3,
              }}
              role="button"
              tabIndex={isClickable ? 0 : -1}
              aria-label={`${dateLabel}${statusDescription ? `, ${statusDescription}` : ""}`}
              aria-disabled={!isClickable}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleDayClick(date);
                }
              }}
            >
              {format(date, "d")}
            </DateCell>
          );
        })}
      </CalendarGrid>

      <Legend role="legend" aria-label="Calendar legend">
        <LegendItem>
          <LegendSwatch $color={theme.colors.successLight} />
          <span>Completed</span>
        </LegendItem>
        <LegendItem>
          <LegendSwatch $color={theme.colors.infoLight} />
          <span>Bonus</span>
        </LegendItem>
        <LegendItem>
          <LegendSwatch $color={theme.colors.errorLight} />
          <span>Missed</span>
        </LegendItem>
        <LegendItem>
          <LegendSwatch $color={theme.colors.transparent.primary20} />
          <span>Scheduled</span>
        </LegendItem>
        <LegendItem>
          <LegendSwatch $color="rgba(161, 95, 205, 0.05)" />
          <span>Available</span>
        </LegendItem>
      </Legend>
    </CalendarContainer>
  );
};
