import { useHabits } from "../../hooks/habitContext";
import { useRewards } from "../../hooks/rewardContext";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { logger } from "@utils/logger";
import { PhotoReward } from "../../types/habit.types";
import {
  Container,
  EmptyState,
  GalleryGrid,
  PhotoCard,
  PhotoImage,
  Title,
} from "./rewardGallery.styles";
import { Confetti } from "@components/Confetti";

// Create a memoized individual photo component to prevent unnecessary rerenders
const RewardPhoto = React.memo(
  ({
    habitId,
    habitName,
    photo,
  }: {
    habitId: string;
    habitName: string;
    photo: PhotoReward;
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isRevealed, setIsRevealed] = useState(() => {
      // Initialize from localStorage on component mount
      try {
        const localStorageKey = `revealed_photo_${habitId}_${new Date().toISOString().split("T")[0]}`;
        const storedValue = localStorage.getItem(localStorageKey);
        return storedValue === "true";
      } catch (e) {
        return false;
      }
    });
    const [showConfetti, setShowConfetti] = useState(false);
    const maxRetries = 3;

    // Use an effect to preload the image with better error handling
    useEffect(() => {
      if (!photo.url) return;

      const img = new Image();

      // Set up handlers
      img.onload = () => {
        setIsLoaded(true);
        setLoadError(false);
      };

      img.onerror = () => {
        // If we have a thumbnail URL and this is the first error, try the thumbnail
        if (photo.thumbnailUrl && retryCount === 0) {
          logger.debug(`Image load error for ${habitName}, trying thumbnail`);
          setRetryCount(1);
          img.src = photo.thumbnailUrl;
        } else if (retryCount < maxRetries) {
          // Try to reload the image with a cache-busting parameter
          logger.debug(`Retry ${retryCount} for ${habitName} image`);
          const cacheBuster = `?retry=${Date.now()}`;
          setRetryCount((prev) => prev + 1);
          img.src = `${photo.url}${cacheBuster}`;
        } else {
          // After max retries, mark as loaded but with error
          logger.error(
            `Failed to load image for ${habitName} after ${maxRetries} retries`
          );
          setIsLoaded(true);
          setLoadError(true);
        }
      };

      // Start loading
      img.src = photo.url;

      // Clean up
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [photo.url, photo.thumbnailUrl, habitName, retryCount]);

    const handleReveal = () => {
      if (!isRevealed && isLoaded) {
        setShowConfetti(true);
        setIsRevealed(true);

        // Store the revealed state in localStorage
        try {
          const localStorageKey = `revealed_photo_${habitId}_${new Date().toISOString().split("T")[0]}`;
          localStorage.setItem(localStorageKey, "true");
        } catch (e) {
          logger.error(
            `Failed to save revealed state for ${habitName} to localStorage:`,
            e
          );
        }

        // Reset confetti after animation completes
        setTimeout(() => {
          setShowConfetti(false);
        }, 1000);
      }
    };

    if (!photo.url) return null;

    return (
      <PhotoCard key={habitId}>
        <h3>{habitName}</h3>
        <div
          style={{
            position: "relative",
            cursor: isLoaded && !isRevealed ? "pointer" : "default",
            overflow: "hidden",
            borderRadius: "0 0 8px 8px",
          }}
          onClick={handleReveal}
        >
          {showConfetti && <Confetti active={true} count={30} />}
          <PhotoImage
            src={photo.url}
            alt={`Reward for ${habitName}`}
            $width={photo.width || 300}
            $height={photo.height || 200}
            style={{
              transition: "all 0.5s ease-in-out",
              opacity: isLoaded ? 1 : 0.7,
              filter: !isRevealed
                ? "blur(15px)"
                : loadError
                  ? "grayscale(100%)"
                  : "none",
            }}
            onError={(e) => {
              // Enhanced error handling
              const target = e.target as HTMLImageElement;

              // When using our proxy endpoint, try to refresh the image
              if (!target.dataset.retried) {
                target.dataset.retried = "1";

                // Try the thumbnail as fallback if available
                if (photo.thumbnailUrl) {
                  target.src = photo.thumbnailUrl;
                  return;
                }
              } else if (target.dataset.retried === "1" && photo.thumbnailUrl) {
                // If we already tried the thumbnail, add a cache buster
                target.dataset.retried = "2";
                const cacheBuster = `?cb=${Date.now()}`;
                target.src = `${photo.url}${cacheBuster}`;
              }
              // Otherwise, we will let the image show in error state
            }}
            onLoad={() => {
              setIsLoaded(true);
              setLoadError(false);
            }}
          />
          {!isRevealed && isLoaded && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#fff",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                padding: "10px 20px",
                borderRadius: "30px",
                pointerEvents: "none",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
                backdropFilter: "blur(4px)",
              }}
            >
              Tap to reveal!
            </div>
          )}
          {loadError && (
            <div
              style={{
                color: "#999",
                fontSize: "12px",
                textAlign: "center",
                marginTop: "5px",
                padding: "10px",
              }}
            >
              Image could not be loaded
            </div>
          )}
        </div>
      </PhotoCard>
    );
  }
);

export const RewardGallery = () => {
  const { rewards, isRewardsLoaded } = useRewards();
  const { habits, loading, refreshHabits } = useHabits();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasTriedRefreshRef = useRef(false);

  // Memoize the calculation of today's date range to avoid recalculating on every render
  const todayDateRange = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  // Get all habits completed today
  const completedHabitsToday = useMemo(() => {
    if (!habits.length) return [];

    return habits.filter((habit) =>
      habit.completedDates?.some((dateValue) => {
        const date = new Date(dateValue);
        return (
          !isNaN(date.getTime()) &&
          date >= todayDateRange.start &&
          date <= todayDateRange.end
        );
      })
    );
  }, [habits, todayDateRange]);

  // From the completed habits, get those with rewards
  const completedHabitsWithRewards = useMemo(() => {
    if (!completedHabitsToday.length || !isRewardsLoaded) return [];

    // Filter for habits that have valid rewards
    return completedHabitsToday.filter(
      (habit) => !!rewards[habit._id] && !!rewards[habit._id].url
    );
  }, [completedHabitsToday, rewards, isRewardsLoaded]);

  // Add a simpler effect to check and refresh if needed
  useEffect(() => {
    // Skip if already refreshing, loading, or we've tried already
    if (loading || isRefreshing || hasTriedRefreshRef.current) return;

    logger.debug("RewardGallery - Check if we need to refresh:");
    logger.debug(
      "Completed habits today:",
      completedHabitsToday.map((h) => h.name)
    );
    logger.debug(
      "Habits with rewards:",
      completedHabitsWithRewards.map((h) => h.name)
    );

    // Check if we have habits completed today but not showing in rewards
    const missingRewardsCount =
      completedHabitsToday.length - completedHabitsWithRewards.length;

    logger.debug(
      `There are ${missingRewardsCount} completed habits missing rewards`
    );

    // If we have completed habits but they're missing from rewards, refresh
    if (completedHabitsToday.length > 0 && missingRewardsCount > 0) {
      logger.debug(
        "Some completed habits are missing rewards - refreshing habits"
      );

      // To ensure rewards are fetched, remove the lastChecked flag
      localStorage.removeItem("rewardsLastChecked");

      // Perform the refresh
      setIsRefreshing(true);
      refreshHabits()
        .then(() => logger.debug("Habits refreshed successfully"))
        .catch((err) => logger.error("Error refreshing habits:", err))
        .finally(() => setIsRefreshing(false));

      // Set flag so we don't try again this session
      hasTriedRefreshRef.current = true;
    }
  }, [
    completedHabitsToday,
    completedHabitsWithRewards,
    loading,
    isRefreshing,
    refreshHabits,
  ]);

  // Memoize the refresh handler to prevent unnecessary function recreation
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshHabits()
      .then(() => logger.debug("Manual refresh completed"))
      .catch((err) => logger.error("Error during manual refresh:", err))
      .finally(() => setIsRefreshing(false));
  }, [refreshHabits]);

  // Show loading state if rewards aren't loaded yet
  if (loading || !isRewardsLoaded || isRefreshing) {
    return (
      <Container>
        <EmptyState>
          <h3>Loading rewards...</h3>
          <p>Please wait while we fetch your rewards.</p>
        </EmptyState>
      </Container>
    );
  }

  // If there are no rewards, show an empty state
  if (completedHabitsWithRewards.length === 0) {
    return (
      <Container>
        <EmptyState>
          <h3>No rewards yet</h3>
          <p>Complete any habit to receive a photo reward!</p>
          <p>Rewards will reset at midnight each day.</p>
          <button
            onClick={handleRefresh}
            style={{
              marginTop: "20px",
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </EmptyState>
      </Container>
    );
  }

  // Render the rewards gallery
  return (
    <Container>
      <Title>Today's Rewards</Title>
      <p>Great job completing your habits today! Here are your rewards:</p>

      <GalleryGrid>
        {completedHabitsWithRewards.map((habit) => {
          const photo = rewards[habit._id];

          // We already filtered for valid photos, but add an extra check just in case
          if (!photo || !photo.url) return null;

          return (
            <RewardPhoto
              key={habit._id}
              habitId={habit._id}
              habitName={habit.name}
              photo={photo}
            />
          );
        })}
      </GalleryGrid>
    </Container>
  );
};
