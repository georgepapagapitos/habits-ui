# Testing Guide

This guide provides an overview of testing in the Habits UI project.

## Testing Stack

The Habits UI uses the following testing tools:

- **Vitest**: Fast, modern test runner compatible with Vite
- **React Testing Library**: Component testing with a user-centric approach
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **Testing Library User Event**: Simulating user interactions
- **Chai**: Assertions library with expressive syntax

## Test Types

The project implements several types of tests:

### Unit Tests

Unit tests focus on testing individual functions and utilities in isolation:

- Located in files named `*.test.ts`
- Focus on pure functions and utilities
- Typically don't involve React components
- Aim for high coverage of utility functions

### Component Tests

Component tests verify that UI components render and behave correctly:

- Located in files named `*.test.tsx`
- Test component rendering, props handling, and user interactions
- Use React Testing Library to query elements
- Focus on testing behavior rather than implementation details

### Integration Tests

Integration tests verify that multiple components work together:

- Located in files named `*.integration.test.tsx`
- Test interactions between multiple components
- Often involve context providers
- Verify that state flows correctly between components

### Route Tests

Route tests verify that routing works correctly:

- Located in `routes.test.tsx`
- Test route navigation and authentication-protected routes
- Verify that correct components render for each route
- Check redirects and route guards

## Running Tests

The project provides several commands for running tests:

```bash
# Run all tests
npm run test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run coverage report
npm run test:coverage
```

## Test Directory Structure

Tests are organized to mirror the source code structure:

```
src/
  features/
    habits/
      components/
        HabitList.tsx
        HabitList.test.tsx
      hooks/
        useHabits.ts
        useHabits.test.ts
  common/
    utils/
      dateUtils.ts
      dateUtils.test.ts
```

## Component Testing Example

Here's an example of a component test using React Testing Library:

```tsx
// src/features/habits/components/HabitItem.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HabitItem from "./HabitItem";

const mockHabit = {
  id: "1",
  name: "Exercise",
  frequency: ["monday", "wednesday", "friday"],
  streak: 3,
  completedToday: false,
  color: "blue",
};

const mockToggle = vi.fn();

describe("HabitItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders habit name and streak", () => {
    render(<HabitItem habit={mockHabit} onToggleCompletion={mockToggle} />);

    expect(screen.getByText("Exercise")).toBeInTheDocument();
    expect(screen.getByText("Streak: 3")).toBeInTheDocument();
  });

  test("calls toggle function when checked", async () => {
    render(<HabitItem habit={mockHabit} onToggleCompletion={mockToggle} />);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith("1");
  });

  test("shows completed state correctly", () => {
    const completedHabit = { ...mockHabit, completedToday: true };
    render(
      <HabitItem habit={completedHabit} onToggleCompletion={mockToggle} />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });
});
```

## Hook Testing Example

Here's an example of testing a custom hook:

```tsx
// src/features/habits/hooks/useHabits.test.ts
import { renderHook, act } from "@testing-library/react-hooks";
import { useHabits } from "./useHabits";
import { habitService } from "../services/habitService";

// Mock the service
vi.mock("../services/habitService", () => ({
  habitService: {
    getHabits: vi.fn(),
    createHabit: vi.fn(),
    updateHabit: vi.fn(),
    deleteHabit: vi.fn(),
    toggleHabitCompletion: vi.fn(),
  },
}));

describe("useHabits", () => {
  const mockHabits = [
    { id: "1", name: "Exercise", streak: 3, completedToday: false },
    { id: "2", name: "Meditate", streak: 5, completedToday: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("fetches habits successfully", async () => {
    (habitService.getHabits as jest.Mock).mockResolvedValue(mockHabits);

    const { result, waitForNextUpdate } = renderHook(() => useHabits());

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.habits).toEqual(mockHabits);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("handles fetch error", async () => {
    const error = new Error("Failed to fetch");
    (habitService.getHabits as jest.Mock).mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() => useHabits());

    await waitForNextUpdate();

    expect(result.current.habits).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual("Failed to fetch");
  });

  test("creates habit successfully", async () => {
    const newHabit = { name: "New Habit", frequency: ["monday"] };
    const createdHabit = {
      id: "3",
      ...newHabit,
      streak: 0,
      completedToday: false,
    };

    (habitService.createHabit as jest.Mock).mockResolvedValue(createdHabit);
    (habitService.getHabits as jest.Mock).mockResolvedValue([]);

    const { result, waitForNextUpdate } = renderHook(() => useHabits());

    await waitForNextUpdate();

    act(() => {
      result.current.createHabit(newHabit);
    });

    await waitForNextUpdate();

    expect(result.current.habits).toContainEqual(createdHabit);
  });
});
```

## API Mocking with MSW

For integration tests, the project uses MSW to mock API requests:

```tsx
// src/mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
  rest.get("/api/habits", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: "1", name: "Exercise", streak: 3, completedToday: false },
        { id: "2", name: "Meditate", streak: 5, completedToday: true },
      ])
    );
  }),

  rest.post("/api/habits", (req, res, ctx) => {
    const habit = req.body;
    return res(
      ctx.status(201),
      ctx.json({
        id: "3",
        ...habit,
        streak: 0,
        completedToday: false,
      })
    );
  }),

  rest.patch("/api/habits/:id/toggle", (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: "Exercise",
        streak: 4,
        completedToday: true,
      })
    );
  }),
];

// src/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

## Integration Test Example

Here's an example of an integration test that uses MSW to mock API calls:

```tsx
// src/features/habits/HabitFeature.integration.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { server } from "../../mocks/server";
import { rest } from "msw";
import HabitFeature from "./HabitFeature";

// Setup MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("HabitFeature Integration", () => {
  test("loads and displays habits", async () => {
    render(<HabitFeature />);

    // Initially shows loading state
    expect(screen.getByText(/loading habits/i)).toBeInTheDocument();

    // Wait for habits to load
    await waitFor(() => {
      expect(screen.getByText("Exercise")).toBeInTheDocument();
      expect(screen.getByText("Meditate")).toBeInTheDocument();
    });

    // Check streak display
    expect(screen.getByText("Streak: 3")).toBeInTheDocument();
  });

  test("toggles habit completion", async () => {
    render(<HabitFeature />);

    // Wait for habits to load
    await waitFor(() => {
      expect(screen.getByText("Exercise")).toBeInTheDocument();
    });

    // Mock the specific response for this test
    server.use(
      rest.patch("/api/habits/1/toggle", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            id: "1",
            name: "Exercise",
            streak: 4, // Increased streak
            completedToday: true,
          })
        );
      })
    );

    // Click the checkbox
    const checkbox = screen.getAllByRole("checkbox")[0];
    await userEvent.click(checkbox);

    // Check that streak is updated
    await waitFor(() => {
      expect(screen.getByText("Streak: 4")).toBeInTheDocument();
    });
  });
});
```

## Test Coverage

The project aims for high test coverage, especially for critical paths and components:

- **Unit Tests**: Aim for 90%+ coverage of utility functions
- **Component Tests**: Aim for 80%+ coverage of UI components
- **Integration Tests**: Cover all key user flows

To view the test coverage report:

```bash
npm run test:coverage
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the user experiences, not internal details
2. **Use meaningful assertions**: Tests should be clear about what they're verifying
3. **Keep tests independent**: Each test should run in isolation
4. **Mock external dependencies**: Use mocks for API calls, timers, etc.
5. **Use screen queries properly**: Prefer `getByRole`, `getByText` over `getByTestId`
6. **Test edge cases**: Include tests for error states, loading states, and edge cases
7. **Arrange-Act-Assert**: Structure tests with a clear setup, action, and verification
8. **Keep tests readable**: Use descriptive test names and clear assertions
