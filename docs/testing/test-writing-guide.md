# Test Writing Guide

This guide provides best practices and examples for writing effective tests for the Habits UI.

## Test Structure

Each test file should follow this structure:

```tsx
// Import dependencies
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComponentToTest from "./ComponentToTest";

// Optional: Mock dependencies
vi.mock("../services/habitService");

// Optional: Setup test data
const mockData = {
  // Test data
};

// Begin test suite
describe("ComponentToTest", () => {
  // Optional: Setup/teardown for all tests
  beforeEach(() => {
    // Setup that runs before each test
  });

  afterEach(() => {
    // Cleanup that runs after each test
  });

  // Individual test cases
  test("should render correctly", () => {
    // Arrange: Set up the test
    render(<ComponentToTest />);

    // Act: Perform actions (sometimes not needed for simple render tests)

    // Assert: Verify expectations
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  test("should handle user interaction", async () => {
    // Arrange
    render(<ComponentToTest />);

    // Act
    await userEvent.click(screen.getByRole("button", { name: "Click Me" }));

    // Assert
    expect(screen.getByText("Button Clicked")).toBeInTheDocument();
  });
});
```

## Arranging Tests

The "Arrange" step sets up the test environment:

### Rendering Components

```tsx
// Basic rendering
render(<ComponentToTest />);

// With props
render(<ComponentToTest prop1="value" prop2={123} />);

// With context providers
render(
  <ThemeProvider theme={mockTheme}>
    <AuthProvider value={mockAuthContext}>
      <ComponentToTest />
    </AuthProvider>
  </ThemeProvider>
);
```

### Using Test Wrapper

For components that require the same context in many tests, create a test wrapper:

```tsx
// src/tests/utils/TestWrapper.tsx
import { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../features/auth/context/AuthContext";
import { theme } from "../../common/theme";

interface TestWrapperProps {
  children: ReactNode;
}

export const TestWrapper = ({ children }: TestWrapperProps) => {
  const mockAuthValue = {
    user: { id: "test-user", email: "test@example.com" },
    isAuthenticated: true,
    // ... other auth context values
  };

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider initialValue={mockAuthValue}>{children}</AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Usage in tests
import { TestWrapper } from "../../tests/utils/TestWrapper";

test("component renders with context", () => {
  render(
    <TestWrapper>
      <ComponentToTest />
    </TestWrapper>
  );

  // Test assertions...
});
```

### Mocking API Calls

```tsx
// Using vi.mock to mock an entire module
vi.mock("../services/habitService", () => ({
  habitService: {
    getHabits: vi.fn().mockResolvedValue([
      { id: "1", name: "Exercise", streak: 3 },
      { id: "2", name: "Meditate", streak: 5 },
    ]),
    createHabit: vi
      .fn()
      .mockResolvedValue({ id: "3", name: "New Habit", streak: 0 }),
  },
}));

// Or using MSW for API mocking
import { rest } from "msw";
import { server } from "../../mocks/server";

// Override handler for specific test
server.use(
  rest.get("/api/habits", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: "1", name: "Exercise", streak: 3 },
        { id: "2", name: "Meditate", streak: 5 },
      ])
    );
  })
);
```

## Acting in Tests

The "Act" step performs actions that should trigger component behavior:

### User Interactions

```tsx
// Clicking elements
await userEvent.click(screen.getByRole("button", { name: "Submit" }));

// Typing in form fields
await userEvent.type(screen.getByLabelText("Email"), "test@example.com");

// Selecting options
await userEvent.selectOptions(screen.getByRole("combobox"), "option1");

// Hovering
await userEvent.hover(screen.getByText("Hover me"));

// Keyboard interactions
await userEvent.keyboard("{Enter}");
```

### Triggering Events

```tsx
// For cases where userEvent doesn't work or you need a custom event
fireEvent.change(screen.getByLabelText("Email"), {
  target: { value: "test@example.com" },
});

// Custom events
fireEvent(
  screen.getByTestId("custom-element"),
  new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
  })
);
```

### Triggering Async Actions

```tsx
// Use act for state updates
import { act } from "react-dom/test-utils";

act(() => {
  // Perform an action that causes state updates
});

// For testing hooks
const { result } = renderHook(() => useCustomHook());

await act(async () => {
  await result.current.asyncFunction();
});
```

## Asserting in Tests

The "Assert" step verifies expected outcomes:

### Element Presence

```tsx
// Check if element exists
expect(screen.getByText("Hello World")).toBeInTheDocument();

// Check if element doesn't exist
expect(screen.queryByText("Error Message")).not.toBeInTheDocument();

// Check if element appears after an action
const submitButton = screen.getByRole("button", { name: "Submit" });
await userEvent.click(submitButton);
expect(await screen.findByText("Success")).toBeInTheDocument();
```

### Element State

```tsx
// Check if element is disabled
expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

// Check if element is checked
expect(screen.getByRole("checkbox")).toBeChecked();

// Check element value
expect(screen.getByLabelText("Email")).toHaveValue("test@example.com");

// Check element attributes
expect(screen.getByRole("link")).toHaveAttribute("href", "/home");

// Check element style (with styled-components)
expect(screen.getByText("Error")).toHaveStyle("color: red");
```

### Element Content

```tsx
// Check text content
expect(screen.getByTestId("counter")).toHaveTextContent("5");

// Check HTML content
expect(screen.getByTestId("rich-text")).toContainHTML("<strong>Bold</strong>");

// Check for multiple elements
const listItems = screen.getAllByRole("listitem");
expect(listItems).toHaveLength(3);
expect(listItems[0]).toHaveTextContent("Item 1");
```

### Function Calls

```tsx
// Check if mock function was called
const mockFn = vi.fn();
render(<Button onClick={mockFn} />);
await userEvent.click(screen.getByRole("button"));
expect(mockFn).toHaveBeenCalled();

// Check call parameters
expect(mockFn).toHaveBeenCalledWith("expected-arg");

// Check call count
expect(mockFn).toHaveBeenCalledTimes(2);
```

## Testing Specific Components

### Forms

```tsx
test("form submits correctly", async () => {
  const mockSubmit = vi.fn();
  render(<LoginForm onSubmit={mockSubmit} />);

  // Fill in form fields
  await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "password123");

  // Submit form
  await userEvent.click(screen.getByRole("button", { name: "Login" }));

  // Verify form submission
  expect(mockSubmit).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "password123",
  });
});
```

### Async Components

```tsx
test("loads and displays data", async () => {
  // Mock API response
  server.use(
    rest.get("/api/habits", (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          { id: "1", name: "Exercise", streak: 3 },
          { id: "2", name: "Meditate", streak: 5 },
        ])
      );
    })
  );

  render(<HabitList />);

  // Initially shows loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // After loading, shows data
  expect(await screen.findByText("Exercise")).toBeInTheDocument();
  expect(screen.getByText("Meditate")).toBeInTheDocument();
});
```

### Error States

```tsx
test("handles error state", async () => {
  // Mock API error
  server.use(
    rest.get("/api/habits", (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<HabitList />);

  // Shows error message after failed load
  expect(await screen.findByText(/error/i)).toBeInTheDocument();

  // Shows retry button
  expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
});
```

## Writing Good Test Descriptions

Use descriptive test names that explain what's being tested and what the expected outcome is:

```tsx
// Bad: Too vague
test("renders correctly", () => {});

// Good: Clear about what's being tested
test("displays habit name and streak count", () => {});

// Bad: Doesn't explain the expected behavior
test("click button", () => {});

// Good: Explains the action and expected outcome
test("increments counter when increment button is clicked", () => {});
```

## Common Testing Patterns

### Testing Loading States

```tsx
test("shows loading indicator before data loads", async () => {
  // Mock delayed API response
  server.use(
    rest.get("/api/habits", (req, res, ctx) => {
      return res(
        ctx.delay(500), // Add delay
        ctx.status(200),
        ctx.json([{ id: "1", name: "Exercise" }])
      );
    })
  );

  render(<HabitList />);

  // Check for loading indicator
  expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

  // Verify it disappears when data loads
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("loading-spinner")
  );
  expect(screen.getByText("Exercise")).toBeInTheDocument();
});
```

### Testing Conditional Rendering

```tsx
test("shows empty state when no habits exist", async () => {
  // Mock empty response
  server.use(
    rest.get("/api/habits", (req, res, ctx) => {
      return res(ctx.status(200), ctx.json([]));
    })
  );

  render(<HabitList />);

  // Wait for loading to finish
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("loading-spinner")
  );

  // Check for empty state
  expect(
    screen.getByText("No habits found. Create your first habit!")
  ).toBeInTheDocument();
});

test("shows habits when they exist", async () => {
  // Mock response with habits
  server.use(
    rest.get("/api/habits", (req, res, ctx) => {
      return res(ctx.status(200), ctx.json([{ id: "1", name: "Exercise" }]));
    })
  );

  render(<HabitList />);

  // Wait for loading to finish
  await waitForElementToBeRemoved(() =>
    screen.queryByTestId("loading-spinner")
  );

  // Check for habit
  expect(screen.getByText("Exercise")).toBeInTheDocument();
  expect(screen.queryByText("No habits found")).not.toBeInTheDocument();
});
```

## Debugging Tests

When tests are failing, try these debugging strategies:

```tsx
// Output current DOM to the console
screen.debug();

// Output a specific element
screen.debug(screen.getByRole("button"));

// Use logRoles to see available roles in the document
import { logRoles } from "@testing-library/dom";
const { container } = render(<ComponentToTest />);
logRoles(container);

// Check for expected element in a different way
screen.getByText("Text"); // By exact text
screen.getByText(/text/i); // By regex (case insensitive)
screen.getByRole("button", { name: "Submit" }); // By role and accessible name
```

## Code Coverage

Running `npm run test:coverage` generates a code coverage report. Aim for high coverage, but don't sacrifice test quality for coverage numbers. Focus on:

1. Testing all key user flows
2. Testing edge cases and error handling
3. Testing complex logic thoroughly

Remember: 100% coverage doesn't mean your tests are good, and good tests don't always achieve 100% coverage.
