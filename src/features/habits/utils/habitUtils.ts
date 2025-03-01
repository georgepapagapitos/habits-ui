import { Habit } from "../types";

// Function to check if a habit is due today based on frequency
export const isHabitDueToday = (habit: Habit): boolean => {
  const today = new Date();
  const dayOfWeek = today
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  // Check if today is in the habit's frequency array (case insensitive)
  return habit.frequency.some((day) => day.toLowerCase() === dayOfWeek);
};

// Function to check if a habit was completed on a specific date
export const isCompletedOnDate = (habit: Habit, date: Date): boolean => {
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);

  return habit.completedDates.some((completedDate) => {
    const completedDateTime = new Date(completedDate);
    completedDateTime.setHours(0, 0, 0, 0);
    return completedDateTime.getTime() === dateToCheck.getTime();
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

// Function to format a date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
  const today = new Date();
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // If habit is due today but not completed, return today
  if (isHabitDueToday(habit) && !isCompletedToday(habit)) {
    return today;
  }

  // Convert habit frequency to indices (0-6)
  const frequencyIndices = habit.frequency.map((day) =>
    daysOfWeek.indexOf(day.toLowerCase())
  );

  // Sort indices to find the next one after today
  frequencyIndices.sort((a, b) => a - b);

  // Find the next due day
  const nextDueIndex = frequencyIndices.find((index) => index > todayIndex);

  if (nextDueIndex !== undefined) {
    // Next due day is within this week
    const daysToAdd = nextDueIndex - todayIndex;
    const nextDue = new Date(today);
    nextDue.setDate(today.getDate() + daysToAdd);
    return nextDue;
  } else {
    // Next due day is next week
    const firstDayNextWeek = frequencyIndices[0];
    const daysToAdd = 7 - todayIndex + firstDayNextWeek;
    const nextDue = new Date(today);
    nextDue.setDate(today.getDate() + daysToAdd);
    return nextDue;
  }
};
