import { Habit } from "../types";

// Function to check if a habit is due on a specific date based on frequency
export const isHabitDueOnDate = (
  habit: Habit,
  date: Date = new Date()
): boolean => {
  // Get the day of week based on user's local timezone
  // This ensures correct day calculation regardless of where the user is located
  const userLocalDate = new Date(date.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  const dayIndex = userLocalDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = daysOfWeek[dayIndex];

  // Check if the day is in the habit's frequency array (case insensitive)
  return habit.frequency.some((day) => day.toLowerCase() === dayOfWeek);
};

// Function to check if a habit is due today based on frequency (alias for backward compatibility)
export const isHabitDueToday = (habit: Habit): boolean => {
  return isHabitDueOnDate(habit);
};

// Function to check if a habit was completed on a specific date
export const isCompletedOnDate = (habit: Habit, date: Date): boolean => {
  // Get the user's timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Convert the input date to the user's local timezone
  const userLocalDate = new Date(date.toLocaleString('en-US', { timeZone: userTimeZone }));
  userLocalDate.setHours(0, 0, 0, 0);

  return habit.completedDates.some((completedDate) => {
    // Convert each completed date to the user's local timezone for comparison
    const completedDateTime = new Date(new Date(completedDate).toLocaleString('en-US', { timeZone: userTimeZone }));
    completedDateTime.setHours(0, 0, 0, 0);
    return completedDateTime.getTime() === userLocalDate.getTime();
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
  // Get today's date in user's local timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
  
  // Get day of week index in user's timezone
  const userLocalDate = new Date(today.toLocaleString('en-US', { timeZone: userTimeZone }));
  const todayIndex = userLocalDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

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
