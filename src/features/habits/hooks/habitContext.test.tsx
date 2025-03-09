import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { HabitProvider, useHabits } from "./habitContext";
import * as useHabitManagerModule from "./useHabitManager";

// Mock the useHabitManager hook
vi.mock("./useHabitManager", () => ({
  useHabitManager: vi.fn(),
}));

// Create a test component that uses the habits context
const TestComponent = () => {
  const { habits, loading } = useHabits();
  return (
    <div>
      {loading ? (
        <p data-testid="loading">Loading...</p>
      ) : (
        <ul>
          {habits.map((habit) => (
            <li key={habit._id} data-testid="habit-item">
              {habit.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

describe("HabitContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides habit state from useHabitManager", async () => {
    // Mock the return value of useHabitManager
    const mockHabits = [
      { _id: "1", name: "Test Habit 1", frequency: ["Monday"] },
      { _id: "2", name: "Test Habit 2", frequency: ["Tuesday"] },
    ];

    (
      useHabitManagerModule.useHabitManager as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      habits: mockHabits,
      loading: false,
      error: null,
      messages: [],
      handleAddHabit: vi.fn(),
      toggleHabit: vi.fn(),
      deleteHabit: vi.fn(),
      updateHabit: vi.fn(),
      resetHabit: vi.fn(),
      getHabitHistoryForDateRange: vi.fn(),
      getWeeklyReport: vi.fn(),
      refreshHabits: vi.fn(),
      showMessage: vi.fn(),
      clearMessages: vi.fn(),
    });

    // Render the test component with the provider
    render(
      <HabitProvider>
        <TestComponent />
      </HabitProvider>
    );

    // Check if the habits are displayed
    const habitItems = screen.getAllByTestId("habit-item");
    expect(habitItems).toHaveLength(2);
    expect(habitItems[0]).toHaveTextContent("Test Habit 1");
    expect(habitItems[1]).toHaveTextContent("Test Habit 2");
  });

  it("shows loading state correctly", async () => {
    // Mock the loading state
    (
      useHabitManagerModule.useHabitManager as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      habits: [],
      loading: true,
      error: null,
      messages: [],
      handleAddHabit: vi.fn(),
      toggleHabit: vi.fn(),
      deleteHabit: vi.fn(),
      updateHabit: vi.fn(),
      resetHabit: vi.fn(),
      getHabitHistoryForDateRange: vi.fn(),
      getWeeklyReport: vi.fn(),
      refreshHabits: vi.fn(),
      showMessage: vi.fn(),
      clearMessages: vi.fn(),
    });

    // Render the test component with the provider
    render(
      <HabitProvider>
        <TestComponent />
      </HabitProvider>
    );

    // Check if loading state is displayed
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });
});
