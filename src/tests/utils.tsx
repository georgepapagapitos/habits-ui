import { AuthContext } from "@auth/hooks";
import { AuthContextType } from "@auth/types";
import { MenuProvider, MessageProvider } from "@common/hooks";
import { HabitProvider } from "@habits/hooks";
import { RewardProvider } from "@habits/hooks/rewardContext";
import { render, RenderOptions } from "@testing-library/react";
import theme from "@theme";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { vi } from "vitest";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  authContextValue?: Partial<AuthContextType>;
  withHabitProvider?: boolean;
  withMessageProvider?: boolean;
  withMenuProvider?: boolean;
  withRewardProvider?: boolean;
}

// Default auth context for tests
const defaultAuthContext: AuthContextType = {
  isAuthenticated: true,
  user: { id: "123", username: "Test User", email: "test@example.com" },
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
    withHabitProvider = true,
    withMessageProvider = true,
    withMenuProvider = true,
    withRewardProvider = true,
    ...renderOptions
  } = options;

  window.history.pushState({}, "Test page", route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    // Wrap with providers, conditionally including the new providers
    let wrappedChildren = children;

    // Add HabitProvider if requested
    if (withHabitProvider) {
      wrappedChildren = <HabitProvider>{wrappedChildren}</HabitProvider>;
    }

    // Add RewardProvider if requested
    if (withRewardProvider) {
      wrappedChildren = <RewardProvider>{wrappedChildren}</RewardProvider>;
    }

    // Add MenuProvider if requested
    if (withMenuProvider) {
      wrappedChildren = <MenuProvider>{wrappedChildren}</MenuProvider>;
    }

    // Add MessageProvider if requested
    if (withMessageProvider) {
      wrappedChildren = <MessageProvider>{wrappedChildren}</MessageProvider>;
    }

    return (
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue as AuthContextType}>
          <ThemeProvider theme={theme}>{wrappedChildren}</ThemeProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
