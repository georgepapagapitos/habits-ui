// Time of day options
export type TimeOfDay = "morning" | "afternoon" | "evening" | "anytime";

// Days of the week for frequency
export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

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
}
