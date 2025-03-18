import { useState, useEffect, useCallback } from "react";
import { SortOption, SORT_PREFERENCE_KEY } from "@habits/utils/sortUtils";
import { logger } from "@utils/logger";

/**
 * Hook for managing habit sorting preferences
 * Handles persistence to localStorage and provides a simple interface
 */
export const useSortPreference = () => {
  // Initialize from localStorage or use default
  const [sortOption, setSortOptionState] = useState<SortOption>(() => {
    try {
      const savedPreference = localStorage.getItem(SORT_PREFERENCE_KEY);
      // Validate the saved preference is a valid SortOption value
      if (
        savedPreference &&
        Object.values(SortOption).includes(savedPreference as SortOption)
      ) {
        return savedPreference as SortOption;
      }
    } catch (error) {
      // Fallback to default if localStorage access fails
      logger.error("Error accessing localStorage for sort preference:", error);
    }
    return SortOption.DEFAULT;
  });

  // Save to localStorage whenever the sort option changes
  useEffect(() => {
    try {
      localStorage.setItem(SORT_PREFERENCE_KEY, sortOption);
    } catch (error) {
      logger.error("Error saving sort preference to localStorage:", error);
    }
  }, [sortOption]);

  // Wrapped setter with useCallback for better performance
  const setSortOption = useCallback((option: SortOption) => {
    setSortOptionState(option);
  }, []);

  return {
    sortOption,
    setSortOption,
  };
};
