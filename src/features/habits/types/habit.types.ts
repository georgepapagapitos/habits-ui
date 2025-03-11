// Time of day options
export type TimeOfDay = "morning" | "afternoon" | "evening" | "anytime";

// Days of the week for frequency
export type WeekDay =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

// Photo reward interface from API
export interface PhotoReward {
  id: string;
  url: string;
  thumbnailUrl?: string; // Small version for faster loading
  width: number;
  height: number;
}

// Habit interface matching the backend schema
export interface Habit {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  frequency: WeekDay[];
  timeOfDay: TimeOfDay;
  startDate: string; // ISO date string
  streak: number;
  completedDates: string[]; // ISO date strings
  active: boolean;
  createdAt: string;
  updatedAt: string;
  showReward?: boolean;
}

// Habit response type for habit completion - includes potential reward photo
export interface HabitWithReward extends Habit {
  rewardPhoto?: PhotoReward;
}

// DTO for creating a new habit
export interface HabitCreateDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency: WeekDay[];
  timeOfDay?: TimeOfDay;
  startDate?: Date;
  showReward?: boolean;
}

// DTO for updating an existing habit
export interface HabitUpdateDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: WeekDay[];
  timeOfDay?: TimeOfDay;
  active?: boolean;
  showReward?: boolean;
}
