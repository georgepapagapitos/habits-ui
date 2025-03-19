import { Habit } from "@habits/types";
import {
  getNextDueDate,
  isHabitDueToday,
  isCompletedToday,
} from "./habitUtils";

// Key for localStorage
export const SORT_PREFERENCE_KEY = "habits-sort-preference";

// Sort options that will be available to users
export enum SortOption {
  DEFAULT = "default",
  ALPHABETICAL = "alphabetical",
  STREAK = "streak",
  NEWEST = "newest",
  OLDEST = "oldest",
  COMPLETION_RATE = "completion_rate",
}

// Default sort: Due today habits first (maintaining their relative order), then non-due habits sorted by next due date
export const sortByDefault = (habits: Habit[]): Habit[] => {
  // Use the same consistent sorting logic for all environments
  return [...habits].sort((a, b) => {
    // Extract values
    const aIsDueToday = isHabitDueToday(a);
    const bIsDueToday = isHabitDueToday(b);
    const aIsCompletedToday = isCompletedToday(a);
    const bIsCompletedToday = isCompletedToday(b);

    // Create a priority score (lower is higher priority)
    let aPriority = 100;
    let bPriority = 100;

    // First priority: Sort by due status + completion
    if (aIsDueToday && !aIsCompletedToday)
      aPriority = 1; // Due, not completed (highest)
    else if (aIsDueToday && aIsCompletedToday)
      aPriority = 2; // Due, completed
    else if (!aIsDueToday && !aIsCompletedToday)
      aPriority = 3; // Not due, not completed
    else if (!aIsDueToday && aIsCompletedToday) aPriority = 4; // Not due, completed (lowest)

    if (bIsDueToday && !bIsCompletedToday) bPriority = 1;
    else if (bIsDueToday && bIsCompletedToday) bPriority = 2;
    else if (!bIsDueToday && !bIsCompletedToday) bPriority = 3;
    else if (!bIsDueToday && bIsCompletedToday) bPriority = 4;

    // If different priorities, sort by priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // For habits with the same priority, use next due date
    if (!aIsDueToday && !bIsDueToday) {
      const aNextDue = getNextDueDate(a);
      const bNextDue = getNextDueDate(b);
      const dateComparison = aNextDue.getTime() - bNextDue.getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }
    }

    // If all else is equal, use ID for complete stability
    return a._id.localeCompare(b._id);
  });
};

// Sort alphabetically by name
export const sortByAlphabetical = (habits: Habit[]): Habit[] => {
  return [...habits].sort((a, b) => a.name.localeCompare(b.name));
};

// Sort by streak (highest first)
export const sortByStreak = (habits: Habit[]): Habit[] => {
  return [...habits].sort((a, b) => b.streak - a.streak);
};

// Sort by creation date (newest first)
export const sortByNewest = (habits: Habit[]): Habit[] => {
  return [...habits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Sort by creation date (oldest first)
export const sortByOldest = (habits: Habit[]): Habit[] => {
  return [...habits].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

// Sort by completion rate (highest percentage first)
export const sortByCompletionRate = (habits: Habit[]): Habit[] => {
  return [...habits].sort((a, b) => {
    // Calculate completion rates
    const aRate = a.completedDates.length / Math.max(1, a.frequency.length);
    const bRate = b.completedDates.length / Math.max(1, b.frequency.length);
    return bRate - aRate;
  });
};

// Sort habits based on the selected sort option
export const sortHabits = (
  habits: Habit[],
  sortOption: SortOption
): Habit[] => {
  switch (sortOption) {
    case SortOption.ALPHABETICAL:
      return sortByAlphabetical(habits);
    case SortOption.STREAK:
      return sortByStreak(habits);
    case SortOption.NEWEST:
      return sortByNewest(habits);
    case SortOption.OLDEST:
      return sortByOldest(habits);
    case SortOption.COMPLETION_RATE:
      return sortByCompletionRate(habits);
    case SortOption.DEFAULT:
    default:
      return sortByDefault(habits);
  }
};

// Get display text for sort options
export const getSortOptionText = (option: SortOption): string => {
  switch (option) {
    case SortOption.DEFAULT:
      return "Priority (Default)";
    case SortOption.ALPHABETICAL:
      return "Alphabetical (A-Z)";
    case SortOption.STREAK:
      return "Streak (Highest)";
    case SortOption.NEWEST:
      return "Newest First";
    case SortOption.OLDEST:
      return "Oldest First";
    case SortOption.COMPLETION_RATE:
      return "Completion Rate";
    default:
      return "Sort By";
  }
};
