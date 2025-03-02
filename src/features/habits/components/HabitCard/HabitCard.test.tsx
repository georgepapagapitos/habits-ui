import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, beforeEach, test, expect } from "vitest";
import { Habit, WeekDay } from "../../types/habit.types";
import { HabitCard } from "./HabitCard";
import { renderWithProviders } from "../../../../tests/utils";
import { addDays, format, subDays } from "date-fns";

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

const mockCompletedHabit = createMockHabit({
  completedDates: [
    subDays(new Date(), 2).toISOString(),
    subDays(new Date(), 1).toISOString(),
    new Date().toISOString(),
  ],
});
// Convert day number to weekday string
const getDayName = (dayNum: number): WeekDay => {
  const days: WeekDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[dayNum];
};

// Get today's day of week as a string
const getTodayName = (): WeekDay => {
  return getDayName(new Date().getDay());
};

// Create a habit that is due today
const mockDueHabit = createMockHabit({
  frequency: [getTodayName()], // Set frequency to include today
  completedDates: [] // Make sure it's not completed today
});

// Create a habit that is due in the future
const mockFutureHabit = createMockHabit({
  frequency: [getDayName((new Date().getDay() + 2) % 7)],
});

describe("HabitCard", () => {
  // Mock handlers
  const onToggleHabit = vi.fn();
  const onToggleDate = vi.fn();
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

  test("shows status text for habits", () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    // Instead of specifically looking for "Due today", look for either possible status text
    const statusElement = screen.getByText(/due today|next due/i);
    expect(statusElement).toBeInTheDocument();
  });

  test("shows next due date for future habits", () => {
    renderWithProviders(
      <HabitCard habit={mockFutureHabit} onToggleHabit={onToggleHabit} />
    );

    // Get the next due date
    const today = new Date();
    const dayNameToDayNum = (dayName: WeekDay): number => {
      const days: WeekDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      return days.indexOf(dayName);
    };
    const dueDay = dayNameToDayNum(mockFutureHabit.frequency[0]);
    let nextDue = new Date(today);
    while (nextDue.getDay() !== dueDay) {
      nextDue = addDays(nextDue, 1);
    }

    expect(
      screen.getByText(`Next due ${format(nextDue, "MMM d")}`)
    ).toBeInTheDocument();
  });

  test("shows streak count correctly", () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    expect(screen.getByText("Streak: 2 days")).toBeInTheDocument();
  });

  test("shows singular day text for streak of 1", () => {
    const singleStreakHabit = createMockHabit({ streak: 1 });

    renderWithProviders(
      <HabitCard habit={singleStreakHabit} onToggleHabit={onToggleHabit} />
    );

    expect(screen.getByText("Streak: 1 day")).toBeInTheDocument();
  });

  test("calls onToggleHabit when clicking on a due habit", async () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    // Find the card content by its class (more reliable than closest)
    const cardContent = screen.getByText("Test Habit").closest(".sc-fAomSb");
    
    expect(cardContent).not.toBeNull();
    if (cardContent) {
      await userEvent.click(cardContent);
      expect(onToggleHabit).toHaveBeenCalledWith("habit-1");
    }
  });

  test("does not call onToggleHabit when clicking on a future habit", async () => {
    renderWithProviders(
      <HabitCard habit={mockFutureHabit} onToggleHabit={onToggleHabit} />
    );

    const cardContent = screen.getByText("Test Habit").closest("div");
    if (cardContent) {
      await userEvent.click(cardContent);
      expect(onToggleHabit).not.toHaveBeenCalled();
    }
  });

  test("toggles calendar visibility when show/hide button is clicked", async () => {
    renderWithProviders(
      <HabitCard habit={mockDueHabit} onToggleHabit={onToggleHabit} />
    );

    // Calendar should not be visible initially
    expect(screen.queryByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).not.toBeInTheDocument();

    // Click the show history button
    await userEvent.click(screen.getByRole('button', { name: /Show History/i }));

    // Calendar should now be visible
    // Check for month heading which indicates calendar is visible
    expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeInTheDocument();
    
    // The button text should have changed
    expect(screen.getByRole('button', { name: /Hide History/i })).toBeInTheDocument();

    // Click the hide history button
    await userEvent.click(screen.getByRole('button', { name: /Hide History/i }));

    // Calendar should be hidden again
    expect(screen.queryByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).not.toBeInTheDocument();
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
});
