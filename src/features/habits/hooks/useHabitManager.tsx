import { useMessages } from "@hooks";
import { logger } from "@utils/logger";
import { useCallback, useEffect, useRef, useState } from "react";
import { encouragingMessages } from "../constants";
import { habitApi } from "../services/habitApi";
import {
  Habit,
  HabitCreateDTO,
  PhotoReward,
  TimeOfDay,
  WeekDay,
} from "../types/habit.types";
import { isCompletedOnDate, isHabitDueOnDate } from "../utils/habitUtils";
import { useRewards } from "./rewardContext";

export function useHabitManager() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { messages, addMessage, clearAllMessages } = useMessages();
  const {
    rewards,
    addReward,
    removeReward,
    clearExpiredRewards,
    batchAddRewards,
  } = useRewards();

  // Function to check for habits completed today that don't have rewards yet
  // This is a memoized function that will only check once per component mount
  const checkForCompletedHabitsWithoutRewards = useCallback(
    async (habitsToCheck: Habit[]) => {
      try {
        // Get today's date
        const today = new Date().toISOString().split("T")[0];

        // Always check for rewards at the start of the day
        // This ensures we're using the API's improved photo selection logic
        logger.debug("Checking for rewards for completed habits");

        // Calculate today's date range
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        logger.debug("Today's date range for rewards check:", {
          start: todayStart.toISOString(),
          end: todayEnd.toISOString(),
        });

        // Debug the habits we're checking
        logger.debug(
          "Checking for rewards in habits:",
          habitsToCheck.map((h) => ({
            id: h._id,
            name: h.name,
            completedDates: h.completedDates?.map((d) =>
              new Date(d).toISOString()
            ),
          }))
        );

        // Debug what's in the rewards context
        logger.debug("Current rewards in context:", rewards);

        // Find habits completed today (optimized with early returns)
        const completedHabitsToday: Habit[] = [];

        for (const habit of habitsToCheck) {
          if (!habit.completedDates || habit.completedDates.length === 0)
            continue;

          // Check if this habit was completed today
          const completedToday = habit.completedDates.some((dateValue) => {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return false;
            return date >= todayStart && date <= todayEnd;
          });

          if (completedToday) {
            completedHabitsToday.push(habit);
          }
        }

        // If no habits are completed today, mark as checked and exit
        if (completedHabitsToday.length === 0) {
          localStorage.setItem("rewardsLastChecked", today);
          return;
        }

        const habitsNeedingRewards = completedHabitsToday.filter((habit) => {
          // Check if it has a valid reward in the context
          const hasValidReward =
            !!rewards[habit._id] &&
            !!rewards[habit._id].url &&
            typeof rewards[habit._id].url === "string";

          // Log debugging info
          logger.debug(
            `Checking if habit "${habit.name}" (${habit._id}) needs a reward:`,
            {
              hasReward: !!rewards[habit._id],
              hasValidUrl: !!rewards[habit._id]?.url,
              showRewardProp: habit.showReward,
              needsReward: !hasValidReward && habit.showReward !== false,
            }
          );

          return !hasValidReward;
        });

        // Even if we don't need to fetch new rewards, mark that we checked today
        localStorage.setItem("rewardsLastChecked", today);

        if (habitsNeedingRewards.length === 0) {
          return;
        }

        // Clear invalid rewards for habits that need them
        habitsNeedingRewards.forEach((habit) => {
          if (rewards[habit._id]) {
            removeReward(habit._id);
          }
        });

        // Create a batch of rewards to add
        const rewardsToAdd: { habitId: string; photo: PhotoReward }[] = [];

        // Use Promise.all to fetch photos in parallel
        // This is significantly faster than sequential requests
        const photoPromises = habitsNeedingRewards.map(async (habit) => {
          try {
            // Generate a deterministic seed based on habit ID and today's date
            // This ensures the same habit gets the same photo on a given day
            const todayStr = new Date().toISOString().split("T")[0];
            const habitSeed = generateSeedForHabit(habit._id, todayStr);

            logger.debug(
              `Fetching photo for habit "${habit.name}" with consistent seed: ${habitSeed}`
            );

            // Use the deterministic seed to get a consistent photo for this habit+day combo
            const photoResponse = await habitApi.getRandomPhoto(habitSeed);

            if (photoResponse && photoResponse.url) {
              return { habitId: habit._id, photo: photoResponse };
            }
            return null;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {
            return null;
          }
        });

        // Wait for all photo fetches to complete
        const photoResults = await Promise.all(photoPromises);

        // Filter out null results and add to the batch
        for (const result of photoResults) {
          if (result) {
            rewardsToAdd.push(result);
          }
        }

        // Use the batch update to add all rewards at once (single render)
        if (rewardsToAdd.length > 0) {
          batchAddRewards(rewardsToAdd);
        }

        // Mark that we've checked for rewards today
        localStorage.setItem("rewardsLastChecked", today);
      } catch (error) {
        logger.error(
          "Error checking for completed habits without rewards:",
          error
        );
      }
    },
    [rewards, batchAddRewards, removeReward]
  );

  // Generate a seed for photo rewards
  // This is a simplified version that matches the API's expectations
  // The API now owns the full logic for how to interpret the seed
  const generateSeedForHabit = (
    habitId: string,
    dateString: string
  ): number => {
    // We'll use a much simpler approach that still guarantees:
    // 1. The same habit+date combination gets the same seed
    // 2. Different habits get different seeds
    // 3. Different dates get different seeds

    // Simple hash functions for both components
    const getDateNumber = (date: string): number => {
      // Convert YYYY-MM-DD to YYYYMMDD number
      return parseInt(date.replace(/-/g, ""));
    };

    const getHabitNumber = (id: string): number => {
      // Simple hash for the habit ID
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      // Make sure it's positive and scale it to be much larger than date portion
      return Math.abs(hash) * 1000000;
    };

    // Combine them - scaled habit hash + date number
    return getHabitNumber(habitId) + getDateNumber(dateString);
  };

  // Ref to track initial mount to prevent duplicate fetches
  const isInitialMount = useRef(true);
  const loadingHabitsRef = useRef(false);

  // Retry logic
  const retryAttemptsRef = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;

  // Fetch habits on component mount - only once
  useEffect(() => {
    // Return early if this isn't the initial mount or if we're already loading
    if (!isInitialMount.current || loadingHabitsRef.current) {
      return;
    }

    const fetchHabits = async () => {
      // Prevent concurrent fetches
      if (loadingHabitsRef.current) return;
      loadingHabitsRef.current = true;

      try {
        setLoading(true);
        // Check if we need to clear cached rewards (at midnight)
        clearExpiredRewards();

        let fetchedHabits;
        try {
          // Fetch habits
          fetchedHabits = await habitApi.getAllHabits();
          // Reset retry attempts on success
          retryAttemptsRef.current = 0;
        } catch (fetchError) {
          // Handle rate limiting with exponential backoff
          if (
            fetchError === "Too many requests, please try again later." &&
            retryAttemptsRef.current < MAX_RETRY_ATTEMPTS
          ) {
            retryAttemptsRef.current++;
            const backoffTime = 1000 * Math.pow(2, retryAttemptsRef.current);

            logger.warn(
              `Rate limited, retrying in ${backoffTime / 1000} seconds (attempt ${retryAttemptsRef.current}/${MAX_RETRY_ATTEMPTS})...`
            );
            setError(
              `Rate limited. Retrying in ${backoffTime / 1000} seconds...`
            );

            // Clean up and try again after backoff
            loadingHabitsRef.current = false;

            setTimeout(() => {
              // Re-call the same function after backoff
              fetchHabits();
            }, backoffTime);

            return; // Exit early to avoid running the rest of the function
          }

          // Either not a rate limit error or max retries exceeded
          throw fetchError;
        }

        setHabits(fetchedHabits);
        setError(null);

        // Set initialized to prevent duplicate fetches
        isInitialMount.current = false;

        // Now check for habits that need rewards - this only runs once on initial mount
        // and uses the localStorage to track if it already ran today
        if (fetchedHabits.length > 0) {
          try {
            logger.debug(
              "Initial load - checking for habits that need rewards"
            );

            // Force a fresh check for rewards to ensure we're using the latest API logic
            localStorage.removeItem("rewardsLastChecked");
            logger.debug(
              "Cleared rewards last checked flag to ensure fresh rewards"
            );

            await checkForCompletedHabitsWithoutRewards(fetchedHabits);
          } catch (rewardError) {
            // Don't fail everything if rewards can't be fetched
            logger.error("Error checking for rewards:", rewardError);
          }
        }
      } catch (err) {
        if (typeof err === "string") {
          setError(err);
        } else {
          setError("Failed to load habits. Please try again later.");
        }
        logger.error("Error fetching habits:", err);
      } finally {
        setLoading(false);
        loadingHabitsRef.current = false;
      }
    };

    fetchHabits();
  }, [clearExpiredRewards, checkForCompletedHabitsWithoutRewards]);

  // Get a personalized random message
  const getRandomMessage = (habitName?: string) => {
    // Get user's name from localStorage or default to "you"
    const userName = localStorage.getItem("userName") || "Hannah";

    // Get messages with personalized name
    const messages = encouragingMessages(userName);
    const randIndex = Math.floor(Math.random() * messages.length);

    // Choose base message
    let message = messages[randIndex];

    // Append habit-specific messaging 10% of the time if habit name is provided
    if (habitName && Math.random() < 0.1) {
      message += ` Your progress with "${habitName}" is inspiring!`;
    }

    return message;
  };

  // Use the central message system for adding messages
  const showTemporaryMessage = (message: string) => {
    // Add the message to the central message system
    addMessage(message);
  };

  // Add a new habit
  const handleAddHabit = async (habitData: {
    name: string;
    frequency: WeekDay[];
    description?: string;
    color?: string;
    icon?: string;
    timeOfDay?: string;
  }) => {
    try {
      const newHabitData: HabitCreateDTO = {
        name: habitData.name,
        frequency: habitData.frequency,
        description: habitData.description,
        color: habitData.color,
        icon: habitData.icon,
        timeOfDay: habitData.timeOfDay as TimeOfDay | undefined,
        startDate: new Date(),
      };

      const newHabit = await habitApi.createHabit(newHabitData);
      setHabits((prevHabits) => [...prevHabits, newHabit]);

      // Show only a single message when creating a habit
      showTemporaryMessage(`Added new habit: ${habitData.name}`);
      return newHabit;
    } catch (err) {
      showTemporaryMessage("Failed to add habit. Please try again.");
      console.error("Error adding habit:", err);
      throw err;
    }
  };

  // Toggle habit completion for today or a specific date
  const toggleHabit = async (id: string, date: Date = new Date()) => {
    try {
      // Check if this card is currently being animated - if so, don't interfere
      const isAnimating = !!document.querySelector(
        `.styledHabitCard[data-habit-id="${id}"].animating`
      );

      const habit = habits.find((h) => h._id === id);

      if (!habit) {
        throw new Error("Habit not found");
      }

      // Check if this is a future date
      const isFutureDate =
        date.getTime() > new Date().setHours(23, 59, 59, 999);

      // Don't allow toggling future dates
      if (isFutureDate) {
        showTemporaryMessage("Cannot mark habits complete for future dates");
        return;
      }

      // Always reset the rewardsLastChecked flag to force fresh reward checking
      localStorage.removeItem("rewardsLastChecked");
      logger.debug(
        "Cleared rewards last checked flag during habit toggle to ensure fresh rewards"
      );

      // Get today's date as string
      const todayString = new Date().toISOString().split("T")[0];

      // Generate a consistent seed for this habit and today's date
      // This ensures the same habit gets the same photo each day
      const habitSeed = generateSeedForHabit(id, todayString);

      // Make API call to toggle completion with a consistent seed
      logger.debug(
        `Making API call to toggle habit "${habit.name}" with consistent seed ${habitSeed}`
      );
      const updatedHabit = await habitApi.toggleCompletion(id, date, habitSeed);
      logger.debug(`Toggle response for habit "${habit.name}":`, updatedHabit);

      // If the card is animating, wait for animation to complete before updating context
      if (isAnimating) {
        // Delay updating the context until after animation completes
        setTimeout(() => {
          // Update the habit state in React context
          setHabits((prevHabits) =>
            prevHabits.map((h) => (h._id === id ? updatedHabit : h))
          );
        }, 950); // Slightly longer than animation duration
      } else {
        // Update the habit state in React context immediately
        setHabits((prevHabits) =>
          prevHabits.map((h) => (h._id === id ? updatedHabit : h))
        );
      }

      // Get completion status before and after for messaging
      const wasCompletedBefore = isCompletedOnDate(habit, date);
      const isCompletedNow = isCompletedOnDate(updatedHabit, date);

      // Only dispatch event if it's not coming from a habit card
      // (which has already dispatched the event and is handling animation)
      if (!isAnimating) {
        document.dispatchEvent(
          new CustomEvent("habit-toggled", {
            detail: {
              habitId: id,
              isCompleted: isCompletedNow,
            },
          })
        );
      }

      // Check if the completion date is today using a more accurate comparison
      const completionDate = new Date(date);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const isToday =
        completionDate >= todayStart && completionDate <= todayEnd;

      logger.debug(`Toggling habit "${habit.name}" - completion date info:`, {
        date: completionDate.toISOString(),
        isToday,
        todayStart: todayStart.toISOString(),
        todayEnd: todayEnd.toISOString(),
      });

      // Show appropriate message based on action
      if (!wasCompletedBefore && isCompletedNow) {
        // Determine if this date is a due date for this habit
        const isDueDate = isHabitDueOnDate(updatedHabit, date);

        // If habit was completed and has reward photo, store it
        if (updatedHabit.rewardPhoto && isToday) {
          logger.debug(
            "Adding reward photo for habit:",
            id,
            updatedHabit.rewardPhoto
          );
          if (updatedHabit.rewardPhoto.url) {
            // Ensure photo has proper structure before adding
            logger.debug(
              "Valid reward photo found, adding to context:",
              updatedHabit.rewardPhoto
            );
            addReward(id, updatedHabit.rewardPhoto);

            // Verify the reward was added properly
            setTimeout(() => {
              logger.debug(
                `Verify reward was added for habit "${updatedHabit.name}":`,
                rewards[id]
              );
            }, 100);
          } else {
            logger.error(
              "Invalid reward photo structure:",
              updatedHabit.rewardPhoto
            );
          }
        } else {
          logger.debug("No reward photo available:", {
            hasPhoto: !!updatedHabit.rewardPhoto,
            isToday,
            rewardDetails: updatedHabit.rewardPhoto,
          });

          // For today's completion without a reward, we'll try to fetch one
          // DEBUGGING: Force fetch reward regardless of showReward property
          if (isToday) {
            // Get today's date as string and generate a consistent seed
            // This ensures the same habit gets the same photo on a given day
            const today = new Date().toISOString().split("T")[0];
            const habitSeed = generateSeedForHabit(id, today);

            logger.debug(
              "Attempting to fetch reward with consistent seed:",
              habitSeed
            );

            // Force clear the checked flag to ensure rewards get checked next time
            localStorage.removeItem("rewardsLastChecked");

            // Fetch photo asynchronously to not block the UI
            habitApi
              .getRandomPhoto(habitSeed)
              .then((photoResponse) => {
                if (photoResponse && photoResponse.url) {
                  logger.debug(
                    "Successfully fetched manual reward photo:",
                    photoResponse
                  );
                  addReward(id, photoResponse);

                  // Also store it in the rewards object in localStorage directly
                  try {
                    const rewardsObj = JSON.parse(
                      localStorage.getItem("habitRewards") || "{}"
                    );
                    rewardsObj[id] = photoResponse;
                    localStorage.setItem(
                      "habitRewards",
                      JSON.stringify(rewardsObj)
                    );
                    logger.debug("Saved reward directly to localStorage");
                  } catch (e) {
                    logger.error("Failed to save reward to localStorage:", e);
                  }
                }
              })
              .catch((err) => {
                logger.error("Error fetching manual reward:", err);
              });
          }
        }

        // Habit was marked as completed
        if (isToday) {
          const message = isDueDate
            ? getRandomMessage(updatedHabit.name)
            : `Bonus completion for "${updatedHabit.name}"!`;
          showTemporaryMessage(message);
        } else {
          const bonusMsg = isDueDate ? "" : " (bonus completion)";
          showTemporaryMessage(
            `Marked "${updatedHabit.name}" as complete for ${date.toLocaleDateString()}${bonusMsg}`
          );
        }
      } else if (wasCompletedBefore && !isCompletedNow) {
        // Habit was unmarked - remove any reward for this habit
        if (isToday) {
          // Remove the reward if it exists
          removeReward(id);
          showTemporaryMessage(`Unmarked "${habit.name}" for today`);
        } else {
          showTemporaryMessage(
            `Unmarked "${habit.name}" for ${date.toLocaleDateString()}`
          );
        }
      }
    } catch (err) {
      showTemporaryMessage("Failed to update habit. Please try again.");
      logger.error("Error toggling habit:", err);
    }
  };

  // Delete a habit
  const deleteHabit = async (id: string) => {
    try {
      await habitApi.deleteHabit(id);
      setHabits((prevHabits) => prevHabits.filter((h) => h._id !== id));
      showTemporaryMessage("Habit deleted successfully");
    } catch (err) {
      showTemporaryMessage("Failed to delete habit. Please try again.");
      logger.error("Error deleting habit:", err);
    }
  };

  // Update a habit
  const updateHabit = async (id: string, habitData: Partial<Habit>) => {
    try {
      const updatedHabit = await habitApi.updateHabit(id, habitData);
      setHabits((prevHabits) =>
        prevHabits.map((h) => (h._id === id ? updatedHabit : h))
      );
      showTemporaryMessage(`Updated habit: ${updatedHabit.name}`);
      return updatedHabit;
    } catch (err) {
      showTemporaryMessage("Failed to update habit. Please try again.");
      logger.error("Error updating habit:", err);
      throw err;
    }
  };

  // Reset a habit (clear all completions and streak)
  const resetHabit = async (id: string) => {
    try {
      const habit = habits.find((h) => h._id === id);
      if (!habit) {
        throw new Error("Habit not found");
      }

      const resetHabit = await habitApi.resetHabit(id);
      setHabits((prevHabits) =>
        prevHabits.map((h) => (h._id === id ? resetHabit : h))
      );
      showTemporaryMessage(`Reset habit: ${resetHabit.name}`);
      return resetHabit;
    } catch (err) {
      showTemporaryMessage("Failed to reset habit. Please try again.");
      logger.error("Error resetting habit:", err);
      throw err;
    }
  };

  // We no longer need these compatibility variables with the new message system

  // Get habit completion data for a date range (for analytics/reports)
  const getHabitHistoryForDateRange = useCallback(
    (habitId: string, startDate: Date, endDate: Date) => {
      const habit = habits.find((h) => h._id === habitId);
      if (!habit) return [];

      const result = [];
      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      // List of all days in the range
      while (currentDate <= endDateTime) {
        const dueOnThisDay = isHabitDueOnDate(habit, new Date(currentDate));
        const completedOnThisDay = isCompletedOnDate(
          habit,
          new Date(currentDate)
        );

        result.push({
          date: new Date(currentDate),
          due: dueOnThisDay,
          completed: completedOnThisDay,
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    },
    [habits]
  );

  // Get weekly report with completion rates
  const getWeeklyReport = useCallback(() => {
    if (habits.length === 0) return null;

    const today = new Date();
    const startOfWeek = new Date(today);
    // Set to previous Sunday (or adjust based on locale)
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const habitReports = habits.map((habit) => {
      const daysInWeek = 7;
      let dueCount = 0;
      let completedCount = 0;

      // Check each day of the week
      for (let i = 0; i < daysInWeek; i++) {
        const checkDate = new Date(startOfWeek);
        checkDate.setDate(startOfWeek.getDate() + i);

        // Check if habit was due on this day
        const dayName = checkDate
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        const isDue = habit.frequency.some(
          (day) => day.toLowerCase() === dayName
        );

        if (isDue) {
          dueCount++;
          if (isCompletedOnDate(habit, checkDate)) {
            completedCount++;
          }
        }
      }

      return {
        habitId: habit._id,
        habitName: habit.name,
        dueCount,
        completedCount,
        completionRate: dueCount > 0 ? (completedCount / dueCount) * 100 : 0,
      };
    });

    return {
      startDate: startOfWeek,
      endDate: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000),
      habitReports,
      overallCompletionRate:
        habitReports.reduce((sum, report) => sum + report.completionRate, 0) /
        habitReports.length,
    };
  }, [habits]);

  return {
    habits,
    loading,
    error,
    messages,
    handleAddHabit,
    toggleHabit,
    deleteHabit,
    updateHabit,
    resetHabit,
    getHabitHistoryForDateRange,
    getWeeklyReport,
    // Expose seed generation function for testing
    generateSeedForHabit,
    refreshHabits: function () {
      // Use a named function expression to enable self-reference
      const refreshFn = async () => {
        // Prevent refreshing if already loading
        if (loadingHabitsRef.current) return;
        loadingHabitsRef.current = true;

        try {
          setLoading(true);

          let fetchedHabits;
          try {
            fetchedHabits = await habitApi.getAllHabits();
            // Reset retry counter on success
            retryAttemptsRef.current = 0;
          } catch (fetchError) {
            // Handle rate limiting with exponential backoff
            if (
              fetchError === "Too many requests, please try again later." &&
              retryAttemptsRef.current < MAX_RETRY_ATTEMPTS
            ) {
              retryAttemptsRef.current++;
              const backoffTime = 1000 * Math.pow(2, retryAttemptsRef.current);

              setError(
                `Rate limited. Will retry in ${backoffTime / 1000} seconds...`
              );
              logger.warn(
                `Rate limited during refresh, retrying in ${backoffTime / 1000}s (attempt ${retryAttemptsRef.current}/${MAX_RETRY_ATTEMPTS})...`
              );

              // Clean up
              setLoading(false);
              loadingHabitsRef.current = false;

              // Schedule retry
              setTimeout(() => {
                refreshFn(); // Use the function itself
              }, backoffTime);

              return; // Exit early
            }

            // Either not a rate limit error or max retries exceeded
            throw fetchError;
          }

          setHabits(fetchedHabits);
          setError(null);

          // Only check for rewards if we haven't checked today
          // This is handled within checkForCompletedHabitsWithoutRewards itself
          if (fetchedHabits.length > 0) {
            try {
              await checkForCompletedHabitsWithoutRewards(fetchedHabits);
            } catch (rewardError) {
              logger.error(
                "Error checking for rewards during refresh:",
                rewardError
              );
            }
          }
        } catch (err) {
          if (typeof err === "string") {
            setError(err);
          } else {
            setError("Failed to refresh habits. Please try again later.");
          }
          logger.error("Error refreshing habits:", err);
        } finally {
          setLoading(false);
          loadingHabitsRef.current = false;
        }
      };

      // Return the refresh function
      return refreshFn();
    },
    // Expose the showMessage and clearMessages functions to match the HabitContextType
    showMessage: showTemporaryMessage,
    clearMessages: clearAllMessages,
  };
}
