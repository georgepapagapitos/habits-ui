import { HabitList } from "@habits/components";
import { Habit } from "@habits/types";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { describe, expect, test, vi } from "vitest";

// Mock the HabitCard component to simplify testing
vi.mock("../HabitCard", () => ({
  HabitCard: ({
    habit,
    onToggleHabit,
    onDelete,
    onEdit,
  }: {
    habit: Habit;
    onToggleHabit: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
  }) => (
    <div data-testid={`habit-card-${habit._id}`}>
      <h3>{habit.name}</h3>
      <button onClick={() => onToggleHabit(habit._id)}>Toggle</button>
      {onEdit && <button onClick={() => onEdit(habit._id)}>Edit</button>}
      {onDelete && <button onClick={() => onDelete(habit._id)}>Delete</button>}
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
  const mockToggleDate = vi.fn();
  const mockDeleteHabit = vi.fn();
  const mockEditHabit = vi.fn();

  test("renders loading state", () => {
    renderWithProviders(
      <HabitList habits={[]} onToggleHabit={mockToggleHabit} loading={true} />
    );

    expect(screen.getByText("Loading habits...")).toBeInTheDocument();
  });

  test("renders error state", () => {
    renderWithProviders(
      <HabitList
        habits={[]}
        onToggleHabit={mockToggleHabit}
        error="Failed to load habits"
      />
    );

    expect(
      screen.getByText("Error: Failed to load habits")
    ).toBeInTheDocument();
    expect(screen.getByText("Please try again later.")).toBeInTheDocument();
  });

  test("renders empty state", () => {
    renderWithProviders(
      <HabitList habits={[]} onToggleHabit={mockToggleHabit} />
    );

    expect(
      screen.getByText("You don't have any habits yet!")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add your first habit using the button below.")
    ).toBeInTheDocument();
  });

  test("renders list of habits", () => {
    renderWithProviders(
      <HabitList
        habits={mockHabits}
        onToggleHabit={mockToggleHabit}
        onToggleDate={mockToggleDate}
        onDeleteHabit={mockDeleteHabit}
        onEditHabit={mockEditHabit}
      />
    );

    // Check that both habits are rendered
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Exercise")).toBeInTheDocument();

    // Check that all habit cards are rendered
    expect(screen.getByTestId("habit-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("habit-card-2")).toBeInTheDocument();
  });
});
