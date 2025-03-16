import { beforeEach, describe, expect, test, vi } from "vitest";

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

describe("Photo Reveal LocalStorage Functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  test("should save and retrieve revealed state with date-specific key", () => {
    // Setup
    const today = new Date().toISOString().split("T")[0];
    const habitId = "habit123";
    const key = `revealed_photo_${habitId}_${today}`;

    // Act
    localStorage.setItem(key, "true");
    const value = localStorage.getItem(key);

    // Assert
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, "true");
    expect(value).toBe("true");
  });

  test("should separate keys by date", () => {
    // Setup
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const habitId = "habit123";
    const todayKey = `revealed_photo_${habitId}_${today}`;
    const yesterdayKey = `revealed_photo_${habitId}_${yesterdayStr}`;

    // Act
    localStorage.setItem(yesterdayKey, "true");
    localStorage.setItem(todayKey, "true");

    // Assert
    expect(localStorage.getItem(yesterdayKey)).toBe("true");
    expect(localStorage.getItem(todayKey)).toBe("true");
    expect(yesterdayKey).not.toBe(todayKey); // Different keys for different days
  });

  test("should override previous values", () => {
    // Setup
    const today = new Date().toISOString().split("T")[0];
    const habitId = "habit123";
    const key = `revealed_photo_${habitId}_${today}`;

    // Act
    localStorage.setItem(key, "false");
    localStorage.setItem(key, "true");

    // Assert
    expect(localStorage.getItem(key)).toBe("true");
  });
});
