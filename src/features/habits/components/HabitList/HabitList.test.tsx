import { HabitList } from "@habits/components";
import * as HabitsContext from "@habits/hooks/habitContext";
import { Habit } from "@habits/types";
import * as habitUtils from "@habits/utils";
import { screen, within } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { describe, expect, test, vi, beforeEach } from "vitest";

// Mock the utility functions
vi.mock("@habits/utils", () => ({
  isHabitDueToday: vi.fn(),
  isCompletedToday: vi.fn(),
  getNextDueDate: vi.fn(),
}));

// Ensure we're explicitly in test mode for this test file
vi.stubEnv("NODE_ENV", "test");

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
    {
      _id: "3",
      name: "Meditate",
      color: "purple",
      icon: "meditation",
      frequency: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      timeOfDay: "morning",
      streak: 10,
      startDate: "2023-01-01",
      completedDates: ["2023-01-01", "2023-01-02", "2023-01-03"],
      active: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-03",
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
    process.env.NODE_ENV = "test";
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

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading habits")).toBeInTheDocument();
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

    // Default mocks - no special sorting conditions
    vi.mocked(habitUtils.isHabitDueToday).mockReturnValue(false);
    vi.mocked(habitUtils.isCompletedToday).mockReturnValue(false);
    vi.mocked(habitUtils.getNextDueDate).mockReturnValue(new Date());

    renderWithProviders(<HabitList />);

    // Check that all habits are rendered
    expect(screen.getByTestId("habit-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("habit-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("habit-card-3")).toBeInTheDocument();

    // Check habit names are displayed
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Exercise")).toBeInTheDocument();
    expect(screen.getByText("Meditate")).toBeInTheDocument();
  });

  test.skip("sorts habits with due-today-not-completed first", () => {
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

    // Set up the utility mocks
    // Exercise and Meditate are due today
    vi.mocked(habitUtils.isHabitDueToday).mockImplementation((habit) => {
      return habit._id === "2" || habit._id === "3";
    });

    // Only Meditate is completed today
    vi.mocked(habitUtils.isCompletedToday).mockImplementation((habit) => {
      return habit._id === "3";
    });

    // Set up next due dates
    vi.mocked(habitUtils.getNextDueDate).mockImplementation((habit) => {
      if (habit._id === "1") {
        // Read is due in 2 days
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return date;
      } else if (habit._id === "2") {
        // Exercise is due today (but already handled by isHabitDueToday)
        return new Date();
      } else {
        // Meditate is due in 1 day (but also handled by isHabitDueToday)
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
      }
    });

    renderWithProviders(<HabitList />);

    // Verify that the expected habits are rendered
    const exerciseCard = screen.getByTestId("habit-card-2");
    const meditateCard = screen.getByTestId("habit-card-3");
    const readCard = screen.getByTestId("habit-card-1");

    // Verify the content is correct
    expect(within(exerciseCard).getByText("Exercise")).toBeInTheDocument();
    expect(within(meditateCard).getByText("Meditate")).toBeInTheDocument();
    expect(within(readCard).getByText("Read")).toBeInTheDocument();

    // Get the ordered list
    const allCards = screen.getAllByTestId(/^habit-card/);

    // Find positions in the list
    const exerciseIndex = allCards.indexOf(exerciseCard);
    const meditateIndex = allCards.indexOf(meditateCard);
    const readIndex = allCards.indexOf(readCard);

    // Check relative ordering - this should work regardless of exact indices
    // 1. Exercise (due today, not completed) should come before Meditate (due today, completed)
    expect(readCard).toBeInTheDocument(); // Just ensure it exists

    // KEY TEST: Exercise (due today, not completed) should be before Meditate (due today, completed)
    expect(exerciseIndex).toBeLessThan(meditateIndex);

    // Read (not due today) should come last - after both due today habits
    expect(readIndex).toBeGreaterThan(exerciseIndex);
    expect(readIndex).toBeGreaterThan(meditateIndex);
  });

  test.skip("places completed habits at the bottom", () => {
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

    // Set up the utility mocks for a different sorting scenario
    // No habits are due today
    vi.mocked(habitUtils.isHabitDueToday).mockReturnValue(false);

    // Read and Meditate are completed today
    vi.mocked(habitUtils.isCompletedToday).mockImplementation((habit) => {
      return habit._id === "1" || habit._id === "3";
    });

    // Set up next due dates (only relevant for Exercise in this case)
    vi.mocked(habitUtils.getNextDueDate).mockImplementation(() => {
      const date = new Date();
      date.setDate(date.getDate() + 1); // All habits due tomorrow
      return date;
    });

    renderWithProviders(<HabitList />);

    // Get all habit cards by test ID
    const exerciseCard = screen.getByTestId("habit-card-2");
    const meditateCard = screen.getByTestId("habit-card-3");
    const readCard = screen.getByTestId("habit-card-1");

    // Verify we have the right contents
    expect(within(exerciseCard).getByText("Exercise")).toBeInTheDocument();
    expect(within(meditateCard).getByText("Meditate")).toBeInTheDocument();
    expect(within(readCard).getByText("Read")).toBeInTheDocument();

    // Get the DOM order of the cards
    const allCards = screen.getAllByTestId(/^habit-card/);

    // Get the indices
    const exerciseIndex = allCards.indexOf(exerciseCard);
    const meditateIndex = allCards.indexOf(meditateCard);
    const readIndex = allCards.indexOf(readCard);

    // Exercise (not completed) should come before both completed habits
    expect(exerciseIndex).toBeLessThan(meditateIndex);
    expect(exerciseIndex).toBeLessThan(readIndex);

    // Both Read and Meditate are completed, so they should both come after Exercise
    expect(meditateIndex).toBeGreaterThan(exerciseIndex);
    expect(readIndex).toBeGreaterThan(exerciseIndex);
  });

  test.skip("sorts non-due habits by next due date", () => {
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

    // Set up the utility mocks for sorting by next due date
    // No habits are due today
    vi.mocked(habitUtils.isHabitDueToday).mockReturnValue(false);

    // No habits are completed today
    vi.mocked(habitUtils.isCompletedToday).mockReturnValue(false);

    // Set up next due dates with different values
    vi.mocked(habitUtils.getNextDueDate).mockImplementation((habit) => {
      const date = new Date();

      if (habit._id === "1") {
        // Read is due in 3 days
        date.setDate(date.getDate() + 3);
      } else if (habit._id === "2") {
        // Exercise is due in 1 day
        date.setDate(date.getDate() + 1);
      } else {
        // Meditate is due in 2 days
        date.setDate(date.getDate() + 2);
      }

      return date;
    });

    renderWithProviders(<HabitList />);

    // Get all habit cards by test ID
    const exerciseCard = screen.getByTestId("habit-card-2");
    const meditateCard = screen.getByTestId("habit-card-3");
    const readCard = screen.getByTestId("habit-card-1");

    // Verify the content is correct
    expect(within(exerciseCard).getByText("Exercise")).toBeInTheDocument();
    expect(within(meditateCard).getByText("Meditate")).toBeInTheDocument();
    expect(within(readCard).getByText("Read")).toBeInTheDocument();

    // Get the DOM order of the cards
    const allCards = screen.getAllByTestId(/^habit-card/);

    // Get the indices
    const exerciseIndex = allCards.indexOf(exerciseCard);
    const meditateIndex = allCards.indexOf(meditateCard);
    const readIndex = allCards.indexOf(readCard);

    // Assertions based on next due date
    // Exercise (due in 1 day) should be before Meditate (due in 2 days)
    expect(exerciseIndex).toBeLessThan(meditateIndex);

    // Meditate (due in 2 days) should be before Read (due in 3 days)
    expect(meditateIndex).toBeLessThan(readIndex);

    // Transitive relation - Exercise should be before Read
    expect(exerciseIndex).toBeLessThan(readIndex);
  });
});
