import { HabitCalendar } from "@habits/components";
import * as HabitsContext from "@habits/hooks/habitContext";
import { Habit, WeekDay } from "@habits/types";
import { isHabitDueOnDate } from "@habits/utils";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { isSameDay, subDays } from "date-fns";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock the utils functions to avoid timezone issues in tests
vi.mock("@habits/utils", async (importOriginal) => {
  const originalModule = await importOriginal<typeof import("@habits/utils")>();

  return {
    ...originalModule,
    getUserTimezone: vi.fn().mockReturnValue("America/Chicago"),
    normalizeDate: vi.fn().mockImplementation((date) => {
      // Create a new date object with time set to 00:00:00
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    }),
    dateInUserTimezone: vi.fn().mockImplementation((date) => {
      // Just return the date as-is for testing
      return new Date(date);
    }),
    isCompletedOnDate: vi.fn().mockImplementation((habit, date) => {
      // Check if the date exists in completedDates
      if (!date) return false;

      return habit.completedDates.some((dateStr: string) => {
        const completedDate = new Date(dateStr);
        completedDate.setHours(0, 0, 0, 0);
        return isSameDay(completedDate, date);
      });
    }),
    isHabitDueOnDate: vi.fn().mockImplementation((habit, date) => {
      // Check if the habit is due on this day of the week
      const dayOfWeek = date.getDay();
      const dayName = getDayName(dayOfWeek);
      return habit.frequency.includes(dayName);
    }),
  };
});

// Mock the styled components to focus on functionality
vi.mock("./habitCalendar.styles", () => ({
  CalendarContainer: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="calendar-container">{children}</div>
    )),
  CalendarHeader: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="calendar-header">{children}</div>
    )),
  MonthTitle: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="month-title">{children}</div>
    )),
  NavigationButton: vi.fn().mockImplementation(({ children, onClick }) => (
    <button data-testid="nav-button" onClick={onClick}>
      {children}
    </button>
  )),
  CalendarGrid: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="calendar-grid">{children}</div>
    )),
  DayHeader: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="day-header">{children}</div>
    )),
  DateCell: vi.fn().mockImplementation(({ children, onClick, ...props }) => (
    <div
      data-testid="date-cell"
      data-is-completed={props.$isCompleted ? "true" : "false"}
      data-is-due={props.$isDue ? "true" : "false"}
      data-is-today={props.$isToday ? "true" : "false"}
      data-is-past={props.$isPast ? "true" : "false"}
      data-is-future={props.$isFuture ? "true" : "false"}
      data-is-current-month={props.$isCurrentMonth ? "true" : "false"}
      onClick={onClick}
      style={props.style}
    >
      {children}
    </div>
  )),
  Legend: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="legend">{children}</div>
    )),
  LegendItem: vi
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="legend-item">{children}</div>
    )),
  LegendSwatch: vi
    .fn()
    .mockImplementation(({ $color }) => (
      <div data-testid="legend-swatch" data-color={$color}></div>
    )),
}));

// Mock console methods to reduce test noise
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

// Helper function to get weekday name from day number
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

// Helper function to create a test habit
const createMockHabit = (overrides = {}): Habit => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    _id: "habit-calendar-1",
    name: "Test Habit for Calendar",
    frequency: ["monday", "wednesday", "friday"] as WeekDay[],
    completedDates: [
      subDays(today, 7).toISOString(), // Last week
      subDays(today, 2).toISOString(), // Recently
    ],
    color: "blue",
    icon: "leaf",
    timeOfDay: "morning",
    streak: 2,
    active: true,
    createdAt: subDays(today, 30).toISOString(),
    updatedAt: subDays(today, 1).toISOString(),
    startDate: subDays(today, 30).toISOString(),
    ...overrides,
  };
};

describe("HabitCalendar", () => {
  const onToggleDate = vi.fn();
  const toggleHabit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset isHabitDueOnDate mock
    vi.mocked(isHabitDueOnDate).mockImplementation((habit, date) => {
      // Check if the habit is due on this day of the week
      const dayOfWeek: any = date?.getDay();
      const dayName = getDayName(dayOfWeek);
      return habit.frequency.includes(dayName);
    });

    // Mock useHabits hook
    vi.spyOn(HabitsContext, "useHabits").mockReturnValue({
      habits: [],
      loading: false,
      error: null,
      messages: [],
      handleAddHabit: vi.fn(),
      toggleHabit: toggleHabit,
      deleteHabit: vi.fn(),
      updateHabit: vi.fn(),
      resetHabit: vi.fn(),
      getHabitHistoryForDateRange: vi.fn(),
      getWeeklyReport: vi.fn(),
      refreshHabits: vi.fn(),
      showMessage: vi.fn(),
      clearMessages: vi.fn(),
    });
  });

  test("renders the calendar with month title", () => {
    const mockHabit = createMockHabit();

    renderWithProviders(
      <HabitCalendar habit={mockHabit} onToggleDate={onToggleDate} />
    );

    // Check that month title element exists
    expect(screen.getByTestId("month-title")).toBeInTheDocument();
  });

  test("renders all seven day headers", () => {
    const mockHabit = createMockHabit();

    renderWithProviders(
      <HabitCalendar habit={mockHabit} onToggleDate={onToggleDate} />
    );

    // Check that all seven day headers are present
    const dayHeaders = screen.getAllByTestId("day-header");
    expect(dayHeaders).toHaveLength(7);

    // Verify the day names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayHeaders.forEach((header, index) => {
      expect(header.textContent).toBe(dayNames[index]);
    });
  });

  test("renders date cells for the calendar", () => {
    const mockHabit = createMockHabit();

    renderWithProviders(
      <HabitCalendar habit={mockHabit} onToggleDate={onToggleDate} />
    );

    // Get all date cells
    const dateCells = screen.getAllByTestId("date-cell");

    // Calendar should have cells (usually 42 = 6 rows * 7 columns)
    expect(dateCells.length).toBeGreaterThan(28); // At least 4 weeks worth
  });

  test("has cells marked with different states", () => {
    const mockHabit = createMockHabit();

    renderWithProviders(
      <HabitCalendar habit={mockHabit} onToggleDate={onToggleDate} />
    );

    // Get all date cells
    const dateCells = screen.getAllByTestId("date-cell");

    // Check that we have cells with different states
    expect(
      dateCells.some(
        (cell) => cell.getAttribute("data-is-current-month") === "true"
      )
    ).toBe(true);
    expect(
      dateCells.some(
        (cell) => cell.getAttribute("data-is-current-month") === "false"
      )
    ).toBe(true);
  });

  test("has navigation buttons", () => {
    const mockHabit = createMockHabit();

    renderWithProviders(
      <HabitCalendar habit={mockHabit} onToggleDate={onToggleDate} />
    );

    // Get the navigation buttons
    const navButtons = screen.getAllByTestId("nav-button");
    expect(navButtons).toHaveLength(2);

    // Check that we have prev/next buttons
    expect(navButtons[0].textContent).toBe("←");
    expect(navButtons[1].textContent).toBe("→");
  });
});
