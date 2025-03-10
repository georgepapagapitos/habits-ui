import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { describe, expect, test, vi } from "vitest";
import { BottomNav } from "./BottomNav";

describe("BottomNav", () => {
  test("renders navigation items", () => {
    const mockOnScreenChange = vi.fn();
    renderWithProviders(
      <BottomNav activeScreen="habits" onScreenChange={mockOnScreenChange} />
    );

    // Check that all navigation items are rendered
    expect(screen.getByText("Habits")).toBeInTheDocument();
    expect(screen.getByText("Rewards")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
  });

  test("highlights active screen", () => {
    const mockOnScreenChange = vi.fn();
    const { rerender } = renderWithProviders(
      <BottomNav activeScreen="habits" onScreenChange={mockOnScreenChange} />
    );

    // Get the nav items
    const habitsButton = screen.getByText("Habits").closest("button");
    const rewardsButton = screen.getByText("Rewards").closest("button");
    const statsButton = screen.getByText("Stats").closest("button");

    // Instead of checking class names which are dynamically generated,
    // we can use a different approach to verify active state

    // The active Habits button should have a different class than the inactive buttons
    expect(habitsButton?.className).not.toEqual(rewardsButton?.className);
    expect(habitsButton?.className).not.toEqual(statsButton?.className);
    expect(rewardsButton?.className).toEqual(statsButton?.className);

    // Rerender with different active screen
    rerender(
      <BottomNav activeScreen="stats" onScreenChange={mockOnScreenChange} />
    );

    // Now Stats should have a different class than the other buttons
    expect(statsButton?.className).not.toEqual(habitsButton?.className);
    expect(statsButton?.className).not.toEqual(rewardsButton?.className);
    expect(habitsButton?.className).toEqual(rewardsButton?.className);
  });

  test("calls onScreenChange when a nav item is clicked", () => {
    const mockOnScreenChange = vi.fn();
    renderWithProviders(
      <BottomNav activeScreen="habits" onScreenChange={mockOnScreenChange} />
    );

    // Click on the Stats nav item
    fireEvent.click(screen.getByText("Stats"));

    // Check that onScreenChange was called with 'stats'
    expect(mockOnScreenChange).toHaveBeenCalledWith("stats");

    // Click on the Rewards nav item
    fireEvent.click(screen.getByText("Rewards"));

    // Check that onScreenChange was called with 'rewards'
    expect(mockOnScreenChange).toHaveBeenCalledWith("rewards");
  });
});
