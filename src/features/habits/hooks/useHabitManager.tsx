import { useCallback, useEffect, useState } from "react";
import { encouragingMessages } from "../constants";
import { habitApi } from "../services/habitApi";
import { Habit, HabitCreateDTO, TimeOfDay, WeekDay } from "../types";
import { isCompletedOnDate, isHabitDueOnDate } from "../utils";

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

  // Get a personalized random message
  const getRandomMessage = (habitName?: string) => {
    // Get user's name from localStorage or default to "you"
    const userName = localStorage.getItem("userName") || "Hannah";

    // Get messages with personalized name
    const messages = encouragingMessages(userName);
    const randIndex = Math.floor(Math.random() * messages.length);

    // Choose base message
    let message = messages[randIndex];

    // Append habit-specific messaging 10% of the time if habit name is provided
    if (habitName && Math.random() < 0.1) {
      message += ` Your progress with "${habitName}" is inspiring!`;
    }

    return message;
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
    const timeoutId = setTimeout(() => {
      setMessages((current) =>
        current.filter((msg) => msg.id !== newMessage.id)
      );
    }, 4000); // 4 seconds

    // Store the timeout id for cleanup (prevents memory leaks)
    return timeoutId;
  };

  // Clean up all timeouts when component unmounts
  useEffect(() => {
    const timeoutIds: number[] = [];

    return () => {
      // Clear all timeouts when component unmounts
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, []);

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
        timeOfDay: habitData.timeOfDay as TimeOfDay | undefined,
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

      // Check if this is a future date
      const isFutureDate =
        date.getTime() > new Date().setHours(23, 59, 59, 999);

      // Don't allow toggling future dates
      if (isFutureDate) {
        showTemporaryMessage("Cannot mark habits complete for future dates");
        return;
      }

      // Make API call to toggle completion
      const updatedHabit = await habitApi.toggleCompletion(id, date);
      setHabits((prevHabits) =>
        prevHabits.map((h) => (h._id === id ? updatedHabit : h))
      );

      // Get completion status before and after
      const wasCompletedBefore = isCompletedOnDate(habit, date);
      const isCompletedNow = isCompletedOnDate(updatedHabit, date);
      const isToday =
        new Date(date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);

      // Show appropriate message based on action
      if (!wasCompletedBefore && isCompletedNow) {
        // Determine if this date is a due date for this habit
        const isDueDate = isHabitDueOnDate(updatedHabit, date);

        // Habit was marked as completed
        if (isToday) {
          const message = isDueDate
            ? getRandomMessage(updatedHabit.name)
            : `Bonus completion for "${updatedHabit.name}"! 🎉 (This adds to your streak!)`;
          showTemporaryMessage(message);
        } else {
          const bonusMsg = isDueDate ? "" : " (bonus completion)";
          showTemporaryMessage(
            `Marked "${updatedHabit.name}" as complete for ${date.toLocaleDateString()}${bonusMsg}`
          );
        }
      } else if (wasCompletedBefore && !isCompletedNow) {
        // Habit was unmarked
        if (isToday) {
          showTemporaryMessage(`Unmarked "${habit.name}" for today`);
        } else {
          showTemporaryMessage(
            `Unmarked "${habit.name}" for ${date.toLocaleDateString()}`
          );
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

  // Reset a habit (clear all completions and streak)
  const resetHabit = async (id: string) => {
    try {
      const habit = habits.find((h) => h._id === id);
      if (!habit) {
        throw new Error("Habit not found");
      }

      const resetHabit = await habitApi.resetHabit(id);
      setHabits((prevHabits) =>
        prevHabits.map((h) => (h._id === id ? resetHabit : h))
      );
      showTemporaryMessage(`Reset habit: ${resetHabit.name}`);
      return resetHabit;
    } catch (err) {
      showTemporaryMessage("Failed to reset habit. Please try again.");
      console.error("Error resetting habit:", err);
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
    resetHabit,
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
