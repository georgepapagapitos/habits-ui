import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { describe, expect, test, vi } from "vitest";
import axios from "axios";
import { Stats } from "./Stats";

// Mock axios
vi.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("Stats Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state initially", () => {
    renderWithProviders(<Stats />);
    expect(screen.getByRole("status")).toBeInTheDocument();
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
      expect(screen.getByText("Total Habits")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("5 days (Running)")).toBeInTheDocument();
      expect(screen.getByText("90% (Meditation)")).toBeInTheDocument();
      expect(screen.getByText("25 times (Reading)")).toBeInTheDocument();
      expect(screen.getByText("Total Completions")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("Average Streak")).toBeInTheDocument();
      expect(screen.getByText("3 days")).toBeInTheDocument();
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
