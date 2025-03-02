import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useHabitManager } from "./useHabitManager";
import { habitApi } from "../services/habitApi";
import { Habit, WeekDay } from "../types";

// Mock the habitApi
vi.mock("../services/habitApi", () => ({
  habitApi: {
    getAllHabits: vi.fn(),
    createHabit: vi.fn(),
    toggleCompletion: vi.fn(),
    updateHabit: vi.fn(),
    deleteHabit: vi.fn(),
  },
}));

// Mock the isCompletedToday function
vi.mock("../utils", () => ({
  isCompletedToday: vi.fn().mockImplementation((habit) => {
    // Check if habit completedDates includes today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return habit.completedDates.some((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });
  }),
  isCompletedOnDate: vi.fn().mockReturnValue(true),
  isHabitDueOnDate: vi.fn().mockReturnValue(true),
  isHabitDueToday: vi.fn().mockReturnValue(true),
  getFrequencyDisplayText: vi.fn().mockReturnValue("Every day"),
  getNextDueDate: vi.fn().mockImplementation(() => new Date()),
  getUserTimezone: vi.fn().mockReturnValue("America/Chicago"),
  normalizeDate: vi.fn().mockImplementation((date) => date),
  dateInUserTimezone: vi.fn().mockImplementation((date) => date),
}));

// Mock encouragingMessages
vi.mock("../constants", () => ({
  encouragingMessages: vi
    .fn()
    .mockImplementation((name) => [`Great job, ${name}!`, "Awesome work!"]),
}));

// Create mock habits
const createMockHabit = (overrides = {}): Habit => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    _id: "habit-1",
    name: "Test Habit",
    frequency: ["monday", "wednesday", "friday"] as WeekDay[],
    completedDates: [],
    color: "blue",
    icon: "leaf",
    timeOfDay: "morning",
    streak: 2,
    active: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "user-1",
    ...overrides,
  };
};

describe("useHabitManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "userName") return "Hannah";
      return null;
    });

    // Set up success responses for all API calls
    const mockHabit = createMockHabit();
    (habitApi.getAllHabits as jest.Mock).mockResolvedValue([mockHabit]);
    (habitApi.toggleCompletion as jest.Mock).mockResolvedValue(
      createMockHabit({ completedDates: [new Date().toISOString()] })
    );
    (habitApi.deleteHabit as jest.Mock).mockResolvedValue(undefined);
  });

  it("adds a new habit", async () => {
    // Setup
    const newHabit = createMockHabit({ _id: "new-habit" });
    (habitApi.createHabit as jest.Mock).mockResolvedValue(newHabit);

    // Execute hook in an async act block
    let addedHabit: Habit | null = null;
    const { result } = renderHook(() => useHabitManager());

    // Wait for initial load to settle
    await vi.waitFor(() => {
      expect(habitApi.getAllHabits).toHaveBeenCalled();
    });

    // Initial state check
    expect(result.current.habits).toEqual([]);

    // Mock console.warn to suppress act() warnings during the test
    const originalWarn = console.warn;
    console.warn = vi.fn();

    // Act - add a habit with proper act wrapper
    const habitData = {
      name: "New Habit",
      frequency: ["monday"] as WeekDay[],
    };

    // Use act to handle the async updates
    await act(async () => {
      addedHabit = await result.current.handleAddHabit(habitData);
    });

    // Restore console.warn
    console.warn = originalWarn;

    // Assert API was called correctly
    expect(habitApi.createHabit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Habit",
        frequency: ["monday"],
      })
    );

    // Verify the returned habit matches what we expect
    expect(addedHabit).toEqual(newHabit);
  });

  it("deletes a habit", async () => {
    // Execute
    const { result } = renderHook(() => useHabitManager());

    // Wait for initial load to settle
    await vi.waitFor(() => {
      expect(habitApi.getAllHabits).toHaveBeenCalled();
    });

    // Mock console.warn to suppress act() warnings during the test
    const originalWarn = console.warn;
    console.warn = vi.fn();

    // Act - delete a habit with proper act wrapper
    await act(async () => {
      await result.current.deleteHabit("habit-1");
    });

    // Restore console.warn
    console.warn = originalWarn;

    // Assert API was called correctly
    expect(habitApi.deleteHabit).toHaveBeenCalledWith("habit-1");
  });

  it("handles API errors gracefully", async () => {
    // Setup - mock API failure
    (habitApi.toggleCompletion as jest.Mock).mockRejectedValue(
      new Error("API error")
    );

    // Mock console.error and console.warn to prevent error output and act warnings in tests
    const originalConsoleError = console.error;
    const originalWarn = console.warn;
    console.error = vi.fn();
    console.warn = vi.fn();

    // Execute
    const { result } = renderHook(() => useHabitManager());

    // Wait for initial load to settle
    await vi.waitFor(() => {
      expect(habitApi.getAllHabits).toHaveBeenCalled();
    });

    // Act - try to toggle a habit that will fail with proper act wrapper
    await act(async () => {
      await result.current.toggleHabit("habit-1");
    });

    // Assert console.error was called with the error
    expect(console.error).toHaveBeenCalledWith(
      "Error toggling habit:",
      expect.any(Error)
    );

    // Restore console functions
    console.error = originalConsoleError;
    console.warn = originalWarn;
  });
});
