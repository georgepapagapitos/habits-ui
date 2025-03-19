import { describe, test, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { renderWithProviders } from "../../../tests/utils";

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({ pathname: "/" }),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

// Mock the auth hook - create a real module with a mock implementation
vi.mock("../../../features/auth", () => {
  const mockLogout = vi.fn();
  const mockUseAuth = vi.fn().mockReturnValue({
    isAuthenticated: false,
    user: null,
    logout: mockLogout,
  });

  return {
    useAuth: mockUseAuth,
  };
});

// Mock document.dispatchEvent for screen-change event
const mockDispatchEvent = vi.fn();
document.dispatchEvent = mockDispatchEvent;

describe("Header", () => {
  test("renders the default title when no title is provided", () => {
    renderWithProviders(<Header />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: {
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        clearError: vi.fn(),
      },
    });

    expect(screen.getByText("Habits")).toBeInTheDocument();
  });

  test("renders the provided title", () => {
    renderWithProviders(<Header title="Custom Title" />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: {
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        clearError: vi.fn(),
      },
    });

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  test("menu button is visible when authenticated", async () => {
    renderWithProviders(<Header />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: {
        isAuthenticated: true,
        user: { id: "123", username: "testuser", email: "test@example.com" },
        token: "test-token",
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        clearError: vi.fn(),
      },
    });

    const menuButton = screen.getByRole("button", { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  test("theme selector is always visible", () => {
    renderWithProviders(<Header />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: {
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        clearError: vi.fn(),
      },
    });

    // Check if the menu-trigger that contains the theme selector is in the document
    const themeSelector = screen.getAllByTestId("menu-trigger")[0];
    expect(themeSelector).toBeInTheDocument();
  });

  test("menu is not visible when not authenticated", () => {
    renderWithProviders(<Header />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: {
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        clearError: vi.fn(),
      },
    });

    const menuButton = screen.queryByRole("button", { name: /menu/i });
    expect(menuButton).not.toBeInTheDocument();
  });
});
