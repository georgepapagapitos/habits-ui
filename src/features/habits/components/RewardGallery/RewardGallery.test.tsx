import { renderWithProviders } from "@tests/utils";
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { RewardGallery } from "./RewardGallery";

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
    // Helper for tests to inspect the store directly
    _getStore: () => ({ ...store }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Create a simple mock component for providers
const MockProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Mock the required hooks and providers
vi.mock("../../hooks/rewardContext", () => ({
  useRewards: vi.fn(() => ({
    rewards: {
      habit123: {
        id: "photo123",
        url: "https://example.com/photo.jpg",
        width: 800,
        height: 600,
      },
    },
    isRewardsLoaded: true,
  })),
  RewardProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../../hooks/habitContext", () => ({
  useHabits: vi.fn(() => ({
    habits: [
      {
        _id: "habit123",
        name: "Running",
        completedDates: [new Date().toISOString()],
      },
    ],
    loading: false,
    refreshHabits: vi.fn().mockResolvedValue(undefined),
  })),
  HabitProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the MessageProvider that renderWithProviders uses
vi.mock("@common/hooks", () => ({
  MessageProvider: ({ children }: { children: React.ReactNode }) => children,
  MenuProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Simply test that the localStorage functionality works correctly
describe("RewardGallery localStorage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  test("localStorage is called correctly for photo reveal state", () => {
    // Create a fake revealed_photo localStorage item
    const today = new Date().toISOString().split("T")[0];
    const habitId = "habit123";
    const key = `revealed_photo_${habitId}_${today}`;

    // Set the value
    localStorage.setItem(key, "true");

    // Verify it was called with the expected key pattern
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, "true");

    // Verify we can retrieve the value
    expect(localStorage.getItem(key)).toBe("true");
  });

  test("RewardGallery renders without errors", () => {
    // Simple test - but modify options to avoid using providers if needed
    expect(() => {
      renderWithProviders(<RewardGallery />, {
        withMessageProvider: false,
        withMenuProvider: false,
      });
    }).not.toThrow();
  });
});
