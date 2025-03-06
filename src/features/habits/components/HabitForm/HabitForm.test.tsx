import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { renderWithProviders } from "@tests/utils";
import { TimeOfDay, WeekDay } from "@habits/types";
import { HabitForm } from "@habits/components";

describe("HabitForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders create form with default values", () => {
    renderWithProviders(
      <HabitForm onSubmit={mockOnSubmit} onClose={mockOnClose} />
    );

    // Check title and button text
    expect(screen.getByText("New Habit")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Habit" })
    ).toBeInTheDocument();

    // Check default frequency is set to daily
    const frequencySelect = screen.getByRole("combobox", {
      name: /frequency/i,
    });
    expect(frequencySelect).toHaveValue("daily");
  });

  test("renders edit form with initial data", () => {
    const initialData = {
      name: "Test Habit",
      frequency: ["monday", "wednesday", "friday"] as WeekDay[],
      description: "Test description",
      timeOfDay: "morning" as TimeOfDay,
    };

    renderWithProviders(
      <HabitForm
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        initialData={initialData}
        isEditing={true}
      />
    );

    // Check title and button text for edit mode
    expect(screen.getByText("Edit Habit")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update Habit" })
    ).toBeInTheDocument();

    // Check initial values are set
    expect(screen.getByRole("textbox", { name: /habit name/i })).toHaveValue(
      "Test Habit"
    );
    expect(screen.getByRole("textbox", { name: /description/i })).toHaveValue(
      "Test description"
    );

    // Check frequency is detected as weekly based on the provided days
    expect(screen.getByRole("combobox", { name: /frequency/i })).toHaveValue(
      "weekly"
    );

    // Check time of day is set
    expect(screen.getByRole("combobox", { name: /time of day/i })).toHaveValue(
      "morning"
    );
  });

  test("submits form with correct values", async () => {
    renderWithProviders(
      <HabitForm onSubmit={mockOnSubmit} onClose={mockOnClose} />
    );

    // Fill in the form
    await userEvent.type(
      screen.getByRole("textbox", { name: /habit name/i }),
      "New Test Habit"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /description/i }),
      "New description"
    );

    // Change time of day
    fireEvent.change(screen.getByRole("combobox", { name: /time of day/i }), {
      target: { value: "evening" },
    });

    // Submit the form
    await userEvent.click(screen.getByRole("button", { name: "Create Habit" }));

    // Check if onSubmit was called with the correct data
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: "New Test Habit",
      description: "New description",
      timeOfDay: "evening",
      frequency: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
    });
  });

  test("cancels form when cancel button is clicked", async () => {
    renderWithProviders(
      <HabitForm onSubmit={mockOnSubmit} onClose={mockOnClose} />
    );

    // Click the cancel button
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
    // Check that onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
