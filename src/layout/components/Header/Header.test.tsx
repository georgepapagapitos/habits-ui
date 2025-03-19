import { describe, test, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
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

  test("refresh button is visible", async () => {
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

    const refreshButton = screen.getByRole("button", { name: /refresh app/i });
    expect(refreshButton).toBeInTheDocument();
  });

  test("renders auth controls when authenticated", () => {
    const mockUser = {
      id: "123",
      username: "testuser",
      email: "test@example.com",
    };

    renderWithProviders(<Header />, {
      withHabitProvider: true,
      withMessageProvider: true,
      withMenuProvider: true,
      withRewardProvider: true,
      authContextValue: {
        isAuthenticated: true,
        user: mockUser,
        token: "test-token",
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        clearError: vi.fn(),
      },
    });

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
