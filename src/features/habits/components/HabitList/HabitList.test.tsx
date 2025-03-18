import { HabitList } from "@habits/components";
import * as HabitsContext from "@habits/hooks/habitContext";
import { Habit } from "@habits/types";
import * as habitUtils from "@habits/utils";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { describe, expect, test, vi } from "vitest";

// Mock the utility functions
vi.mock("@habits/utils", () => ({
  isHabitDueToday: vi.fn(),
  isCompletedToday: vi.fn(),
  getNextDueDate: vi.fn(),
}));

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

    // Reset utility mocks to default behavior
    vi.mocked(habitUtils.isHabitDueToday).mockReturnValue(false);
    vi.mocked(habitUtils.isCompletedToday).mockReturnValue(false);
    vi.mocked(habitUtils.getNextDueDate).mockImplementation(() => {
      return new Date();
    });

    renderWithProviders(<HabitList />);

    // Check that all habits are rendered
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Exercise")).toBeInTheDocument();
    expect(screen.getByText("Meditate")).toBeInTheDocument();

    // Check that all habit cards are rendered
    expect(screen.getByTestId("habit-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("habit-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("habit-card-3")).toBeInTheDocument();
  });

  test("sorts habits with due-today-not-completed first", () => {
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

    // Set up the utility mocks for specific sorting behavior
    // Exercise is due today and not completed (should be first)
    vi.mocked(habitUtils.isHabitDueToday).mockImplementation((habit) => {
      return habit._id === "2"; // Only Exercise is due today
    });

    vi.mocked(habitUtils.isCompletedToday).mockImplementation((habit) => {
      return habit._id === "3"; // Only Meditate is completed today
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
        // Meditate is due in 1 day
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
      }
    });

    renderWithProviders(<HabitList />);

    // Get all habit cards in order they appear in the DOM
    const habitCards = screen.getAllByTestId(/^habit-card/);

    // Exercise (due today, not completed) should be first
    expect(habitCards[0]).toHaveTextContent("Exercise");

    // Read (due in 2 days) should be after
    expect(habitCards[1]).toHaveTextContent("Read");

    // Meditate (completed today) should be last
    expect(habitCards[2]).toHaveTextContent("Meditate");
  });

  test("places completed habits at the bottom", () => {
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

    // Get all habit cards in order they appear in the DOM
    const habitCards = screen.getAllByTestId(/^habit-card/);

    // Exercise (not completed) should be first
    expect(habitCards[0]).toHaveTextContent("Exercise");

    // Read and Meditate (both completed) should be at the bottom
    // Get the secondary card texts which should contain the habit names
    const secondCard = habitCards[1];
    const thirdCard = habitCards[2];

    // Make sure completed habits are at the bottom
    const secondAndThirdCardContents = [
      secondCard.textContent || "",
      thirdCard.textContent || "",
    ];

    // Check if either the second or third card contains Read
    const hasRead = secondAndThirdCardContents.some((content) =>
      content.includes("Read")
    );
    // Check if either the second or third card contains Meditate
    const hasMeditate = secondAndThirdCardContents.some((content) =>
      content.includes("Meditate")
    );

    expect(hasRead).toBe(true);
    expect(hasMeditate).toBe(true);
  });

  test("sorts non-due habits by next due date", () => {
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

    // Get all habit cards in order they appear in the DOM
    const habitCards = screen.getAllByTestId(/^habit-card/);

    // Exercise (due in 1 day) should be first
    expect(habitCards[0]).toHaveTextContent("Exercise");

    // Meditate (due in 2 days) should be second
    expect(habitCards[1]).toHaveTextContent("Meditate");

    // Read (due in 3 days) should be last
    expect(habitCards[2]).toHaveTextContent("Read");
  });
});
