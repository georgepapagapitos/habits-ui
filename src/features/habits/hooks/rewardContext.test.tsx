import { RewardProvider, useRewards } from "./rewardContext";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { vi } from "vitest";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock Date
const mockDate = new Date("2025-03-11T12:00:00Z");
vi.spyOn(global, "Date").mockImplementation(() => mockDate);

// Mock logger to prevent console noise
vi.mock("@utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Wrapper component with the RewardProvider
const wrapper = ({ children }: { children: ReactNode }) => (
  <RewardProvider>{children}</RewardProvider>
);

describe("RewardProvider and useRewards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  test("throws error when useRewards is used outside provider", () => {
    // Suppress console.error during this test to avoid cluttering the output
    const originalError = console.error;
    console.error = vi.fn();

    // Try to use the hook outside of provider
    expect(() => {
      renderHook(() => useRewards());
    }).toThrow("useRewards must be used within a RewardProvider");

    // Restore console.error
    console.error = originalError;
  });

  test("hook can be used within a provider", () => {
    // Suppress console.error to avoid noise from localStorage mock
    const originalError = console.error;
    console.error = vi.fn();

    const { result } = renderHook(() => useRewards(), { wrapper });

    // Basic API checks
    expect(result.current).toBeDefined();
    expect(result.current.rewards).toEqual({});
    expect(typeof result.current.addReward).toBe("function");
    expect(typeof result.current.removeReward).toBe("function");
    expect(typeof result.current.getReward).toBe("function");

    // Restore console.error
    console.error = originalError;
  });
});
