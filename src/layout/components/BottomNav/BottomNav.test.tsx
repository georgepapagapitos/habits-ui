import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { describe, expect, test, vi } from "vitest";
import { BottomNav } from "./BottomNav";

describe("BottomNav", () => {
  test("renders navigation items", () => {
    const mockOnScreenChange = vi.fn();
    renderWithProviders(
      <BottomNav activeScreen="today" onScreenChange={mockOnScreenChange} />
    );

    // Check that all navigation items are rendered
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
  });

  test("highlights active screen", () => {
    const mockOnScreenChange = vi.fn();
    const { rerender } = renderWithProviders(
      <BottomNav activeScreen="today" onScreenChange={mockOnScreenChange} />
    );

    // Get the nav items
    const todayButton = screen.getByText("Today").closest("button");
    const weeklyButton = screen.getByText("Weekly").closest("button");
    const statsButton = screen.getByText("Stats").closest("button");

    // Instead of checking class names which are dynamically generated,
    // we can use a different approach to verify active state

    // The active Today button should have a different class than the inactive buttons
    expect(todayButton?.className).not.toEqual(weeklyButton?.className);
    expect(todayButton?.className).not.toEqual(statsButton?.className);
    expect(weeklyButton?.className).toEqual(statsButton?.className);

    // Rerender with different active screen
    rerender(
      <BottomNav activeScreen="stats" onScreenChange={mockOnScreenChange} />
    );

    // Now Stats should have a different class than the other buttons
    expect(statsButton?.className).not.toEqual(todayButton?.className);
    expect(statsButton?.className).not.toEqual(weeklyButton?.className);
    expect(todayButton?.className).toEqual(weeklyButton?.className);
  });

  test("calls onScreenChange when a nav item is clicked", () => {
    const mockOnScreenChange = vi.fn();
    renderWithProviders(
      <BottomNav activeScreen="today" onScreenChange={mockOnScreenChange} />
    );

    // Click on the Stats nav item
    fireEvent.click(screen.getByText("Stats"));

    // Check that onScreenChange was called with 'stats'
    expect(mockOnScreenChange).toHaveBeenCalledWith("stats");

    // Click on the Weekly nav item
    fireEvent.click(screen.getByText("Weekly"));

    // Check that onScreenChange was called with 'weekly'
    expect(mockOnScreenChange).toHaveBeenCalledWith("weekly");
  });
});
