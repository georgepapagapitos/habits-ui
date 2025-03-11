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

    // Use an effect to preload the image
    useEffect(() => {
      if (!photo.url) return;

      const img = new Image();

      // Set up handlers
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setIsLoaded(true); // Still mark as loaded on error to show something

      // Start loading
      img.src = photo.url;

      // Clean up
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [photo.url]);

    if (!photo.url) return null;

    return (
      <PhotoCard key={habitId}>
        <h3>{habitName}</h3>
        <PhotoImage
          src={photo.url}
          alt={`Reward for ${habitName}`}
          $width={photo.width || 300}
          $height={photo.height || 200}
          style={{
            transition: "opacity 0.3s ease-in-out",
            opacity: isLoaded ? 1 : 0.7,
          }}
          onError={(e) => {
            // Try to reload the image once
            const target = e.target as HTMLImageElement;
            if (!target.dataset.retried) {
              target.dataset.retried = "true";
              target.src = photo.url;
            }
          }}
          onLoad={() => setIsLoaded(true)}
        />
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
