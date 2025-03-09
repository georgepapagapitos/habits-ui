import { HabitCard } from "@habits/components";
import { Habit, WeekDay } from "@habits/types";
import { isCompletedToday, isHabitDueToday } from "@habits/utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@tests/utils";
import { addDays, format, subDays } from "date-fns";
import { beforeEach, describe, expect, test, vi } from "vitest";

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
      const todayName = getTodayName();
      return habit.frequency.includes(todayName);
    }),
    isCompletedToday: vi.fn().mockImplementation((habit) => {
      // A habit is completed if it has today's date in completedDates
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
      const dayName = getDayName(dayOfWeek);
      return habit.frequency.includes(dayName);
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
  // Mock handlers
  const onToggleHabit = vi.fn();
  const onDelete = vi.fn();
  const onEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders habit name correctly", () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    expect(screen.getByText("Test Habit")).toBeInTheDocument();
  });

  test("shows correct status text for habits due today", () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    // For habits due today but not completed, should show "Due today"
    expect(screen.getByText("Due today")).toBeInTheDocument();
  });

  test("shows completed status for completed habits", () => {
    // Create a habit that is due today and completed
    const completedHabit = createMockHabit({
      frequency: [getTodayName()], // Due today
      completedDates: [new Date().toISOString()], // Completed today
    });

    renderWithProviders(
      <HabitCard habit={completedHabit} onToggleHabit={onToggleHabit} />
    );

    // Should show "Completed today"
    expect(screen.getByText("Completed today")).toBeInTheDocument();
  });

  test("shows bonus completion message for non-due day habits", () => {
    renderWithProviders(
      <HabitCard habit={mockFutureHabit} onToggleHabit={onToggleHabit} />
    );

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
      screen.getByText((content, element) => {
        return content.includes(`Next due ${format(nextDue, "MMM d")}`);
      })
    ).toBeInTheDocument();
  });

  test("shows streak count correctly with fire emoji for positive streaks", () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    // Look for the combined text within the streak display element
    const streakElement = screen.getByText(/streak: 2 days/i);
    expect(streakElement).toBeInTheDocument();

    // Check that the container includes the fire emoji
    const streakContainer = streakElement.parentElement;
    expect(streakContainer?.textContent).toContain("🔥");
  });

  test("shows singular day text for streak of 1", () => {
    const singleStreakHabit = createMockHabit({ streak: 1 });

    renderWithProviders(
      <HabitCard habit={singleStreakHabit} onToggleHabit={onToggleHabit} />
    );

    expect(screen.getByText(/streak: 1 day/i)).toBeInTheDocument();
  });

  test("shows motivational message for zero streak with no completed dates", () => {
    // Create a habit with streak 0 and no completed dates
    const zeroStreakHabit = createMockHabit({
      streak: 0,
      completedDates: [], // Empty completed dates
    });

    renderWithProviders(
      <HabitCard habit={zeroStreakHabit} onToggleHabit={onToggleHabit} />
    );

    // Update test to match "No current streak" message for non-due habits
    expect(screen.getByText("No current streak")).toBeInTheDocument();
  });

  test("shows continue streak message for habit completed yesterday", () => {
    // Mock isHabitDueToday to return true
    vi.mocked(isHabitDueToday).mockReturnValue(true);

    // Create today and yesterday dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Create a habit with streak 0 but completed yesterday
    const completedYesterdayHabit = createMockHabit({
      streak: 0,
      completedDates: [yesterday.toISOString()],
      frequency: [getTodayName()], // Due today
    });

    renderWithProviders(
      <HabitCard
        habit={completedYesterdayHabit}
        onToggleHabit={onToggleHabit}
      />
    );

    expect(screen.getByText("Continue your streak today!")).toBeInTheDocument();
  });

  test("calls onToggleHabit when clicking on a due habit", async () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    // Find the card content that contains the habit name
    const cardContent = screen.getByText("Test Habit").closest("div[class]");

    expect(cardContent).not.toBeNull();
    if (cardContent) {
      await userEvent.click(cardContent);
      expect(onToggleHabit).toHaveBeenCalledWith("habit-1");
    }
  });

  test("allows toggling non-due habits too", async () => {
    // Reset mock and ensure isHabitDueToday returns false for future habits
    vi.clearAllMocks();
    vi.mocked(isHabitDueToday).mockReturnValue(false);

    // Create a habit that's definitely not due today
    const notDueHabit = createMockHabit({
      frequency: ["not-a-real-day" as WeekDay], // Not due on any day
      completedDates: [], // No completed dates
      streak: 0,
    });

    renderWithProviders(
      <HabitCard habit={notDueHabit} onToggleHabit={onToggleHabit} />
    );

    const cardContent = screen.getByText("Test Habit").closest("div[class]");

    expect(cardContent).not.toBeNull();
    if (cardContent) {
      await userEvent.click(cardContent);
      // With our changes, onToggleHabit should now be called for non-due habits too
      expect(onToggleHabit).toHaveBeenCalledWith("habit-1");
    }
  });

  test("allows toggling completed habits", async () => {
    // Create a habit that is due today and completed
    const completedHabit = createMockHabit({
      frequency: [getTodayName()], // Due today
      completedDates: [new Date().toISOString()], // Completed today
    });

    renderWithProviders(
      <HabitCard habit={completedHabit} onToggleHabit={onToggleHabit} />
    );

    const cardContent = screen.getByText("Test Habit").closest("div[class]");

    expect(cardContent).not.toBeNull();
    if (cardContent) {
      await userEvent.click(cardContent);
      expect(onToggleHabit).toHaveBeenCalledWith("habit-1");
    }
  });

  test("toggles calendar visibility when show/hide button is clicked", async () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    // Calendar should not be visible initially
    expect(
      screen.queryByText(
        /January|February|March|April|May|June|July|August|September|October|November|December/
      )
    ).not.toBeInTheDocument();

    // Click the show history button
    await userEvent.click(
      screen.getByRole("button", { name: /Show History/i })
    );

    // Calendar should now be visible
    // Check for month heading which indicates calendar is visible
    expect(
      screen.getByText(
        /January|February|March|April|May|June|July|August|September|October|November|December/
      )
    ).toBeInTheDocument();

    // The button text should have changed
    expect(
      screen.getByRole("button", { name: /Hide History/i })
    ).toBeInTheDocument();

    // Click the hide history button
    await userEvent.click(
      screen.getByRole("button", { name: /Hide History/i })
    );

    // Calendar should be hidden again
    expect(
      screen.queryByText(
        /January|February|March|April|May|June|July|August|September|October|November|December/
      )
    ).not.toBeInTheDocument();
  });

  test("opens menu when menu button is clicked", async () => {
    renderWithProviders(
      <HabitCard
        habit={mockDueHabit}
        onToggleHabit={onToggleHabit}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Menu should not be visible initially
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();

    // Click the menu button
    await userEvent.click(screen.getByRole("button", { name: "Options" }));

    // Menu should now be visible
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("calls onEdit when edit menu item is clicked", async () => {
    renderWithProviders(
      <HabitCard
        habit={mockDueHabit}
        onToggleHabit={onToggleHabit}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Open the menu
    await userEvent.click(screen.getByRole("button", { name: "Options" }));

    // Click the edit option
    await userEvent.click(screen.getByText("Edit"));

    expect(onEdit).toHaveBeenCalledWith("habit-1");
  });

  test("shows delete confirmation dialog when delete menu item is clicked", async () => {
    renderWithProviders(
      <HabitCard
        habit={mockDueHabit}
        onToggleHabit={onToggleHabit}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Open the menu
    await userEvent.click(screen.getByRole("button", { name: "Options" }));

    // Click the delete option
    await userEvent.click(screen.getByText("Delete"));

    // Confirmation dialog should appear
    expect(
      screen.getByText('Are you sure you want to delete "Test Habit"?')
    ).toBeInTheDocument();
    expect(
      screen.getByText("This action cannot be undone.")
    ).toBeInTheDocument();
  });

  test("calls onDelete when delete is confirmed", async () => {
    renderWithProviders(
      <HabitCard
        habit={mockDueHabit}
        onToggleHabit={onToggleHabit}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Open the menu and click delete
    await userEvent.click(screen.getByRole("button", { name: "Options" }));
    await userEvent.click(screen.getByText("Delete"));

    // Confirm delete
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith("habit-1");
  });

  test("cancels delete when cancel button is clicked", async () => {
    renderWithProviders(
      <HabitCard
        habit={mockDueHabit}
        onToggleHabit={onToggleHabit}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Open the menu and click delete
    await userEvent.click(screen.getByRole("button", { name: "Options" }));
    await userEvent.click(screen.getByText("Delete"));

    // Click cancel
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Dialog should be closed
    expect(
      screen.queryByText('Are you sure you want to delete "Test Habit"?')
    ).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("shows streak information for habits with positive streaks", () => {
    // Create a habit with a streak
    const streakHabit = createMockHabit({
      streak: 5, // Has a streak
    });

    renderWithProviders(
      <HabitCard habit={streakHabit} onToggleHabit={onToggleHabit} />
    );

    // Should show the streak count
    expect(screen.getByText(/streak: 5 days/i)).toBeInTheDocument();

    // Should have the fire emoji
    const streakElement = screen.getByText(/streak: 5 days/i);
    const container = streakElement.parentElement;
    expect(container?.textContent).toContain("🔥");
  });

  test("shows correct streak message for last completed habit", () => {
    // Set up mocks
    vi.mocked(isHabitDueToday).mockReturnValue(true);
    vi.mocked(isCompletedToday).mockReturnValue(false);

    // Create a habit with yesterday's completion but no streak (backend resets it)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const completedYesterdayHabit = createMockHabit({
      frequency: [getTodayName()], // Due today
      completedDates: [yesterday.toISOString()], // Completed yesterday but not today
      streak: 0, // Streak reset by backend
    });

    renderWithProviders(
      <HabitCard
        habit={completedYesterdayHabit}
        onToggleHabit={onToggleHabit}
      />
    );

    const streakElements = screen.getAllByText(/streak|continue/i);
    expect(streakElements.length).toBeGreaterThan(0);
    expect(
      streakElements.some((el) =>
        el.textContent?.toLowerCase().includes("continue")
      )
    ).toBe(true);
  });

  test("non-due habits display correct visual indicator and message", () => {
    // Create a habit that is not due today
    vi.mocked(isHabitDueToday).mockReturnValue(false);
    vi.mocked(isCompletedToday).mockReturnValue(false);

    renderWithProviders(
      <HabitCard habit={mockFutureHabit} onToggleHabit={onToggleHabit} />
    );

    // Check if the component renders the star (🌟) emoji for non-due habits
    const cardContent = screen.getByText("Test Habit").closest("div[class]");
    expect(cardContent?.textContent).toContain("🌟");
  });

  test("completed habits display correct visual indicator", () => {
    // Create a habit that is completed today
    vi.mocked(isHabitDueToday).mockReturnValue(true);
    vi.mocked(isCompletedToday).mockReturnValue(true);

    const completedHabit = createMockHabit({
      frequency: [getTodayName()],
      completedDates: [new Date().toISOString()],
    });

    renderWithProviders(
      <HabitCard habit={completedHabit} onToggleHabit={onToggleHabit} />
    );

    // Check if the component renders the completed (🌻) emoji
    const cardContent = screen.getByText("Test Habit").closest("div[class]");
    expect(cardContent?.textContent).toContain("🌻");
  });

  test("due but not completed habits display correct visual indicator", () => {
    // Create a habit that is due today but not completed
    vi.mocked(isHabitDueToday).mockReturnValue(true);
    vi.mocked(isCompletedToday).mockReturnValue(false);

    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    // Check if the component renders the due (🌱) emoji
    const cardContent = screen.getByText("Test Habit").closest("div[class]");
    expect(cardContent?.textContent).toContain("🌱");
  });
});
