import { format } from "date-fns";
import { useState } from "react";
import { Button } from "../../../../common/components/Button";
import { Dialog } from "../../../../common/components/Dialog";
import { useMenuManager } from "../../../../common/hooks";
import { Habit } from "../../types";
import {
  getFrequencyDisplayText,
  getNextDueDate,
  isCompletedToday,
  isHabitDueToday,
} from "../../utils";
import { celebrationColors } from "../../utils/habitColors";
import { HabitCalendar } from "../HabitCalendar";
import {
  CardContent,
  CardFooter,
  ConfettiPiece,
  ContextMenu,
  ExpandButton,
  FrequencyBadge,
  HabitMeta,
  HabitName,
  MenuButton,
  MenuItem,
  StyledHabitCard,
} from "./habitCard.styles";

interface HabitCardProps {
  habit: Habit;
  onToggleHabit: (id: string) => void;
  onToggleDate?: (id: string, date: Date) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReset?: (id: string) => void;
}

const Celebration = () => {
  return (
    <>
      {[...Array(12)].map((_, i) => (
        <ConfettiPiece
          key={i}
          color={celebrationColors[i % celebrationColors.length]}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.2}s`,
          }}
        />
      ))}
    </>
  );
};

export const HabitCard = ({
  habit,
  onToggleHabit,
  onToggleDate,
  onDelete,
  onEdit,
  onReset,
}: HabitCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Use the menu manager hook
  const {
    isOpen: showMenu,
    toggleMenu: handleMenuClick,
    closeMenu,
  } = useMenuManager();

  const isDue = isHabitDueToday(habit);
  const nextDue = getNextDueDate(habit);
  const isCompleted = isCompletedToday(habit);

  // Handle toggle with animation internally
  const handleToggle = () => {
    // Only allow toggling if it's due today (or toggling off if already completed)
    if (!isDue && !isCompleted) {
      // Provide subtle feedback that the habit isn't due today
      if ("vibrate" in navigator) {
        navigator.vibrate([20, 30, 20]); // Different vibration pattern for "not due"
      }
      return;
    }

    // Set animation state
    setIsCompleting(true);

    // Haptic feedback for successful toggle
    if ("vibrate" in navigator) {
      navigator.vibrate(100);
    }

    // Call the parent handler with the habit ID
    onToggleHabit(habit._id);

    // Reset the animation state after the animation completes
    setTimeout(() => {
      setIsCompleting(false);
    }, 600);
  };

  // Get the latest completed date for display
  const getLastCompletedDate = () => {
    if (habit.completedDates.length === 0) return null;

    // Sort dates in descending order
    const sortedDates = [...habit.completedDates]
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());

    return sortedDates[0];
  };

  // Get total number of completions
  const getTotalCompletions = () => {
    return habit.completedDates.length;
  };

  const lastCompleted = getLastCompletedDate();
  const totalCompletions = getTotalCompletions();

  // Handle calendar toggle
  const toggleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowCalendar(!showCalendar);
  };

  // Handle date toggling in calendar
  const handleToggleDate = (habitId: string, date: Date) => {
    if (onToggleDate) {
      onToggleDate(habitId, date);
    }
  };

  // Handle edit request
  const handleEdit = () => {
    closeMenu();
    if (onEdit) {
      onEdit(habit._id);
    }
  };

  // Handle delete request
  const handleDelete = () => {
    closeMenu();
    setShowConfirmDelete(true);
  };

  // Confirm and execute delete
  const confirmDelete = () => {
    if (onDelete) {
      onDelete(habit._id);
    }
    setShowConfirmDelete(false);
  };

  // Handle reset request
  const handleReset = () => {
    closeMenu();
    setShowConfirmReset(true);
  };

  // Confirm and execute reset
  const confirmReset = () => {
    if (onReset) {
      onReset(habit._id);
    }
    setShowConfirmReset(false);
  };

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      <StyledHabitCard
        $isCompleting={isCompleting}
        $isCompleted={isCompleted}
        $expanded={showCalendar}
      >
        {isCompleting && <Celebration />}

        <MenuButton
          onClick={handleMenuClick}
          aria-label="Options"
          className="menu-button"
        >
          ⋮
        </MenuButton>

        {/* Context menu */}
        {showMenu && (
          <ContextMenu className="context-menu">
            {onEdit && (
              <MenuItem onClick={handleEdit}>
                <span style={{ fontSize: "14px" }}>✏️</span> Edit
              </MenuItem>
            )}
            {onReset && (
              <MenuItem onClick={handleReset}>
                <span style={{ fontSize: "14px" }}>🔄</span> Reset Progress
              </MenuItem>
            )}
            {onDelete && (
              <MenuItem className="delete" onClick={handleDelete}>
                <span style={{ fontSize: "14px" }}>🗑️</span> Delete
              </MenuItem>
            )}
          </ContextMenu>
        )}

        <CardContent onClick={handleToggle}>
          <HabitName
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div>
              {
                isDue
                  ? isCompleted
                    ? `🌻` // Completed today
                    : `🌱` // Due but not completed
                  : `💤` // Not due today
              }
            </div>
            {habit.name}
            <FrequencyBadge>{getFrequencyDisplayText(habit)}</FrequencyBadge>
          </HabitName>
          <HabitMeta>
            {isDue ? (
              isCompleted ? (
                <span>Completed today</span>
              ) : (
                <span>Due today</span>
              )
            ) : (
              <span>Next due {format(nextDue, "MMM d")}</span>
            )}
            {lastCompleted && (!isDue || !isCompleted) && (
              <> • Last completed {format(new Date(lastCompleted), "MMM d")}</>
            )}
            <> • Total completions: {totalCompletions}</>
          </HabitMeta>
        </CardContent>

        <CardFooter>
          <ExpandButton onClick={toggleCalendar}>
            {showCalendar ? "Hide History" : "Show History"}
          </ExpandButton>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color:
                habit.streak > 0 || (lastCompleted && isDue && !isCompleted)
                  ? "#4ECB71"
                  : "inherit",
            }}
          >
            {(habit.streak > 0 || (lastCompleted && isDue && !isCompleted)) && (
              <span>🔥</span>
            )}
            <span>
              {habit.streak > 0
                ? `Streak: ${habit.streak} ${habit.streak === 1 ? "day" : "days"}`
                : lastCompleted && isDue && !isCompleted
                  ? "Continue your streak today!"
                  : "Start a streak!"}
            </span>
          </div>
        </CardFooter>

        {showCalendar && (
          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <HabitCalendar habit={habit} onToggleDate={handleToggleDate} />
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
        <p>Are you sure you want to delete "{habit.name}"?</p>
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
        <p>Are you sure you want to reset progress for "{habit.name}"?</p>
        <p>
          This will clear all completions and your streak. This action cannot be
          undone.
        </p>
      </Dialog>
    </div>
  );
};
