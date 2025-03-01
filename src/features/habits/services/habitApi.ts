import { Habit, HabitCreateDTO, HabitUpdateDTO } from "../types";

// Base URL for the API - you might want to use an environment variable in production
const API_BASE_URL = "http://localhost:5050/api";

export const habitApi = {
  // Get all habits
  getAllHabits: async (): Promise<Habit[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch habits");
      }

      return result.data;
    } catch (error) {
      console.error("Error fetching habits:", error);
      throw error;
    }
  },

  // Get a single habit by ID
  getHabitById: async (id: string): Promise<Habit> => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch habit");
      }

      return result.data;
    } catch (error) {
      console.error(`Error fetching habit ${id}:`, error);
      throw error;
    }
  },

  // Create a new habit
  createHabit: async (habitData: HabitCreateDTO): Promise<Habit> => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habitData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          Array.isArray(result.error)
            ? result.error.join(", ")
            : result.error || "Failed to create habit"
        );
      }

      return result.data;
    } catch (error) {
      console.error("Error creating habit:", error);
      throw error;
    }
  },

  // Update an existing habit
  updateHabit: async (
    id: string,
    habitData: HabitUpdateDTO
  ): Promise<Habit> => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habitData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          Array.isArray(result.error)
            ? result.error.join(", ")
            : result.error || "Failed to update habit"
        );
      }

      return result.data;
    } catch (error) {
      console.error(`Error updating habit ${id}:`, error);
      throw error;
    }
  },

  // Delete a habit (soft delete)
  deleteHabit: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete habit");
      }
    } catch (error) {
      console.error(`Error deleting habit ${id}:`, error);
      throw error;
    }
  },

  // Toggle habit completion
  toggleCompletion: async (
    id: string,
    date: Date = new Date()
  ): Promise<Habit> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/habits/${id}/toggle-completion`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date: date.toISOString() }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to toggle habit completion");
      }

      return result.data;
    } catch (error) {
      console.error(`Error toggling completion for habit ${id}:`, error);
      throw error;
    }
  },
};
