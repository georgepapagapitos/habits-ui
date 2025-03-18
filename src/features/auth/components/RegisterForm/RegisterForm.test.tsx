import { RegisterForm } from "./RegisterForm";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@tests/utils";
import { vi } from "vitest";
import { AuthContextType } from "@auth/types";

// Mock react-router-dom's useNavigate
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useNavigate: () => navigateMock,
  };
});

// Create navigate mock
const navigateMock = vi.fn();

describe("RegisterForm Component", () => {
  const mockRegisterFn = vi.fn();
  const mockClearErrorFn = vi.fn();
  const validUsername = "testuser";
  const validEmail = "test@example.com";
  const validPassword = "password123";

  // Mock auth context values
  const createAuthContext = (
    isLoading = false,
    error: string | null = null
  ): Partial<AuthContextType> => ({
    register: mockRegisterFn,
    clearError: mockClearErrorFn,
    isLoading,
    error,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders register form with all required elements", () => {
    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(),
    });

    // Verify form elements exist
    expect(
      screen.getByRole("heading", { name: /create account/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/create a password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/confirm your password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();

    // Verify password toggle buttons exist
    expect(
      screen.getAllByRole("button", { name: /show password/i }).length
    ).toBe(2);
  });

  test("handles form submission with valid inputs", async () => {
    const user = userEvent.setup();
    mockRegisterFn.mockResolvedValue(undefined);

    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(),
    });

    // Fill in the form
    await user.type(screen.getByLabelText(/username/i), validUsername);
    await user.type(screen.getByLabelText(/email/i), validEmail);
    await user.type(
      screen.getByPlaceholderText(/create a password/i),
      validPassword
    );
    await user.type(
      screen.getByPlaceholderText(/confirm your password/i),
      validPassword
    );

    // Submit the form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Check if functions were called with correct args
    expect(mockClearErrorFn).toHaveBeenCalled();
    expect(mockRegisterFn).toHaveBeenCalledWith({
      username: validUsername,
      email: validEmail,
      password: validPassword,
    });

    // Verify navigation occurred on successful registration
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  test("shows validation error for empty fields", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(),
    });

    // Get the form element
    const form = screen.getByTestId("register-form");

    // Manually fire the submit event to bypass browser validations
    await user.click(form);
    fireEvent.submit(form);

    // Verify register function wasn't called
    expect(mockRegisterFn).not.toHaveBeenCalled();

    // Now we should see the error message with our custom validation
    expect(
      await screen.findByText(/please fill out all required fields/i)
    ).toBeInTheDocument();
  });

  test("shows validation error for password mismatch", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(),
    });

    // Fill in the form with mismatched passwords
    await user.type(screen.getByLabelText(/username/i), validUsername);
    await user.type(screen.getByLabelText(/email/i), validEmail);
    await user.type(
      screen.getByPlaceholderText(/create a password/i),
      validPassword
    );
    await user.type(
      screen.getByPlaceholderText(/confirm your password/i),
      "differentpassword"
    );

    // Submit the form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Verify register function wasn't called
    expect(mockRegisterFn).not.toHaveBeenCalled();

    // Expected error message should be in the DOM
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test("shows validation error for short password", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(),
    });

    // Fill in the form with a short password
    await user.type(screen.getByLabelText(/username/i), validUsername);
    await user.type(screen.getByLabelText(/email/i), validEmail);
    await user.type(screen.getByPlaceholderText(/create a password/i), "short");
    await user.type(
      screen.getByPlaceholderText(/confirm your password/i),
      "short"
    );

    // Submit the form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Verify register function wasn't called
    expect(mockRegisterFn).not.toHaveBeenCalled();

    // Expected error message should be in the DOM
    expect(
      screen.getByText(/password must be at least 6 characters long/i)
    ).toBeInTheDocument();
  });

  test("shows error from auth context", () => {
    const authError = "Email already in use";

    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(false, authError),
    });

    // Verify error is displayed
    expect(screen.getByText(authError)).toBeInTheDocument();
  });

  test("shows loading state when registration is in progress", () => {
    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(true),
    });

    // Verify button shows loading state
    expect(
      screen.getByRole("button", { name: /creating account/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /creating account/i })
    ).toBeDisabled();
  });

  test("navigates to login page when login link is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(),
    });

    // Click login link
    await user.click(screen.getByText(/login/i));

    // Verify navigation occurred
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  test("toggles password visibility when show/hide buttons are clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />, {
      authContextValue: createAuthContext(),
    });

    // Get password inputs and toggle buttons
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(
      /confirm your password/i
    );
    const toggleButtons = screen.getAllByRole("button", {
      name: /show password/i,
    });

    // Initially passwords should be hidden
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    // Click first toggle button to show password
    await user.click(toggleButtons[0]);

    // First password should now be visible
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click second toggle button to show confirm password
    await user.click(toggleButtons[1]);

    // Confirm password should now be visible
    expect(confirmPasswordInput).toHaveAttribute("type", "text");

    // Get the hide password buttons
    const hideButtons = screen.getAllByRole("button", {
      name: /hide password/i,
    });

    // Click to hide both passwords
    await user.click(hideButtons[0]);
    await user.click(hideButtons[1]);

    // Both passwords should be hidden again
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });
});
