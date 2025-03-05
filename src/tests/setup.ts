import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

// Suppress React act() warnings
beforeAll(() => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Filter out act() warnings
  console.error = (...args: unknown[]) => {
    if (
      (typeof args[0] === "string" &&
        args[0].includes("was not wrapped in act")) ||
      (typeof args[0] === "string" &&
        args[0].includes("inside a test was not wrapped in act"))
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args: unknown[]) => {
    if (
      (typeof args[0] === "string" &&
        args[0].includes("was not wrapped in act")) ||
      (typeof args[0] === "string" &&
        args[0].includes("inside a test was not wrapped in act"))
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
  // Store original console functions for cleanup
  interface ExtendedGlobal {
    __originalConsoleError: typeof console.error;
    __originalConsoleWarn: typeof console.warn;
  }
  (global as unknown as ExtendedGlobal).__originalConsoleError =
    originalConsoleError;
  (global as unknown as ExtendedGlobal).__originalConsoleWarn =
    originalConsoleWarn;
});

// Restore console functions after tests
afterAll(() => {
  interface ExtendedGlobal {
    __originalConsoleError: typeof console.error;
    __originalConsoleWarn: typeof console.warn;
  }
  const originalError = (global as unknown as ExtendedGlobal)
    .__originalConsoleError;
  const originalWarn = (global as unknown as ExtendedGlobal)
    .__originalConsoleWarn;

  if (originalError) console.error = originalError;
  if (originalWarn) console.warn = originalWarn;
});

// Add Jest DOM matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock date-fns-tz functions which are used in our components
vi.mock("date-fns-tz", () => ({
  __esModule: true,
  toZonedTime: vi.fn().mockImplementation((date) => date),
  formatInTimeZone: vi.fn().mockImplementation((date) => {
    return new Date(date).toLocaleDateString("en-US");
  }),
}));

// Mock timezone resolution
vi.mock("date-fns", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    format: vi.fn().mockImplementation((date, formatStr) => {
      if (formatStr === "MMM d") return "Jan 1";
      if (formatStr === "MMMM yyyy") return "January 2025";
      if (formatStr === "yyyy-MM-dd") return "2025-01-01";
      if (formatStr === "EEE, MMM d") return "Mon, Jan 1";
      return "Jan 1";
    }),
  };
});

// Override Intl.DateTimeFormat for testing
Object.defineProperty(Intl, "DateTimeFormat", {
  value: class {
    resolvedOptions() {
      return { timeZone: "America/Chicago" };
    }
  },
});

// Mock navigator.vibrate
Object.defineProperty(navigator, "vibrate", {
  value: vi.fn(),
  writable: true,
});

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn((key) => {
      if (key === "userName") return "TestUser";
      return null;
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});
