# State Management

This document outlines how state is managed in the Habits UI application.

## State Management Architecture

The Habits UI uses a combination of React's built-in state management solutions and custom hooks for managing state:

1. **Local Component State**: Using React's `useState` hook
2. **Application State**: Using React Context API
3. **Server Cache State**: Using custom hooks with local caching

## Local Component State

Local component state is used for UI state that belongs to a single component and doesn't need to be shared:

```tsx
import { useState } from "react";

const HabitForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Component logic here
};
```

## Application State with Context API

For state that needs to be shared across multiple components, the application uses React Context:

### Creating a Context

```tsx
// src/features/habits/context/HabitContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { Habit } from "../types/habit.types";

interface HabitContextType {
  habits: Habit[];
  selectedHabit: Habit | null;
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  createHabit: (habit: Omit<Habit, "id">) => Promise<void>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  selectHabit: (habit: Habit | null) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider = ({ children }: { children: ReactNode }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Implement context methods
  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      // API call implementation
      const response = await fetch("/api/habits");
      const data = await response.json();
      setHabits(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch habits");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Other methods implementation...

  const value = {
    habits,
    selectedHabit,
    isLoading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    selectHabit,
  };

  return (
    <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
  );
};

export const useHabitContext = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabitContext must be used within a HabitProvider");
  }
  return context;
};
```

### Using the Context

```tsx
// src/features/habits/components/HabitList.tsx
import { useEffect } from "react";
import { useHabitContext } from "../context/HabitContext";
import HabitItem from "./HabitItem";

const HabitList = () => {
  const { habits, isLoading, error, fetchHabits } = useHabitContext();

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  if (isLoading) return <div>Loading habits...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {habits.length === 0 ? (
        <div>No habits found. Create your first habit!</div>
      ) : (
        habits.map((habit) => <HabitItem key={habit.id} habit={habit} />)
      )}
    </div>
  );
};

export default HabitList;
```

## Custom Data Fetching Hooks

For data fetching and caching, the application uses custom hooks:

```tsx
// src/features/habits/hooks/useHabits.ts
import { useState, useCallback, useEffect } from "react";
import { Habit } from "../types/habit.types";
import { useAuthContext } from "../../auth/context/AuthContext";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthContext();

  const fetchHabits = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/habits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setHabits(data);
      setError(null);

      // Cache habits in localStorage
      localStorage.setItem(
        "habits_cache",
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habits");

      // Try to load from cache if available
      const cachedData = localStorage.getItem("habits_cache");
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          // Only use cache if it's less than 1 hour old
          if (Date.now() - timestamp < 3600000) {
            setHabits(data);
          }
        } catch (cacheErr) {
          console.error("Failed to read from cache", cacheErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Additional CRUD operations...

  // Load habits when the hook is first used or token changes
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    isLoading,
    error,
    fetchHabits,
    // Other methods...
  };
};
```

## Global App State

For truly global state that affects the entire application, such as authentication, theme, and UI preferences:

```tsx
// src/common/context/AppContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return (
      savedMode === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode.toString());
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleDarkMode,
    isSidebarOpen,
    toggleSidebar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
```

## State Management Best Practices

1. **Prefer local state** for component-specific UI state
2. **Use context for shared state** that multiple components need to access
3. **Keep context providers focused** on specific domains (auth, habits, etc.)
4. **Wrap providers at the appropriate level** in the component tree
5. **Use custom hooks to encapsulate logic** and make it reusable
6. **Consider performance implications** - use memoization with `useMemo` and `useCallback`
7. **Handle loading and error states** consistently
8. **Implement optimistic updates** for better user experience

## Context Provider Organization

The application wraps context providers in the following order:

```tsx
// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./common/context/AppContext";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { HabitProvider } from "./features/habits/context/HabitContext";
import Routes from "./Routes";

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <HabitProvider>
            <Routes />
          </HabitProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
```

This approach ensures that:

1. Authentication state is available throughout the app
2. Feature-specific state is only available where needed
3. Global app state is available to all components
