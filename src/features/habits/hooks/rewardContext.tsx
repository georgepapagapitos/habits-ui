import { PhotoReward } from "@habits/types/habit.types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Interface to store daily rewards by habit ID
interface RewardMap {
  [habitId: string]: PhotoReward;
}

// Context interface
interface RewardContextType {
  rewards: RewardMap;
  addReward: (habitId: string, photo: PhotoReward) => void;
  batchAddRewards: (
    rewardsToAdd: { habitId: string; photo: PhotoReward }[]
  ) => void;
  removeReward: (habitId: string) => void;
  getReward: (habitId: string) => PhotoReward | undefined;
  hasRewardForToday: (habitId: string) => boolean;
  clearExpiredRewards: () => void;
  isRewardsLoaded: boolean;
}

// Create the context
const RewardContext = createContext<RewardContextType | undefined>(undefined);

// Local storage key
const REWARDS_STORAGE_KEY = "habitRewards";
const REWARDS_DATE_KEY = "habitRewardsDate";
const REWARDS_LAST_CHECKED_KEY = "rewardsLastChecked";

// Typed localStorage helper functions to reduce code duplication and improve error handling
const storageHelpers = {
  // Get an item from localStorage with type safety
  getItem: function <T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return defaultValue;
    }
  },

  // Set an item in localStorage with error handling
  setItem: function <T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return false;
    }
  },

  // Remove an item from localStorage
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return false;
    }
  },
};

// Provider component
export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rewards, setRewards] = useState<RewardMap>({});
  const [lastSavedDate, setLastSavedDate] = useState<string>("");
  const [isRewardsLoaded, setIsRewardsLoaded] = useState(false);
  const initialLoadComplete = useRef(false);
  const savePendingRef = useRef<NodeJS.Timeout | null>(null);

  // Load rewards from localStorage on mount - only once
  useEffect(() => {
    if (initialLoadComplete.current) return;
    initialLoadComplete.current = true;

    const loadRewards = () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const savedDate = localStorage.getItem(REWARDS_DATE_KEY);

        // Check if the saved date matches today
        if (savedDate === today) {
          // Try to load saved rewards for today
          const savedRewards = storageHelpers.getItem<RewardMap>(
            REWARDS_STORAGE_KEY,
            {}
          );

          // Validate rewards structure
          let validRewards = true;

          // Check that each reward has a URL property
          for (const habitId in savedRewards) {
            if (!savedRewards[habitId]?.url) {
              validRewards = false;
              break;
            }
          }

          if (validRewards && Object.keys(savedRewards).length > 0) {
            setRewards(savedRewards);
            setLastSavedDate(today);
          } else {
            // Invalid rewards, reset everything
            storageHelpers.removeItem(REWARDS_STORAGE_KEY);
            storageHelpers.setItem(REWARDS_DATE_KEY, today);
            storageHelpers.removeItem(REWARDS_LAST_CHECKED_KEY);
            setLastSavedDate(today);
          }
        } else {
          // Old rewards or no date, reset everything for today
          storageHelpers.removeItem(REWARDS_STORAGE_KEY);
          storageHelpers.setItem(REWARDS_DATE_KEY, today);
          storageHelpers.removeItem(REWARDS_LAST_CHECKED_KEY);
          setLastSavedDate(today);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Reset on error
        const today = new Date().toISOString().split("T")[0];
        storageHelpers.setItem(REWARDS_DATE_KEY, today);
        storageHelpers.removeItem(REWARDS_STORAGE_KEY);
        setLastSavedDate(today);
      } finally {
        setIsRewardsLoaded(true);
      }
    };

    loadRewards();

    // Clean up any pending save operations when component unmounts
    return () => {
      if (savePendingRef.current) {
        clearTimeout(savePendingRef.current);
      }
    };
  }, []);

  // Save rewards to localStorage with debouncing
  const saveRewardsToStorage = useCallback((rewardsToSave: RewardMap) => {
    // Clear any pending save operation
    if (savePendingRef.current) {
      clearTimeout(savePendingRef.current);
    }

    // Schedule a new save operation
    savePendingRef.current = setTimeout(() => {
      if (Object.keys(rewardsToSave).length > 0) {
        console.log("Saving rewards to localStorage:", rewardsToSave);
        storageHelpers.setItem(REWARDS_STORAGE_KEY, rewardsToSave);
      } else {
        console.log("No rewards to save, removing from localStorage");
        storageHelpers.removeItem(REWARDS_STORAGE_KEY);
      }
      savePendingRef.current = null;
    }, 300);
  }, []);

  // Add a reward for a habit - optimized to avoid unnecessary renders
  const addReward = useCallback(
    (habitId: string, photo: PhotoReward) => {
      // Only update if the photo is valid
      if (!photo || !photo.url) return;

      setRewards((prev) => {
        // Skip update if the reward is identical
        if (prev[habitId]?.url === photo.url) return prev;

        // Create new rewards object with the added reward
        const newRewards = { ...prev, [habitId]: photo };

        // Save to localStorage
        saveRewardsToStorage(newRewards);

        return newRewards;
      });
    },
    [saveRewardsToStorage]
  );

  // Add multiple rewards in one batch update to prevent multiple re-renders
  const batchAddRewards = useCallback(
    (rewardsToAdd: { habitId: string; photo: PhotoReward }[]) => {
      if (rewardsToAdd.length === 0) return;

      // Filter out invalid photos
      const validRewards = rewardsToAdd.filter((r) => r.photo && r.photo.url);
      if (validRewards.length === 0) return;

      setRewards((prev) => {
        const newRewards = { ...prev };
        let hasChanges = false;

        for (const { habitId, photo } of validRewards) {
          // Skip if the reward is identical
          if (prev[habitId]?.url === photo.url) continue;

          newRewards[habitId] = photo;
          hasChanges = true;
        }

        // Only update state if something changed
        if (!hasChanges) return prev;

        // Save to localStorage
        saveRewardsToStorage(newRewards);

        return newRewards;
      });
    },
    [saveRewardsToStorage]
  );

  // Remove a reward for a habit
  const removeReward = useCallback(
    (habitId: string) => {
      setRewards((prev) => {
        // Skip if the habit doesn't have a reward
        if (!prev[habitId]) return prev;

        const newRewards = { ...prev };
        delete newRewards[habitId];

        // Save to localStorage
        saveRewardsToStorage(newRewards);

        return newRewards;
      });
    },
    [saveRewardsToStorage]
  );

  // Get a reward for a habit - memoized to avoid recalculations
  const getReward = useCallback(
    (habitId: string): PhotoReward | undefined => {
      return rewards[habitId];
    },
    [rewards]
  );

  // Check if a habit has a reward for today - memoized to avoid recalculations
  const hasRewardForToday = useCallback(
    (habitId: string): boolean => {
      return !!rewards[habitId] && !!rewards[habitId].url;
    },
    [rewards]
  );

  // Clear expired rewards (if date has changed)
  const clearExpiredRewards = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    if (lastSavedDate !== today) {
      setRewards({});
      setLastSavedDate(today);
      storageHelpers.setItem(REWARDS_DATE_KEY, today);
      storageHelpers.removeItem(REWARDS_STORAGE_KEY);
      storageHelpers.removeItem(REWARDS_LAST_CHECKED_KEY);
    }
  }, [lastSavedDate]);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(
    () => ({
      rewards,
      addReward,
      batchAddRewards,
      removeReward,
      getReward,
      hasRewardForToday,
      clearExpiredRewards,
      isRewardsLoaded,
    }),
    [
      rewards,
      addReward,
      batchAddRewards,
      removeReward,
      getReward,
      hasRewardForToday,
      clearExpiredRewards,
      isRewardsLoaded,
    ]
  );

  return (
    <RewardContext.Provider value={contextValue}>
      {children}
    </RewardContext.Provider>
  );
};

// Hook to use the reward context
export const useRewards = () => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error("useRewards must be used within a RewardProvider");
  }
  return context;
};
