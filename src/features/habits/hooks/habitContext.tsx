import { Habit, HabitCreateDTO, HabitUpdateDTO } from "@habits/types";
import { createContext, ReactNode, useContext } from "react";
import { useHabitManager } from "./useHabitManager";

// Define the context shape based on the return type of useHabitManager
type HabitContextType = {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  messages: { id: string; text: string; duration?: number }[];
  handleAddHabit: (habit: HabitCreateDTO) => Promise<Habit | undefined>;
  toggleHabit: (
    habitId: string,
    date: Date | string,
    completed?: boolean
  ) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  updateHabit: (habitId: string, updatedHabit: HabitUpdateDTO) => Promise<void>;
  resetHabit: (habitId: string) => Promise<void>;
  getHabitHistoryForDateRange: (
    habitId: string,
    startDate: string,
    endDate: string
  ) => Promise<{ date: Date; due: boolean; completed: boolean }[]>;
  getWeeklyReport: () => { completed: number; total: number };
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
