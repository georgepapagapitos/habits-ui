# API Integration

This document outlines how the Habits UI communicates with the backend API.

## API Client Setup

The application uses Axios for API communication. A centralized API client with interceptors handles authentication, error handling, and request/response formatting:

```tsx
// src/common/api/apiClient.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Create API client instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    // Create standardized error object
    const errorResponse = {
      message: error.response?.data?.message || "An error occurred",
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };

    return Promise.reject(errorResponse);
  }
);

export default apiClient;
```

## API Service Layer

The application uses a service layer pattern to encapsulate API calls:

```tsx
// src/features/habits/services/habitService.ts
import apiClient from "../../../common/api/apiClient";
import { Habit, CreateHabitDto, UpdateHabitDto } from "../types/habit.types";

export const habitService = {
  /**
   * Get all habits for the current user
   */
  getHabits: async (): Promise<Habit[]> => {
    const response = await apiClient.get("/habits");
    return response.data;
  },

  /**
   * Get a single habit by ID
   */
  getHabitById: async (id: string): Promise<Habit> => {
    const response = await apiClient.get(`/habits/${id}`);
    return response.data;
  },

  /**
   * Create a new habit
   */
  createHabit: async (habit: CreateHabitDto): Promise<Habit> => {
    const response = await apiClient.post("/habits", habit);
    return response.data;
  },

  /**
   * Update an existing habit
   */
  updateHabit: async (id: string, habit: UpdateHabitDto): Promise<Habit> => {
    const response = await apiClient.put(`/habits/${id}`, habit);
    return response.data;
  },

  /**
   * Delete a habit
   */
  deleteHabit: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}`);
  },

  /**
   * Toggle a habit's completion status for today
   */
  toggleHabitCompletion: async (id: string): Promise<Habit> => {
    const response = await apiClient.patch(`/habits/${id}/toggle`);
    return response.data;
  },

  /**
   * Toggle a habit's completion status for a specific date
   */
  toggleHabitCompletionForDate: async (
    id: string,
    date: string
  ): Promise<Habit> => {
    const response = await apiClient.patch(`/habits/${id}/toggle/${date}`);
    return response.data;
  },
};
```

## Custom Hooks for API Integration

API services are wrapped in custom hooks to provide React-friendly state management:

```tsx
// src/features/habits/hooks/useHabitApi.ts
import { useState, useCallback } from "react";
import { habitService } from "../services/habitService";
import { Habit, CreateHabitDto, UpdateHabitDto } from "../types/habit.types";

export const useHabitApi = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all habits
  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await habitService.getHabits();
      setHabits(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch habits";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get a single habit
  const fetchHabitById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await habitService.getHabitById(id);
      setSelectedHabit(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to fetch habit #${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new habit
  const createHabit = useCallback(async (habit: CreateHabitDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newHabit = await habitService.createHabit(habit);
      setHabits((prev) => [...prev, newHabit]);
      return newHabit;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create habit";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a habit
  const updateHabit = useCallback(
    async (id: string, habit: UpdateHabitDto) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedHabit = await habitService.updateHabit(id, habit);
        setHabits((prev) => prev.map((h) => (h.id === id ? updatedHabit : h)));
        if (selectedHabit?.id === id) {
          setSelectedHabit(updatedHabit);
        }
        return updatedHabit;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : `Failed to update habit #${id}`;
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedHabit]
  );

  // Delete a habit
  const deleteHabit = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await habitService.deleteHabit(id);
        setHabits((prev) => prev.filter((habit) => habit.id !== id));
        if (selectedHabit?.id === id) {
          setSelectedHabit(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : `Failed to delete habit #${id}`;
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedHabit]
  );

  // Toggle habit completion
  const toggleHabitCompletion = useCallback(
    async (id: string) => {
      setError(null);
      try {
        // Optimistic update
        setHabits((prev) =>
          prev.map((habit) => {
            if (habit.id === id) {
              // This is a simplified version - in real implementation we'd need to
              // calculate the actual changes to completedDates and streak
              return {
                ...habit,
                streak: habit.completedToday
                  ? habit.streak - 1
                  : habit.streak + 1,
                completedToday: !habit.completedToday,
              };
            }
            return habit;
          })
        );

        // Actual API call
        const updatedHabit = await habitService.toggleHabitCompletion(id);

        // Update with server data
        setHabits((prev) =>
          prev.map((habit) => (habit.id === id ? updatedHabit : habit))
        );
        if (selectedHabit?.id === id) {
          setSelectedHabit(updatedHabit);
        }

        return updatedHabit;
      } catch (err) {
        // Revert optimistic update on error
        fetchHabits(); // Refresh from server

        const errorMessage =
          err instanceof Error ? err.message : `Failed to toggle habit #${id}`;
        setError(errorMessage);
        throw err;
      }
    },
    [fetchHabits, selectedHabit]
  );

  return {
    habits,
    selectedHabit,
    isLoading,
    error,
    fetchHabits,
    fetchHabitById,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
  };
};
```

## Error Handling

The application implements a consistent error handling approach:

```tsx
// src/common/utils/errorUtils.ts
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export const isApiError = (error: any): error is ApiError => {
  return typeof error === "object" && error !== null && "message" in error;
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
};
```

## Using API Hooks in Components

The API hooks are used in components to fetch and manipulate data:

```tsx
// src/features/habits/components/HabitList.tsx
import { useEffect } from "react";
import { useHabitApi } from "../hooks/useHabitApi";
import HabitItem from "./HabitItem";
import ErrorMessage from "../../../common/components/ErrorMessage";
import LoadingSpinner from "../../../common/components/LoadingSpinner";

const HabitList = () => {
  const { habits, isLoading, error, fetchHabits, toggleHabitCompletion } =
    useHabitApi();

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleToggleCompletion = async (id: string) => {
    try {
      await toggleHabitCompletion(id);
    } catch (err) {
      // Error is already handled in the hook
      console.error("Failed to toggle habit completion", err);
    }
  };

  if (isLoading && habits.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && habits.length === 0) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      {habits.length === 0 ? (
        <div>No habits found. Create your first habit!</div>
      ) : (
        habits.map((habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onToggleCompletion={handleToggleCompletion}
          />
        ))
      )}
    </div>
  );
};

export default HabitList;
```

## Authentication Integration

The application implements authentication using JWT tokens:

```tsx
// src/features/auth/services/authService.ts
import apiClient from "../../../common/api/apiClient";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types/auth.types";

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    const { token, user } = response.data;

    // Store token in localStorage
    localStorage.setItem("auth_token", token);

    return { token, user };
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register", data);
    const { token, user } = response.data;

    // Store token in localStorage
    localStorage.setItem("auth_token", token);

    return { token, user };
  },

  /**
   * Logout the user
   */
  logout: (): void => {
    localStorage.removeItem("auth_token");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },
};
```

## Environment Variables

The application uses environment variables for API configuration:

```
# .env.development
VITE_API_URL=http://localhost:5050/api

# .env.production
VITE_API_URL=/api
```

These are accessed in the code using `import.meta.env.VITE_API_URL`.

## Best Practices

1. **Centralize API Communication**: Use a consistent apiClient instance
2. **Separate Service Layer**: Keep API calls in service modules
3. **Use Custom Hooks**: Wrap services in hooks for React state management
4. **Handle Loading States**: Show loading indicators during API calls
5. **Implement Error Handling**: Handle errors consistently
6. **Use TypeScript Types**: Define interfaces for request/response data
7. **Implement Optimistic Updates**: Update UI optimistically, then correct with server response
8. **Cache Results**: Cache API responses where appropriate
