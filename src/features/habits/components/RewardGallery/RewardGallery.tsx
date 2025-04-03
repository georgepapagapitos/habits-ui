import { Confetti } from "@components/Confetti";
import { useHabits, useRewards } from "@habits/hooks";
import { PhotoReward } from "@habits/types";
import { logger } from "@utils/logger";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  Container,
  EmptyState,
  ErrorMessage,
  GalleryGrid,
  PhotoCard,
  PhotoImage,
  PhotoImageContainer,
  RevealOverlay,
  Title,
} from "./rewardGallery.styles";

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
      let storedValue = null;
      try {
        const localStorageKey = `revealed_photo_${habitId}_${new Date().toISOString().split("T")[0]}`;
        storedValue = localStorage.getItem(localStorageKey);
      } catch {
        // Silently handle any localStorage errors
      }
      return storedValue === "true";
    });
    const [showConfetti, setShowConfetti] = useState(false);
    const maxRetries = 3;

    // Detect iOS - modern approach avoiding deprecated navigator.platform
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

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
            height: isIOS ? "auto" : undefined,
          }}
          onClick={handleReveal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleReveal();
              e.preventDefault();
            }
          }}
          aria-label={
            isRevealed
              ? `Photo reward for completing ${habitName}`
              : `Tap to reveal reward for completing ${habitName}`
          }
        >
          {showConfetti && <Confetti active={true} count={30} />}
          <PhotoImageContainer>
            <PhotoImage
              src={photo.url}
              alt={`Reward for ${habitName}`}
              $width={photo.width || 300}
              $height={photo.height || 200}
              style={{
                transition: "all 0.5s ease-in-out",
                opacity: isLoaded ? 1 : 0.7,
                filter: !isRevealed
                  ? "blur(40px)"
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
                } else if (
                  target.dataset.retried === "1" &&
                  photo.thumbnailUrl
                ) {
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
              <RevealOverlay>Tap to reveal!</RevealOverlay>
            )}
            {loadError && (
              <ErrorMessage>Image could not be loaded</ErrorMessage>
            )}
          </PhotoImageContainer>
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
          <h3>No Rewards Yet</h3>
          <p>Complete some habits to unlock your rewards!</p>
          <p>Need to authorize Google Photos?</p>
          <Link to="/photos/auth">Authorize Google Photos</Link>
        </EmptyState>
      </Container>
    );
  }

  // Render the rewards gallery
  return (
    <Container>
      <Title>Today's Rewards</Title>
      <p>Great job completing your habits today! Here are your rewards:</p>

      <GalleryGrid role="grid" aria-label="Photo rewards gallery">
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
