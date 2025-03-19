import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@tests/utils";
import React from "react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { App } from "./App";

// Create a mock AuthProvider
const mockAuthContext = {
  isAuthenticated: true, // Set to true so we get to the main app view
  user: { id: "123", username: "Test User", email: "test@example.com" },
  token: "test-token",
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  clearError: vi.fn(),
};

// Create a mock rewards object
const mockRewards = {
  rewards: {},
  addReward: vi.fn(),
  batchAddRewards: vi.fn(),
  removeReward: vi.fn(),
  getReward: vi.fn(),
  hasRewardForToday: vi.fn(),
  clearExpiredRewards: vi.fn(),
  isRewardsLoaded: true,
};

// Mock the auth hook
vi.mock("../features/auth/hooks/useAuth", () => ({
  useAuth: () => mockAuthContext,
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({ pathname: "/" }),
    useNavigate: () => vi.fn(),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

// Mock the habits hooks
vi.mock("../features/habits/hooks/useHabitManager", () => ({
  useHabitManager: () => ({
    habits: [
      {
        _id: "habit-1",
        name: "Test Habit",
        frequency: ["monday", "wednesday", "friday"],
        completedDates: [],
        color: "blue",
        icon: "leaf",
        timeOfDay: "morning",
        streak: 2,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startDate: new Date().toISOString(),
        userId: "user-1",
      },
    ],
    loading: false,
    error: null,
    messages: [],
    currentMessage: "",
    showMessage: false,
    handleAddHabit: vi.fn(),
    toggleHabit: vi.fn(),
    deleteHabit: vi.fn(),
    updateHabit: vi.fn(),
    refreshHabits: vi.fn(),
  }),
}));

// Mock rewards hook with empty rewards by default
const useRewardsMock = vi.fn().mockReturnValue(mockRewards);

vi.mock("../features/habits/hooks/rewardContext", () => ({
  useRewards: () => useRewardsMock(),
  RewardProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock scrollLock utilities to avoid jsdom not implemented error
vi.mock("../common/utils/scrollLock", () => ({
  lockScroll: vi.fn(),
  unlockScroll: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    // Reset mocks before each test
    useRewardsMock.mockReturnValue(mockRewards);
  });

  test("renders the App component", () => {
    renderWithProviders(<App />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: mockAuthContext,
    });

    // Check that main components or critical UI elements are present
    expect(screen.getByRole("heading", { name: "Habits" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add habit/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Habits")).toHaveLength(2); // header and nav
    expect(screen.getByText("Rewards")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
  });

  test("opens modal when add button is clicked", async () => {
    renderWithProviders(<App />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: mockAuthContext,
    });

    const addButton = screen.getByRole("button", { name: /add habit/i });
    expect(addButton).toBeInTheDocument();

    await userEvent.click(addButton);

    const formTitle = screen.getByText(/new habit/i);
    expect(formTitle).toBeInTheDocument();

    expect(screen.getByLabelText(/habit name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /create habit/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  test("renders with the main app structure", () => {
    renderWithProviders(<App />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: mockAuthContext,
    });

    expect(document.querySelector("div")).toBeInTheDocument();
  });

  test("displays rewards count when available", () => {
    useRewardsMock.mockReturnValue({
      ...mockRewards,
      rewards: {
        "habit-1": { url: "test-url" },
        "habit-2": { url: "test-url-2" },
      },
    });

    renderWithProviders(<App />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: mockAuthContext,
    });

    expect(screen.getByText("Rewards (2)")).toBeInTheDocument();
  });
});
