import { Habit, WeekDay } from "../types/habit.types";
import { useHabitManager } from "./useHabitManager";
import { createContext, ReactNode, useContext } from "react";

// Define the context shape based on the return type of useHabitManager
type HabitContextType = {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  messages: { id: string; text: string; duration?: number }[];
  handleAddHabit: (habitData: {
    name: string;
    frequency: WeekDay[];
    description?: string;
    color?: string;
    icon?: string;
    timeOfDay?: string;
  }) => Promise<Habit>;
  toggleHabit: (id: string, date?: Date) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, habitData: Partial<Habit>) => Promise<Habit>;
  resetHabit: (id: string) => Promise<Habit>;
  getHabitHistoryForDateRange: (
    habitId: string,
    startDate: Date,
    endDate: Date
  ) => { date: Date; due: boolean; completed: boolean }[];
  getWeeklyReport: () => {
    startDate: Date;
    endDate: Date;
    habitReports: {
      habitId: string;
      habitName: string;
      dueCount: number;
      completedCount: number;
      completionRate: number;
    }[];
    overallCompletionRate: number;
  } | null;
  refreshHabits: () => Promise<void>;
  showMessage: (message: string) => void;
  clearMessages: () => void;
};

// Create context with undefined initial value
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Provider component
export const HabitProvider = ({ children }: { children: ReactNode }) => {
  // Use the existing hook to manage habits
  const habitManager = useHabitManager();

  return (
    <HabitContext.Provider value={habitManager}>
      {children}
    </HabitContext.Provider>
  );
};

// Custom hook to use the habit context
export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
};
