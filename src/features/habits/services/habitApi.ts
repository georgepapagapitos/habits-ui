import axios from "axios";
import { format } from "date-fns";
import { Habit, HabitCreateDTO, HabitUpdateDTO } from "../types";
import { getUserTimezone } from "../utils/habitUtils";

// Base URL for the API - using environment variables
const API_URL = `${import.meta.env.VITE_API_URL || "/api"}/habits`;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Setup request headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const habitApi = {
  // Get all habits
  getAllHabits: async (): Promise<Habit[]> => {
    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
      });

      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Error fetching habits:", err.response?.data || err);
      throw (
        err.response?.data?.error || err.message || "Failed to fetch habits"
      );
    }
  },

  // Get a single habit by ID
  getHabitById: async (id: string): Promise<Habit> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });

      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error(`Error fetching habit ${id}:`, err.response?.data || err);
      throw err.response?.data?.error || err.message || "Failed to fetch habit";
    }
  },

  // Create a new habit
  createHabit: async (habitData: HabitCreateDTO): Promise<Habit> => {
    try {
      const response = await axios.post(API_URL, habitData, {
        headers: getAuthHeaders(),
      });

      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Error creating habit:", err.response?.data || err);
      throw (
        err.response?.data?.error || err.message || "Failed to create habit"
      );
    }
  },

  // Update an existing habit
  updateHabit: async (
    id: string,
    habitData: HabitUpdateDTO
  ): Promise<Habit> => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, habitData, {
        headers: getAuthHeaders(),
      });

      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error(`Error updating habit ${id}:`, err.response?.data || err);
      throw (
        err.response?.data?.error || err.message || "Failed to update habit"
      );
    }
  },

  // Delete a habit (soft delete)
  deleteHabit: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error(`Error deleting habit ${id}:`, err.response?.data || err);
      throw (
        err.response?.data?.error || err.message || "Failed to delete habit"
      );
    }
  },

  // Toggle habit completion
  toggleCompletion: async (
    id: string,
    date: Date = new Date()
  ): Promise<Habit> => {
    try {
      // Get user's timezone
      const userTimezone = getUserTimezone();

      // Format date as ISO string
      // This preserves the exact moment in time across timezones
      const isoDate = date.toISOString();

      // Log the request details for debugging
      const requestData = {
        date: isoDate,
        timezone: userTimezone,
      };

      console.log(
        `Toggling habit ${id} for date ${format(date, "yyyy-MM-dd")} in timezone ${userTimezone}`,
        `Request body:`,
        requestData
      );

      const response = await axios.patch(
        `${API_URL}/${id}/toggle-completion`,
        requestData,
        { headers: getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: any;
          status?: number;
          statusText?: string;
        };
        message?: string;
      };
      console.error(
        `Error toggling completion for habit ${id} [Status: ${err.response?.status} ${err.response?.statusText}]:`,
        err.response?.data || err
      );

      // More detailed error for debugging
      if (err.response?.data) {
        console.error(
          `Server response details:`,
          JSON.stringify(err.response.data, null, 2)
        );
      }

      throw (
        err.response?.data?.error ||
        err.message ||
        "Failed to toggle habit completion"
      );
    }
  },
};
