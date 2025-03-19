import { Button, Dialog, Menu } from "@components";
import { HabitCalendar } from "@habits/components";
import { useHabits } from "@habits/hooks";
import { Habit, WeekDay } from "@habits/types";
import {
  celebrationColors,
  getFrequencyDisplayText,
  getNextDueDate,
  isCompletedToday,
  isHabitDueToday,
} from "@habits/utils";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import {
  FaEllipsisV,
  FaFire,
  FaPencilAlt,
  FaSync,
  FaTrash,
} from "react-icons/fa";
import { LuFlower2, LuSprout, LuStar } from "react-icons/lu";
import {
  CardContent,
  CardFooter,
  ConfettiPiece,
  ExpandButton,
  FrequencyBadge,
  HabitMeta,
  HabitName,
  MenuButton,
  StreakIndicator,
  StyledHabitCard,
} from "./habitCard.styles";

interface HabitCardProps {
  habit: Habit;
}

// Celebration component with improved implementation
const Celebration = () => {
  return (
    <>
      {[...Array(40)].map((_, i) => (
        <ConfettiPiece
          key={i}
          color={celebrationColors[i % celebrationColors.length]}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${20 + Math.random() * 50}%`,
            animationDelay: `${Math.random() * 0.3}s`,
            transform: `scale(${0.6 + Math.random() * 0.8})`,
          }}
        />
      ))}
    </>
  );
};

export const HabitCard = ({ habit }: HabitCardProps) => {
  const { toggleHabit, deleteHabit, resetHabit } = useHabits();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Use local state for the habit data to allow for immediate updates
  const [localHabit, setLocalHabit] = useState<Habit>(habit);

  // Update local habit when the prop changes (and we're not in the middle of an update)
  const updatingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  // Helper function to determine if we should show "No streak yet"
  // for habits with non-due day completions
  const shouldShowNoStreak = (habit: Habit): boolean => {
    // If the habit has no streak, we definitely show "No streak yet"
    if (habit.streak === 0) return true;

    // Check if there's at least one completion on a due day
    // If not, this habit shouldn't have a streak
    const hasDueDayCompletion = habit.completedDates.some((dateStr) => {
      // Get the completed date
      const completedDate = new Date(dateStr);

      // Get the day of the week (0-6, where 0 is Sunday)
      const dayOfWeek = completedDate.getDay();

      // Convert to day name for frequency comparison
      const dayNames: WeekDay[] = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayName = dayNames[dayOfWeek];

      // Check if this completion fell on a due day
      return habit.frequency.includes(dayName);
    });

    // If there's no completion on a due day, this shouldn't have a streak,
    // regardless of how many completions there are
    if (!hasDueDayCompletion && habit.completedDates.length > 0) {
      return true;
    }

    // The original single-completion edge case is now handled by the logic above

    return false;
  };

  // Sync localHabit with habit prop when it changes (unless we're updating)
  useEffect(() => {
    if (!updatingRef.current) {
      setLocalHabit(habit);
    }
  }, [habit]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Add event listeners for testing (for delete and reset confirmations)
  useEffect(() => {
    // Event listener for delete confirmation (used in testing)
    const handleDeleteConfirmed = (e: CustomEvent) => {
      if (e.detail.habitId === localHabit._id) {
        deleteHabit(localHabit._id);
        setShowConfirmDelete(false);
      }
    };

    // Event listener for delete cancellation (used in testing)
    const handleDeleteCanceled = (e: CustomEvent) => {
      if (e.detail.habitId === localHabit._id) {
        setShowConfirmDelete(false);
      }
    };

    // Add event listeners for testing
    document.addEventListener(
      "habit-delete-confirmed",
      handleDeleteConfirmed as EventListener
    );
    document.addEventListener(
      "habit-delete-canceled",
      handleDeleteCanceled as EventListener
    );

    // Clean up
    return () => {
      document.removeEventListener(
        "habit-delete-confirmed",
        handleDeleteConfirmed as EventListener
      );
      document.removeEventListener(
        "habit-delete-canceled",
        handleDeleteCanceled as EventListener
      );
    };
  }, [localHabit._id, deleteHabit]);

  // Computed properties based on localHabit
  const isDue = isHabitDueToday(localHabit);
  const nextDue = getNextDueDate(localHabit);
  const isCompleted = isCompletedToday(localHabit);
  const totalCompletions = localHabit.completedDates.length;

  // Handle toggle with optimistic UI updates for both display and data
  const handleToggle = () => {
    // Don't allow toggling again while animation is happening
    if (isCompleting) return;

    // Clear any existing timeouts
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Set updating flag
    updatingRef.current = true;

    // The new completed state will be the opposite of current state
    const willBeCompleted = !isCompleted;

    // Set animation state
    setIsCompleting(true);

    // Create today's date and normalize it to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Format for comparison with completedDates - using date string for consistent comparison
    const todayDateString = today.toDateString(); // e.g., "Wed Mar 20 2024"

    // Create an ISO string for adding to completedDates
    const todayISOString = today.toISOString();

    // Create a copy of the habit for optimistic updates
    const updatedHabit = { ...localHabit };

    // First update the completedDates array
    if (willBeCompleted) {
      // Add today to completedDates if not already there
      if (
        !updatedHabit.completedDates.some(
          (dateStr) => new Date(dateStr).toDateString() === todayDateString
        )
      ) {
        updatedHabit.completedDates = [
          ...updatedHabit.completedDates,
          todayISOString,
        ];
      }
    } else {
      // Remove today from completedDates
      updatedHabit.completedDates = updatedHabit.completedDates.filter(
        (dateStr) => new Date(dateStr).toDateString() !== todayDateString
      );
    }

    // Now update the streak based on the new completedDates
    if (isDue) {
      if (willBeCompleted) {
        // When completing a due habit today, increment streak
        // If streak was 0, it becomes 1
        // If streak was > 0, it increments by 1
        updatedHabit.streak = localHabit.streak + 1;
      } else {
        // When uncompleting a due habit today, decrement streak
        // If streak was 1, it becomes 0
        // If streak was > 1, it decrements by 1
        updatedHabit.streak = Math.max(0, localHabit.streak - 1);
      }
    } else {
      // For non-scheduled days ("bonus" completions)
      if (willBeCompleted) {
        // For non-due days, completing only extends an existing streak
        // It should not start a new streak if there's no streak
        if (localHabit.streak > 0) {
          // Only increment streak if there's already a streak going
          updatedHabit.streak = localHabit.streak + 1;
        }
        // If streak is 0, it stays 0 - we don't start streaks on non-due days
      } else {
        // For non-due days, uncompleting reduces streak
        updatedHabit.streak = Math.max(0, localHabit.streak - 1);
      }
    }

    // Immediately update local state with optimistic changes
    setLocalHabit(updatedHabit);

    // Only show celebration when completing a habit (not when uncompleting)
    if (willBeCompleted) {
      // Show celebration immediately for smoother feel
      setShowCelebration(true);
    }

    // Dispatch custom event immediately to notify the HabitList about the toggle
    document.dispatchEvent(
      new CustomEvent("habit-toggled", {
        detail: {
          habitId: localHabit._id,
          isCompleted: willBeCompleted,
        },
      })
    );

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }

    // Use the hook to toggle the habit in the backend
    timeoutRef.current = window.setTimeout(() => {
      // Toggle the habit in the backend
      toggleHabit(localHabit._id);

      // End animation state after the animation
      timeoutRef.current = window.setTimeout(() => {
        // Reset the updating flag
        updatingRef.current = false;

        // End animation state
        setIsCompleting(false);
      }, 100);

      // Auto-hide celebration after animation
      if (willBeCompleted) {
        timeoutRef.current = window.setTimeout(() => {
          setShowCelebration(false);
        }, 1500);
      }
    }, 850); // Time to match the animation duration
  };

  // Get last completion date
  const getLastCompletedDate = () => {
    if (localHabit.completedDates.length === 0) return null;
    const sortedDates = [...localHabit.completedDates].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    return sortedDates[0];
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const lastCompleted = getLastCompletedDate();

  // Handle calendar toggle
  const toggleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering toggle habit
    setShowCalendar(!showCalendar);
  };

  // Handle toggle date from calendar with optimistic updates
  const handleToggleDate = (habitId: string, date: Date) => {
    // Create a date string in ISO format for the given date
    const dateString = new Date(date).toISOString();

    // Check if the date is already completed
    const isDateCompleted = localHabit.completedDates.some(
      (d) => new Date(d).toDateString() === date.toDateString()
    );

    // Create a copy of the habit for optimistic updates
    const updatedHabit = { ...localHabit };

    if (isDateCompleted) {
      // Remove the date from completedDates
      updatedHabit.completedDates = updatedHabit.completedDates.filter(
        (d) => new Date(d).toDateString() !== date.toDateString()
      );
    } else {
      // Add the date to completedDates
      updatedHabit.completedDates = [
        ...updatedHabit.completedDates,
        dateString,
      ];
    }

    // Update streak - this is complex logic that should match backend
    // For simplicity, we'll let the backend handle streak calculation for historical dates

    // Immediately update local state with optimistic changes
    setLocalHabit(updatedHabit);

    // Call the API to update in the backend
    toggleHabit(habitId, date);
  };

  // Handle edit request
  const handleEdit = () => {
    // Dispatch a custom event to notify the App component to handle the edit
    document.dispatchEvent(
      new CustomEvent("habit-edit", {
        detail: {
          habitId: localHabit._id,
        },
      })
    );
  };

  // Handle delete request
  const handleDelete = () => {
    // Show the delete confirmation dialog
    setShowConfirmDelete(true);
  };

  // Confirm and execute delete
  const confirmDelete = () => {
    deleteHabit(localHabit._id);
    setShowConfirmDelete(false);
  };

  // Handle reset request
  const handleReset = () => {
    // Show the reset confirmation dialog
    setShowConfirmReset(true);
  };

  // Confirm and execute reset with optimistic updates
  const confirmReset = () => {
    // Create a copy of the habit with reset values
    const resetHabitData = {
      ...localHabit,
      completedDates: [],
      streak: 0,
    };

    // Immediately update local state
    setLocalHabit(resetHabitData);

    // Call API to reset in the backend
    resetHabit(localHabit._id);
    setShowConfirmReset(false);
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "visible",
        zIndex: 1,
        padding: "4px",
        marginTop: "4px",
      }}
      className="habit-card-container"
      data-habit-id={localHabit._id}
    >
      <StyledHabitCard
        className={`styledHabitCard ${isCompleting ? "animating" : ""}`}
        $isCompleting={isCompleting}
        $isCompleted={isCompleted}
        $expanded={showCalendar}
        style={{ overflow: "visible", position: "relative" }}
        data-habit-id={localHabit._id}
      >
        {showCelebration && <Celebration />}

        {/* Menu component with Floating UI - positioned absolutely */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 5,
          }}
        >
          <Menu
            placement="bottom-end"
            trigger={
              <MenuButton aria-label="Options">
                <FaEllipsisV />
              </MenuButton>
            }
          >
            <Menu.Item icon={<FaPencilAlt />} onClick={handleEdit}>
              Edit
            </Menu.Item>
            <Menu.Item icon={<FaSync />} onClick={handleReset}>
              Reset Progress
            </Menu.Item>
            <Menu.Item
              icon={<FaTrash />}
              onClick={handleDelete}
              variant="danger"
            >
              Delete
            </Menu.Item>
          </Menu>
        </div>

        <CardContent onClick={handleToggle}>
          <HabitName
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div>
              {isCompleted ? (
                <LuFlower2 color="#66bb6a" data-testid="flower-icon" />
              ) : isDue ? (
                <LuSprout color="#66bb6a" data-testid="seedling-icon" />
              ) : (
                <LuStar color="#ffcc00" data-testid="star-icon" />
              )}
            </div>
            {localHabit.name}
            <FrequencyBadge>
              {getFrequencyDisplayText(localHabit)}
            </FrequencyBadge>
          </HabitName>
          <HabitMeta>
            {isCompleted ? (
              <span>Completed today{!isDue ? " (bonus)" : ""}</span>
            ) : isDue ? (
              <span>Due today</span>
            ) : (
              <span>Next due {format(nextDue, "MMM d")}</span>
            )}
            <> • Total completions: {totalCompletions}</>
          </HabitMeta>
        </CardContent>

        <CardFooter>
          <ExpandButton onClick={toggleCalendar}>
            {showCalendar ? "Hide History" : "Show History"}
          </ExpandButton>

          <StreakIndicator
            $hasStreak={
              localHabit.streak > 0 && !shouldShowNoStreak(localHabit)
            }
          >
            {localHabit.streak > 0 && !shouldShowNoStreak(localHabit) && (
              <FaFire color="#ff5722" />
            )}
            <span data-testid="streak-text">
              {isDue && !isCompleted
                ? localHabit.completedDates.length > 0
                  ? `Continue your ${localHabit.streak + 1} day streak today!`
                  : "Start a streak!"
                : shouldShowNoStreak(localHabit)
                  ? "No streak yet"
                  : localHabit.streak > 0
                    ? `Streak: ${localHabit.streak} ${localHabit.streak === 1 ? "day" : "days"}`
                    : "No streak yet"}
            </span>
          </StreakIndicator>
        </CardFooter>

        {showCalendar && (
          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <HabitCalendar habit={localHabit} onToggleDate={handleToggleDate} />
          </div>
        )}
      </StyledHabitCard>

      {/* Confirm delete dialog */}
      <Dialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="Delete Habit"
        footer={
          <div
            style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}
          >
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete "{localHabit.name}"?</p>
        <p>This action cannot be undone.</p>
      </Dialog>

      {/* Confirm reset dialog */}
      <Dialog
        isOpen={showConfirmReset}
        onClose={() => setShowConfirmReset(false)}
        title="Reset Habit Progress"
        footer={
          <div
            style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}
          >
            <Button
              variant="secondary"
              onClick={() => setShowConfirmReset(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReset}>
              Reset
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to reset progress for "{localHabit.name}"?</p>
        <p>
          This will clear all completions and your streak. This action cannot be
          undone.
        </p>
      </Dialog>
    </div>
  );
};
