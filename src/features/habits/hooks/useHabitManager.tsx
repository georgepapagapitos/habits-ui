import { useCallback, useEffect, useState } from "react";
import { encouragingMessages } from "../constants";
import { habitApi } from "../services/habitApi";
import { Habit, HabitCreateDTO, WeekDay } from "../types";
import {
  isCompletedOnDate,
  isCompletedToday,
  isHabitDueOnDate,
} from "../utils";

// Message type
type Message = {
  id: number;
  text: string;
};

export function useHabitManager() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch habits on component mount
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setLoading(true);
        const fetchedHabits = await habitApi.getAllHabits();
        setHabits(fetchedHabits);
        setError(null);
      } catch (err) {
        setError("Failed to load habits. Please try again later.");
        console.error("Error fetching habits:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  const getRandomMessage = () => {
    const randIndex = Math.floor(Math.random() * encouragingMessages.length);
    return encouragingMessages[randIndex];
  };

  // Enhanced message display - adds to queue
  const showTemporaryMessage = (message: string) => {
    const newMessage = {
      id: Date.now(),
      text: message,
    };
    // Add to existing messages
    setMessages((current) => [...current, newMessage]);
    // Set timeout to remove this specific message
    setTimeout(() => {
      setMessages((current) =>
        current.filter((msg) => msg.id !== newMessage.id)
      );
    }, 4000); // 4 seconds
  };

  // Add a new habit
  const handleAddHabit = async (habitData: {
    name: string;
    frequency: WeekDay[];
    description?: string;
    color?: string;
    icon?: string;
    timeOfDay?: string;
  }) => {
    try {
      const newHabitData: HabitCreateDTO = {
        name: habitData.name,
        frequency: habitData.frequency,
        description: habitData.description,
        color: habitData.color,
        icon: habitData.icon,
        timeOfDay: habitData.timeOfDay as any,
        startDate: new Date(),
      };

      const newHabit = await habitApi.createHabit(newHabitData);
      setHabits((prevHabits) => [...prevHabits, newHabit]);
      showTemporaryMessage(`Added new habit: ${habitData.name}`);
      return newHabit;
    } catch (err) {
      showTemporaryMessage("Failed to add habit. Please try again.");
      console.error("Error adding habit:", err);
      throw err;
    }
  };

  // Toggle habit completion for today or a specific date
  const toggleHabit = async (id: string, date: Date = new Date()) => {
    try {
      const habit = habits.find((h) => h._id === id);

      if (!habit) {
        throw new Error("Habit not found");
      }

      // Check if the habit is due on the specified date
      const isDueOnDate = isHabitDueOnDate(habit, date);

      // For historical dates, we allow toggling regardless of whether it was due
      const isHistorical = date.getTime() < new Date().setHours(0, 0, 0, 0);

      if (isDueOnDate || isHistorical) {
        const updatedHabit = await habitApi.toggleCompletion(id, date);
        setHabits((prevHabits) =>
          prevHabits.map((h) => (h._id === id ? updatedHabit : h))
        );

        // Only show celebration message for today's completions
        if (isCompletedToday(updatedHabit)) {
          showTemporaryMessage(getRandomMessage());
        }
      }
    } catch (err) {
      showTemporaryMessage("Failed to update habit. Please try again.");
      console.error("Error toggling habit:", err);
    }
  };

  // Delete a habit
  const deleteHabit = async (id: string) => {
    try {
      await habitApi.deleteHabit(id);
      setHabits((prevHabits) => prevHabits.filter((h) => h._id !== id));
      showTemporaryMessage("Habit deleted successfully");
    } catch (err) {
      showTemporaryMessage("Failed to delete habit. Please try again.");
      console.error("Error deleting habit:", err);
    }
  };

  // Update a habit
  const updateHabit = async (id: string, habitData: Partial<Habit>) => {
    try {
      const updatedHabit = await habitApi.updateHabit(id, habitData);
      setHabits((prevHabits) =>
        prevHabits.map((h) => (h._id === id ? updatedHabit : h))
      );
      showTemporaryMessage(`Updated habit: ${updatedHabit.name}`);
      return updatedHabit;
    } catch (err) {
      showTemporaryMessage("Failed to update habit. Please try again.");
      console.error("Error updating habit:", err);
      throw err;
    }
  };

  // For backward compatibility with your current App component
  const showMessage = messages.length > 0;
  const currentMessage = messages[0]?.text || "";

  // Get habit completion data for a date range (for analytics/reports)
  const getHabitHistoryForDateRange = useCallback(
    (habitId: string, startDate: Date, endDate: Date) => {
      const habit = habits.find((h) => h._id === habitId);
      if (!habit) return [];

      const result = [];
      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      // List of all days in the range
      while (currentDate <= endDateTime) {
        const dueOnThisDay = isHabitDueOnDate(habit, new Date(currentDate));
        const completedOnThisDay = isCompletedOnDate(
          habit,
          new Date(currentDate)
        );

        result.push({
          date: new Date(currentDate),
          due: dueOnThisDay,
          completed: completedOnThisDay,
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    },
    [habits]
  );

  // Get weekly report with completion rates
  const getWeeklyReport = useCallback(() => {
    if (habits.length === 0) return null;

    const today = new Date();
    const startOfWeek = new Date(today);
    // Set to previous Sunday (or adjust based on locale)
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const habitReports = habits.map((habit) => {
      const daysInWeek = 7;
      let dueCount = 0;
      let completedCount = 0;

      // Check each day of the week
      for (let i = 0; i < daysInWeek; i++) {
        const checkDate = new Date(startOfWeek);
        checkDate.setDate(startOfWeek.getDate() + i);

        // Check if habit was due on this day
        const dayName = checkDate
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        const isDue = habit.frequency.some(
          (day) => day.toLowerCase() === dayName
        );

        if (isDue) {
          dueCount++;
          if (isCompletedOnDate(habit, checkDate)) {
            completedCount++;
          }
        }
      }

      return {
        habitId: habit._id,
        habitName: habit.name,
        dueCount,
        completedCount,
        completionRate: dueCount > 0 ? (completedCount / dueCount) * 100 : 0,
      };
    });

    return {
      startDate: startOfWeek,
      endDate: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000),
      habitReports,
      overallCompletionRate:
        habitReports.reduce((sum, report) => sum + report.completionRate, 0) /
        habitReports.length,
    };
  }, [habits]);

  return {
    habits,
    loading,
    error,
    messages,
    showMessage,
    currentMessage,
    handleAddHabit,
    toggleHabit,
    deleteHabit,
    updateHabit,
    getHabitHistoryForDateRange,
    getWeeklyReport,
    refreshHabits: useCallback(async () => {
      try {
        setLoading(true);
        const fetchedHabits = await habitApi.getAllHabits();
        setHabits(fetchedHabits);
        setError(null);
      } catch (err) {
        setError("Failed to refresh habits. Please try again later.");
        console.error("Error refreshing habits:", err);
      } finally {
        setLoading(false);
      }
    }, []),
  };
}
