// src/features/habits/hooks/useHabitManager.tsx
import { useState, useEffect, useCallback } from "react";
import { habitApi } from "../services/habitApi";
import { encouragingMessages } from "../constants";
import { Habit, WeekDay, HabitCreateDTO } from "../types";
import { isHabitDueToday } from "../utils";

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

  // Toggle habit completion for today
  const toggleHabit = async (id: string) => {
    try {
      const habit = habits.find((h) => h._id === id);

      if (habit && isHabitDueToday(habit)) {
        const updatedHabit = await habitApi.toggleCompletion(id);
        setHabits((prevHabits) =>
          prevHabits.map((h) => (h._id === id ? updatedHabit : h))
        );
        showTemporaryMessage(getRandomMessage());
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
