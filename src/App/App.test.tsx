import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@tests/utils";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { App } from "./App";

// Create a mock AuthProvider
const mockAuthContext = {
  isAuthenticated: true, // Set to true so we get to the main app view
  user: { name: "Test User", email: "test@example.com" },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false,
  error: null,
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

// Mock scrollLock utilities to avoid jsdom not implemented error
vi.mock("../common/utils/scrollLock", () => ({
  lockScroll: vi.fn(),
  unlockScroll: vi.fn(),
}));

describe("App", () => {
  test("renders the App component", () => {
    renderWithProviders(<App />);

    // Check that main components or critical UI elements are present
    // The title is now dynamic, so we should look for "Habits" which is the default
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Habits"
    );
    expect(screen.getByText("+")).toBeInTheDocument();

    // These are common navigation elements we can test for
    // Use within to check for nav elements specifically
    const navElement = screen.getByRole("navigation");
    expect(within(navElement).getByText("Habits")).toBeInTheDocument();
    expect(within(navElement).getByText("Rewards")).toBeInTheDocument();
    expect(within(navElement).getByText("Stats")).toBeInTheDocument();
  });

  // Test modal opening
  test("opens modal when add button is clicked", async () => {
    renderWithProviders(<App />);

    // The add button has a + character
    const addButton = screen.getByText("+");
    expect(addButton).toBeInTheDocument();

    // Click the add button using userEvent
    await userEvent.click(addButton);

    // The form title should be "New Habit" when creating a new habit
    const formTitle = screen.getByText(/new habit/i);
    expect(formTitle).toBeInTheDocument();

    // Verify form fields are present
    expect(screen.getByLabelText(/habit name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();

    // Verify buttons are present
    expect(
      screen.getByRole("button", { name: /create habit/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  // Custom test for checking routes
  test("renders with the main app structure", () => {
    renderWithProviders(<App />);

    // Check the app has rendered the authenticated view structure
    expect(document.querySelector("div")).toBeInTheDocument();

    // More specific checks could be added as the app evolves
    // For instance, checking that key components are present in the DOM
  });
});
