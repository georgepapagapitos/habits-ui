import { HabitCard } from "@habits/components";
import * as HabitsContext from "@habits/hooks/habitContext";
import { Habit, WeekDay } from "@habits/types";
import {
  getNextDueDate,
  isCompletedToday,
  isHabitDueToday,
} from "@habits/utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@tests/utils";
import { addDays, format, subDays } from "date-fns";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Configure testing library to handle portals correctly
import "@testing-library/jest-dom";

vi.mock("@habits/components", async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import("@habits/components")>();

  return {
    ...originalModule,
    HabitCalendar: vi.fn().mockImplementation(({ habit }) => (
      <div data-testid="mock-calendar">
        <div>January 2025</div>
        <div>Calendar mock for {habit.name}</div>
      </div>
    )),
  };
});

vi.mock("@habits/utils", async (importOriginal) => {
  const originalModule = await importOriginal<typeof import("@habits/utils")>();

  return {
    ...originalModule,
    isHabitDueToday: vi.fn().mockImplementation((habit) => {
      const today = new Date();
      const todayIndex = today.getDay();
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const frequencyIndices = habit.frequency
        .map((day: string) => daysOfWeek.indexOf(day.toLowerCase()))
        .filter((index: number) => index !== -1);
      return frequencyIndices.includes(todayIndex);
    }),
    isCompletedToday: vi.fn().mockImplementation((habit) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return habit.completedDates.some((dateStr: string) => {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      });
    }),
    // Add the missing functions that were in the wrong mock
    isCompletedOnDate: vi.fn().mockImplementation((habit, date) => {
      // Check if the date exists in completedDates
      return habit.completedDates.some((dateStr: string) => {
        const completedDate = new Date(dateStr);
        completedDate.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === compareDate.getTime();
      });
    }),
    isHabitDueOnDate: vi.fn().mockImplementation((habit, date) => {
      // Check if the habit is due on the given date based on frequency
      const dayOfWeek = new Date(date).getDay();
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const frequencyIndices = habit.frequency
        .map((day: string) => daysOfWeek.indexOf(day.toLowerCase()))
        .filter((index: number) => index !== -1);
      return frequencyIndices.includes(dayOfWeek);
    }),
    getNextDueDate: vi.fn().mockImplementation(() => {
      // Return a fixed date for testing
      return new Date("2025-01-15");
    }),
    getFrequencyDisplayText: vi.fn().mockImplementation((habit) => {
      if (habit.frequency.length === 7) return "Every day";
      if (habit.frequency.length === 1) return habit.frequency[0].slice(0, 3);
      return "Multiple days";
    }),
    getUserTimezone: vi.fn().mockReturnValue("America/Chicago"),
    normalizeDate: vi.fn().mockImplementation((date) => date),
    dateInUserTimezone: vi.fn().mockImplementation((date) => date),
    celebrationColors: ["#FF5722", "#FFC107", "#4CAF50", "#2196F3", "#9C27B0"],
  };
});

// Mock habits for testing
const createMockHabit = (overrides = {}): Habit => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  return {
    _id: "habit-1",
    name: "Test Habit",
    frequency: ["monday", "wednesday", "friday"] as WeekDay[],
    completedDates: [
      subDays(today, 2).toISOString(),
      subDays(today, 1).toISOString(),
    ],
    color: "blue",
    icon: "leaf",
    timeOfDay: "morning",
    streak: 2,
    active: true,
    createdAt: subDays(today, 10).toISOString(),
    updatedAt: subDays(today, 10).toISOString(),
    startDate: subDays(today, 10).toISOString(),
    ...overrides,
  };
};

// Convert day number to weekday string
const getDayName = (dayNum: number): WeekDay => {
  const days: WeekDay[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[dayNum];
};

// Get today's day of week as a string
const getTodayName = (): WeekDay => {
  return getDayName(new Date().getDay());
};

// Create a habit that is due today
const mockDueHabit = createMockHabit({
  frequency: [getTodayName()], // Set frequency to include today
  completedDates: [], // Make sure it's not completed today
});

// Create a habit that is due in the future
const mockFutureHabit = createMockHabit({
  frequency: [getDayName((new Date().getDay() + 2) % 7)],
});

describe("HabitCard", () => {
  // These handler mocks are now handled through the useHabits context mock
  const toggleHabit = vi.fn();
  const deleteHabit = vi.fn();
  const resetHabit = vi.fn();

  // Mock the useHabits hook
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the useHabits hook to return our mock functions
    vi.spyOn(HabitsContext, "useHabits").mockReturnValue({
      habits: [],
      loading: false,
      error: null,
      messages: [],
      handleAddHabit: vi.fn(),
      toggleHabit: toggleHabit,
      deleteHabit: deleteHabit,
      updateHabit: vi.fn(),
      resetHabit: resetHabit,
      getHabitHistoryForDateRange: vi.fn(),
      getWeeklyReport: vi.fn(),
      refreshHabits: vi.fn(),
      showMessage: vi.fn(),
      clearMessages: vi.fn(),
    });
  });

  test("renders habit name correctly", () => {
    renderWithProviders(<HabitCard habit={mockDueHabit} />);

    expect(screen.getByText("Test Habit")).toBeInTheDocument();
  });

  test("shows correct status text for habits due today", () => {
    renderWithProviders(<HabitCard habit={mockDueHabit} />);

    // For habits due today but not completed, should show "Due today"
    expect(screen.getByText("Due today")).toBeInTheDocument();
  });

  test("shows completed status for completed habits", () => {
    // Create a habit that is due today and completed
    const completedHabit = createMockHabit({
      frequency: [getTodayName()], // Due today
      completedDates: [new Date().toISOString()], // Completed today
    });

    renderWithProviders(<HabitCard habit={completedHabit} />);

    // Should show "Completed today"
    expect(screen.getByText("Completed today")).toBeInTheDocument();
  });

  test("shows bonus completion message for non-due day habits", () => {
    renderWithProviders(<HabitCard habit={mockFutureHabit} />);

    // Get the next due date
    const today = new Date();
    const dayNameToDayNum = (dayName: WeekDay): number => {
      const days: WeekDay[] = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      return days.indexOf(dayName);
    };
    const dueDay = dayNameToDayNum(mockFutureHabit.frequency[0]);
    let nextDue = new Date(today);
    while (nextDue.getDay() !== dueDay) {
      nextDue = addDays(nextDue, 1);
    }

    // Check for the bonus completion message instead of just next due date
    expect(
      screen.getByText((content) => {
        return content.includes(`Next due ${format(nextDue, "MMM d")}`);
      })
    ).toBeInTheDocument();
  });

  test("shows streak count correctly with fire icon for positive streaks", () => {
    // Override isHabitDueToday to return false for this test
    vi.mocked(isHabitDueToday).mockReturnValue(false);

    // Create a habit with a streak
    const streakHabit = createMockHabit({
      streak: 2,
      completedDates: [
        new Date().toISOString(),
        new Date(Date.now() - 86400000).toISOString(), // yesterday
      ],
    });

    renderWithProviders(<HabitCard habit={streakHabit} />);

    // Look for the streak text using data-testid
    const streakElement = screen.getByTestId("streak-text");
    expect(streakElement).toBeInTheDocument();
    expect(streakElement.textContent).toMatch(/streak: 2 days/i);

    // Check that the container includes the fire icon
    const streakContainer = streakElement.parentElement;
    const fireIcon = streakContainer?.querySelector("svg");
    expect(fireIcon).toBeInTheDocument();
  });

  test("shows singular day text for streak of 1", () => {
    const singleStreakHabit = createMockHabit({ streak: 1 });

    renderWithProviders(<HabitCard habit={singleStreakHabit} />);

    const streakElement = screen.getByTestId("streak-text");
    expect(streakElement).toBeInTheDocument();
    expect(streakElement.textContent).toMatch(/streak: 1 day/i);
  });

  test("shows appropriate message for zero streak habit", () => {
    // Override the isHabitDueToday mock for this test
    vi.mocked(isHabitDueToday).mockReturnValue(false);

    // Create a habit with zero streak
    const zeroStreakHabit = createMockHabit({
      streak: 0,
      completedDates: [],
    });

    renderWithProviders(<HabitCard habit={zeroStreakHabit} />);

    const streakElement = screen.getByTestId("streak-text");
    expect(streakElement.textContent).toMatch(/no streak yet/i);
  });

  test("shows continue streak message for habit due today", () => {
    // Mock isHabitDueToday to return true
    vi.mocked(isHabitDueToday).mockReturnValue(true);

    // Create a habit with streak 2
    const streakHabit = createMockHabit({
      streak: 2,
      completedDates: [
        new Date(Date.now() - 86400000).toISOString(), // yesterday
        new Date(Date.now() - 172800000).toISOString(), // day before yesterday
      ],
    });

    renderWithProviders(<HabitCard habit={streakHabit} />);

    const streakElement = screen.getByTestId("streak-text");
    expect(streakElement.textContent).toMatch(
      /continue your 3 day streak today/i
    );
  });

  test("shows streak information for habits with positive streaks", () => {
    const habit = {
      id: "habit-1",
      name: "Test Habit",
      frequency: ["monday", "wednesday", "friday"],
      completedDates: [
        new Date("2024-04-01T00:00:00.000Z"), // Monday
        new Date("2024-04-03T00:00:00.000Z"), // Wednesday
        new Date("2024-04-05T00:00:00.000Z"), // Friday
        new Date("2024-04-08T00:00:00.000Z"), // Monday
        new Date("2024-04-10T00:00:00.000Z"), // Wednesday
      ],
      startDate: new Date("2024-04-01T00:00:00.000Z"),
      description: "Test Description",
      color: "#000000",
      icon: "check",
      timeOfDay: "anytime",
      active: true,
      userId: "test-user",
      userTimezone: "UTC",
      showReward: false,
      streak: 5,
    } as unknown as Habit;

    // Mock isHabitDueToday to return true
    vi.mocked(isHabitDueToday).mockReturnValue(true);
    // Mock isCompletedToday to return false
    vi.mocked(isCompletedToday).mockReturnValue(false);

    renderWithProviders(<HabitCard habit={habit} />);

    // Should show the streak count
    expect(
      screen.getByText(/Continue your 6 day streak today!/i)
    ).toBeInTheDocument();

    // Should have the fire icon (check for the SVG with the fire color)
    const streakContainer = screen.getByTestId("streak-text").parentElement;
    const fireIcon = streakContainer?.querySelector('svg[color="#ff5722"]');
    expect(fireIcon).toBeInTheDocument();
  });

  test("habit with sunday frequency but completed on non-sunday should have zero streak", () => {
    const habit = {
      id: "habit-1",
      name: "Test Habit",
      frequency: ["sunday"],
      completedDates: [
        new Date("2024-04-01T00:00:00.000Z"), // Monday
      ],
      startDate: new Date("2024-04-01T00:00:00.000Z"),
      description: "Test Description",
      color: "#000000",
      icon: "check",
      timeOfDay: "anytime",
      active: true,
      userId: "test-user",
      userTimezone: "UTC",
      showReward: false,
      streak: 0,
    } as unknown as Habit;

    // Mock isHabitDueToday to return false
    vi.mocked(isHabitDueToday).mockReturnValue(false);
    // Mock isCompletedToday to return true
    vi.mocked(isCompletedToday).mockReturnValue(true);

    renderWithProviders(<HabitCard habit={habit} />);

    const streakElement = screen.getByTestId("streak-text");

    // Check that it shows "No streak yet" instead of the streak value
    expect(streakElement.textContent).toMatch(/no streak yet/i);
  });

  test("habit with multiple completions but none on due days should have zero streak", () => {
    const habit = {
      id: "habit-1",
      name: "Test Habit",
      frequency: ["monday", "wednesday", "friday"],
      completedDates: [
        new Date("2024-04-02T00:00:00.000Z"), // Tuesday
        new Date("2024-04-04T00:00:00.000Z"), // Thursday
      ],
      startDate: new Date("2024-04-01T00:00:00.000Z"),
      description: "Test Description",
      color: "#000000",
      icon: "check",
      timeOfDay: "anytime",
      active: true,
      userId: "test-user",
      userTimezone: "UTC",
      showReward: false,
      streak: 0,
    } as unknown as Habit;

    // Mock isHabitDueToday to return false
    vi.mocked(isHabitDueToday).mockReturnValue(false);
    // Mock isCompletedToday to return true
    vi.mocked(isCompletedToday).mockReturnValue(true);

    renderWithProviders(<HabitCard habit={habit} />);

    const streakElement = screen.getByTestId("streak-text");

    // Check that it shows "No streak yet" instead of the streak value
    expect(streakElement.textContent).toMatch(/no streak yet/i);
  });

  test("habit with streak but not due today shows streak count", () => {
    const habit = {
      id: "habit-1",
      name: "Test Habit",
      frequency: ["monday", "wednesday", "friday"],
      completedDates: [
        new Date("2024-04-01T00:00:00.000Z"), // Monday
        new Date("2024-04-03T00:00:00.000Z"), // Wednesday
        new Date("2024-04-05T00:00:00.000Z"), // Friday
      ],
      startDate: new Date("2024-04-01T00:00:00.000Z"),
      description: "Test Description",
      color: "#000000",
      icon: "check",
      timeOfDay: "anytime",
      active: true,
      userId: "test-user",
      userTimezone: "UTC",
      showReward: false,
      streak: 3,
    } as unknown as Habit;

    // Mock isHabitDueToday to return false
    vi.mocked(isHabitDueToday).mockReturnValue(false);
    // Mock isCompletedToday to return false
    vi.mocked(isCompletedToday).mockReturnValue(false);

    renderWithProviders(<HabitCard habit={habit} />);

    const streakElement = screen.getByTestId("streak-text");

    // Check that it shows the streak count
    expect(streakElement.textContent).toMatch(/streak: 3 days/i);
  });

  test("habit with no completions shows start streak message when due today", () => {
    const habit = {
      id: "habit-1",
      name: "Test Habit",
      frequency: ["monday", "wednesday", "friday"],
      completedDates: [],
      startDate: new Date("2024-04-01T00:00:00.000Z"),
      description: "Test Description",
      color: "#000000",
      icon: "check",
      timeOfDay: "anytime",
      active: true,
      userId: "test-user",
      userTimezone: "UTC",
      showReward: false,
      streak: 0,
    } as unknown as Habit;

    // Mock isHabitDueToday to return true
    vi.mocked(isHabitDueToday).mockReturnValue(true);
    // Mock isCompletedToday to return false
    vi.mocked(isCompletedToday).mockReturnValue(false);

    renderWithProviders(<HabitCard habit={habit} />);

    const streakElement = screen.getByTestId("streak-text");

    // Check that it shows the start streak message
    expect(streakElement.textContent).toMatch(/start a streak!/i);
  });

  test("renders completed emoji for completed habit", async () => {
    // Mock isCompletedToday to return true
    vi.mocked(isCompletedToday).mockReturnValue(true);

    const completedHabit = createMockHabit({
      completedDates: [format(new Date(), "yyyy-MM-dd")],
    });

    renderWithProviders(<HabitCard habit={completedHabit} />);

    // Check if the component renders the completed (CheckCircle) icon
    const cardContent = screen.getByText(completedHabit.name).closest("div");
    const checkIcon = cardContent?.querySelector("svg");
    expect(checkIcon).toBeInTheDocument();
  });

  test("renders due emoji for due but uncompleted habit", () => {
    // Mock isHabitDueToday to return true and isCompletedToday to return false
    vi.mocked(isHabitDueToday).mockReturnValue(true);
    vi.mocked(isCompletedToday).mockReturnValue(false);

    renderWithProviders(<HabitCard habit={mockDueHabit} />);

    // Check if the component renders the due (Seedling) icon
    const cardContent = screen.getByText(mockDueHabit.name).closest("div");
    const seedlingIcon = cardContent?.querySelector("svg");
    expect(seedlingIcon).toBeInTheDocument();
  });

  test("renders star emoji for non-due habit", () => {
    // Mock both conditions to return false
    vi.mocked(isHabitDueToday).mockReturnValue(false);
    vi.mocked(isCompletedToday).mockReturnValue(false);

    renderWithProviders(<HabitCard habit={mockFutureHabit} />);

    // Check if the component renders the star (Star) icon
    const cardContent = screen.getByText(mockFutureHabit.name).closest("div");
    const starIcon = cardContent?.querySelector("svg");
    expect(starIcon).toBeInTheDocument();
  });

  test("completing a habit on a non-due day doesn't start a streak from zero", async () => {
    // Create a habit with zero streak that is not due today
    vi.mocked(isHabitDueToday).mockReturnValue(false);
    vi.mocked(isCompletedToday).mockReturnValue(false);

    const zeroStreakNonDueHabit = createMockHabit({
      streak: 0,
      frequency: [getDayName((new Date().getDay() + 2) % 7)], // Not today
      completedDates: [],
    });

    // Reset the toggleHabit mock
    toggleHabit.mockClear();

    renderWithProviders(<HabitCard habit={zeroStreakNonDueHabit} />);

    // Verify initial state shows zero streak
    const streakElement = screen.getByTestId("streak-text");
    expect(streakElement.textContent).toMatch(/no streak/i);

    // Toggle the habit by clicking on it
    const cardContent = screen
      .getByText(zeroStreakNonDueHabit.name)
      .closest("div[class]");
    expect(cardContent).not.toBeNull();

    if (cardContent) {
      // Complete the non-due habit
      await userEvent.click(cardContent);

      // Wait for the animation to complete
      await new Promise((resolve) => setTimeout(resolve, 900));

      // Check that the backend toggleHabit was called
      expect(toggleHabit).toHaveBeenCalled();

      // Verify the streak is still zero - completing a non-due habit shouldn't start a streak
      const updatedStreakElement = screen.getByTestId("streak-text");
      expect(updatedStreakElement.textContent).not.toMatch(/streak: 1/i);
      expect(updatedStreakElement.textContent).toMatch(/no streak/i);
    }
  });
});
