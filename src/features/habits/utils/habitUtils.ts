import { Habit } from "@habits/types";
import { addDays, getDay, isSameDay, parseISO, startOfDay } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

// Get current user timezone (safely for tests)
export const getUserTimezone = (): string => {
  try {
    return typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Chicago";
  } catch {
    // Fallback for testing environments
    return "America/Chicago";
  }
};

// Normalize a date to start of day in user's timezone
export const normalizeDate = (date: Date): Date => {
  const userTimezone = getUserTimezone();
  const zonedDate = toZonedTime(date, userTimezone);
  return startOfDay(zonedDate);
};

// Convert date to user's timezone
export const dateInUserTimezone = (date: Date): Date => {
  const userTimezone = getUserTimezone();
  return toZonedTime(date, userTimezone);
};

// Function to check if a habit is due on a specific date based on frequency
export const isHabitDueOnDate = (
  habit: Habit,
  date: Date = new Date()
): boolean => {
  // Get the day of week in user's timezone (0 = Sunday, 1 = Monday, etc.)
  const userTimezone = getUserTimezone();
  const dateInTz = toZonedTime(date, userTimezone);
  const dayIndex = getDay(dateInTz);
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayOfWeek = daysOfWeek[dayIndex];

  // Check if the day is in the habit's frequency array (case insensitive)
  return habit.frequency.some((day) => day.toLowerCase() === dayOfWeek);
};

// Function to check if a habit is due today based on frequency
export const isHabitDueToday = (habit: Habit): boolean => {
  return isHabitDueOnDate(habit);
};

// Function to check if a habit was completed on a specific date
export const isCompletedOnDate = (habit: Habit, date: Date): boolean => {
  // Normalize the input date to start of day in user's timezone
  const userTimezone = getUserTimezone();
  const normalizedDate = startOfDay(toZonedTime(date, userTimezone));

  return habit.completedDates.some((completedDateStr) => {
    // Parse the ISO string into a Date object
    const completedDate =
      typeof completedDateStr === "string"
        ? parseISO(completedDateStr)
        : new Date(completedDateStr);

    // Convert completed date to user's timezone and normalize
    const normalizedCompletedDate = startOfDay(
      toZonedTime(completedDate, userTimezone)
    );

    // Compare dates using date-fns isSameDay
    return isSameDay(normalizedCompletedDate, normalizedDate);
  });
};

// Function to check if a habit is completed today
export const isCompletedToday = (habit: Habit): boolean => {
  return isCompletedOnDate(habit, new Date());
};

// Function to calculate the current streak of a habit
export const calculateStreak = (habit: Habit): number => {
  // The backend already calculates the streak, so we just return it
  return habit.streak;
};

// Function to format a date for display using date-fns
export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  const userTimezone = getUserTimezone();
  return formatInTimeZone(date, userTimezone, "EEE, MMM d");
};

// Function to get the display text for habit frequency
export const getFrequencyDisplayText = (habit: Habit): string => {
  if (habit.frequency.length === 7) {
    return "Every day";
  }

  if (
    habit.frequency.length === 5 &&
    habit.frequency.every((day) =>
      ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day)
    )
  ) {
    return "Weekdays";
  }

  if (
    habit.frequency.length === 2 &&
    habit.frequency.every((day) => ["saturday", "sunday"].includes(day))
  ) {
    return "Weekends";
  }

  // Format the days for display
  const formattedDays = habit.frequency
    .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
    .join(", ");

  return formattedDays;
};

// Function to get the next due date for a habit
export const getNextDueDate = (habit: Habit): Date => {
  // Get today in user's timezone
  const userTimezone = getUserTimezone();
  const today = toZonedTime(new Date(), userTimezone);

  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // Get today's day of week in user's timezone
  const todayIndex = getDay(today);

  // If habit is due today but not completed, return today
  if (isHabitDueToday(habit) && !isCompletedToday(habit)) {
    return today;
  }

  // Convert habit frequency to indices (0-6)
  const frequencyIndices = habit.frequency
    .map((day) => daysOfWeek.indexOf(day.toLowerCase()))
    .filter((index) => index !== -1)
    .sort((a, b) => a - b);

  // Find the next due day
  const nextDueIndex = frequencyIndices.find((index) => index > todayIndex);

  if (nextDueIndex !== undefined) {
    // Next due day is within this week
    const daysToAdd = nextDueIndex - todayIndex;
    return addDays(today, daysToAdd);
  } else {
    // Next due day is next week
    const firstDayNextWeek = frequencyIndices[0];
    const daysToAdd = 7 - todayIndex + firstDayNextWeek;
    return addDays(today, daysToAdd);
  }
};
