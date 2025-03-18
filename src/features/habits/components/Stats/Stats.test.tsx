import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { Stats } from "./Stats";

// Mock axios
vi.mock("axios");
const mockAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  isAxiosError: ReturnType<typeof vi.fn>;
};

describe("Stats Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state initially", () => {
    renderWithProviders(<Stats />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading statistics")).toBeInTheDocument();
  });

  test("renders error message when API call fails", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("API error"));

    renderWithProviders(<Stats />);

    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });
  });

  test("renders stats when API call succeeds", async () => {
    // Mock successful API response
    mockAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          totalHabits: 3,
          longestStreak: { habit: { name: "Running", id: "123" }, streak: 5 },
          mostConsistent: {
            habit: { name: "Meditation", id: "456" },
            percentage: 90,
          },
          mostCompletedHabit: {
            habit: { name: "Reading", id: "789" },
            count: 25,
          },
          totalCompletions: 42,
          averageStreak: 3,
        },
      },
    });

    renderWithProviders(<Stats />);

    await waitFor(() => {
      // Check for header
      expect(screen.getByTestId("stats-header")).toBeInTheDocument();

      // Check container
      expect(screen.getByTestId("stats-container")).toBeInTheDocument();

      // Check each stat card exists
      expect(screen.getByTestId("stat-total-habits")).toBeInTheDocument();
      expect(screen.getByTestId("stat-total-completions")).toBeInTheDocument();
      expect(screen.getByTestId("stat-longest-streak")).toBeInTheDocument();
      expect(screen.getByTestId("stat-most-consistent")).toBeInTheDocument();
      expect(screen.getByTestId("stat-most-completed")).toBeInTheDocument();
      expect(screen.getByTestId("stat-average-streak")).toBeInTheDocument();

      // Check values using data-testid
      expect(screen.getByTestId("total-habits-value")).toHaveTextContent("3");
      expect(screen.getByTestId("total-completions-value")).toHaveTextContent(
        "42"
      );
      expect(screen.getByTestId("longest-streak-value")).toHaveTextContent("5");
      expect(screen.getByTestId("longest-streak-habit")).toHaveTextContent(
        "Running"
      );
      expect(screen.getByTestId("most-consistent-value")).toHaveTextContent(
        "90%"
      );
      expect(screen.getByTestId("most-consistent-habit")).toHaveTextContent(
        "Meditation"
      );
      expect(screen.getByTestId("most-completed-value")).toHaveTextContent(
        "25"
      );
      expect(screen.getByTestId("most-completed-habit")).toHaveTextContent(
        "Reading"
      );
      expect(screen.getByTestId("average-streak-value")).toHaveTextContent("3");

      // Also check the text content for some additional elements
      expect(screen.getByText("Total Habits")).toBeInTheDocument();
      expect(screen.getByText("habits created")).toBeInTheDocument();
      expect(screen.getByText("total check-ins")).toBeInTheDocument();
      expect(screen.getByText("completion")).toBeInTheDocument();
      expect(screen.getByText("times")).toBeInTheDocument();
    });
  });

  test("renders fallback text when no habit data is available", async () => {
    // Mock successful API response but with null values
    mockAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          totalHabits: 0,
          longestStreak: { habit: null, streak: 0 },
          mostConsistent: { habit: null, percentage: 0 },
          mostCompletedHabit: { habit: null, count: 0 },
          totalCompletions: 0,
          averageStreak: 0,
        },
      },
    });

    renderWithProviders(<Stats />);

    await waitFor(() => {
      expect(screen.getByText("No streaks yet")).toBeInTheDocument();
      expect(screen.getByText("No data yet")).toBeInTheDocument();
      expect(screen.getByText("No completions yet")).toBeInTheDocument();
    });
  });

  test("handles authentication errors", async () => {
    // Mock 401 error response
    const errorResponse = {
      response: {
        status: 401,
        data: {
          message: "Not authorized",
        },
      },
    };
    mockAxios.get.mockRejectedValueOnce(errorResponse);
    mockAxios.isAxiosError.mockReturnValueOnce(true);

    renderWithProviders(<Stats />);

    await waitFor(() => {
      expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
    });
  });
});
