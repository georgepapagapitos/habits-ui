import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { vi } from "vitest";
import theme from "../common/theme";
import { AuthContext } from "../features/auth/hooks/authContext";
import { AuthContextType } from "../features/auth/types";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  authContextValue?: Partial<AuthContextType>;
}

// Default auth context for tests
const defaultAuthContext: AuthContextType = {
  isAuthenticated: true,
  user: { name: "Test User", email: "test@example.com" },
  token: "test-token",
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    route = "/",
    authContextValue = defaultAuthContext,
    ...renderOptions
  } = options;

  window.history.pushState({}, "Test page", route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue as AuthContextType}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
