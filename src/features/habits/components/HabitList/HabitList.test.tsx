import { HabitList } from "@habits/components";
import * as HabitsContext from "@habits/hooks/habitContext";
import { Habit } from "@habits/types";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { describe, expect, test, vi } from "vitest";

// Mock the HabitCard component to simplify testing
vi.mock("../HabitCard", () => ({
  HabitCard: ({ habit }: { habit: Habit }) => (
    <div data-testid={`habit-card-${habit._id}`}>
      <h3>{habit.name}</h3>
      <button>Toggle</button>
      <button>Edit</button>
      <button>Delete</button>
    </div>
  ),
}));

describe("HabitList", () => {
  const mockHabits: Habit[] = [
    {
      _id: "1",
      name: "Read",
      color: "blue",
      icon: "book",
      frequency: ["monday", "wednesday", "friday"],
      timeOfDay: "evening",
      streak: 3,
      startDate: "2023-01-01",
      completedDates: ["2023-01-01"],
      active: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    },
    {
      _id: "2",
      name: "Exercise",
      color: "green",
      icon: "run",
      frequency: ["tuesday", "thursday", "saturday"],
      timeOfDay: "morning",
      streak: 5,
      startDate: "2023-01-01",
      completedDates: ["2023-01-02"],
      active: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-02",
    },
  ];

  const mockToggleHabit = vi.fn();
  // mockToggleDate is not used directly but may be needed for future tests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockToggleDate = vi.fn();
  const mockDeleteHabit = vi.fn();
  const mockEditHabit = vi.fn();

  // Setup before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state", () => {
    // Mock the useHabits hook to return loading state
    vi.spyOn(HabitsContext, "useHabits").mockReturnValue({
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

    renderWithProviders(<HabitList />);

    expect(screen.getByText("Loading habits...")).toBeInTheDocument();
  });

  test("renders error state", () => {
    // Mock the useHabits hook to return error state
    vi.spyOn(HabitsContext, "useHabits").mockReturnValue({
      habits: [],
      loading: false,
      error: "Failed to load habits",
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

    renderWithProviders(<HabitList />);

    expect(
      screen.getByText("Error: Failed to load habits")
    ).toBeInTheDocument();
    expect(screen.getByText("Please try again later.")).toBeInTheDocument();
  });

  test("renders empty state", () => {
    // Mock the useHabits hook to return empty habits array
    vi.spyOn(HabitsContext, "useHabits").mockReturnValue({
      habits: [],
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

    renderWithProviders(<HabitList />);

    expect(
      screen.getByText("You don't have any habits yet!")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add your first habit using the button below.")
    ).toBeInTheDocument();
  });

  test("renders list of habits", () => {
    // Mock the useHabits hook to return habits
    vi.spyOn(HabitsContext, "useHabits").mockReturnValue({
      habits: mockHabits,
      loading: false,
      error: null,
      messages: [],
      handleAddHabit: vi.fn(),
      toggleHabit: mockToggleHabit,
      deleteHabit: mockDeleteHabit,
      updateHabit: vi.fn(),
      resetHabit: mockEditHabit,
      getHabitHistoryForDateRange: vi.fn(),
      getWeeklyReport: vi.fn(),
      refreshHabits: vi.fn(),
      showMessage: vi.fn(),
      clearMessages: vi.fn(),
    });

    renderWithProviders(<HabitList />);

    // Check that both habits are rendered
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Exercise")).toBeInTheDocument();

    // Check that all habit cards are rendered
    expect(screen.getByTestId("habit-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("habit-card-2")).toBeInTheDocument();
  });
});
