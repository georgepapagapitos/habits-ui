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
import { encouragingMessages } from "../../constants/encouragingMessages";
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
  fadeInOut,
} from "./habitCard.styles";

interface HabitCardProps {
  habit: Habit;
  onToggleHabit: (id: string) => void;
  onToggleDate?: (id: string, date: Date) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
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
}: HabitCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null
  );

  // Use the menu manager hook
  const {
    isOpen: showMenu,
    toggleMenu: handleMenuClick,
    closeMenu,
  } = useMenuManager();

  // Function to get a streak message based on the streak length
  const getStreakMessage = (streak: number): string => {
    if (streak >= 10) {
      return "Amazing streak! Keep it going! 🔥";
    } else if (streak >= 7) {
      return "Awesome streak! You're on fire! 🔥";
    } else if (streak >= 3) {
      return "Great streak! Keep up the momentum! 💪";
    } else {
      return "Continue your streak today! 💪";
    }
  };

  // Function to get a random encouraging message
  const getRandomEncouragingMessage = (): string => {
    const messages = encouragingMessages();
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

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

    // Show encouraging message when completing a habit (not when uncompleting)
    if (!isCompleted) {
      setCompletionMessage(getRandomEncouragingMessage());

      // Hide the message after 5 seconds
      setTimeout(() => {
        setCompletionMessage(null);
      }, 5000);
    } else {
      setCompletionMessage(null);
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

  const lastCompleted = getLastCompletedDate();

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

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      <StyledHabitCard
        $isCompleting={isCompleting}
        $isCompleted={isCompleted}
        $expanded={showCalendar}
      >
        {isCompleting && <Celebration />}

        {/* Completion message toast */}
        {completionMessage && (
          <div
            style={{
              position: "absolute",
              top: "-70px",
              left: "0",
              right: "0",
              backgroundColor: "#4ECB71",
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              zIndex: 10,
              textAlign: "center",
              maxWidth: "90%",
              margin: "0 auto",
              fontSize: "14px",
            }}
          >
            {completionMessage}
          </div>
        )}

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
                  : `🌈` // Not due today
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
          </HabitMeta>
        </CardContent>

        <CardFooter>
          <ExpandButton onClick={toggleCalendar}>
            {showCalendar ? "Hide History" : "Show History"}
          </ExpandButton>

          {/* Enhanced streak display with encouraging message */}
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

          {/* Encouraging streak message when on a streak */}
          {(habit.streak > 0 || (lastCompleted && isDue && !isCompleted)) &&
            isDue &&
            !isCompleted && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#4ECB71",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                {habit.streak > 0
                  ? getStreakMessage(habit.streak)
                  : "Keep your momentum going!"}
              </div>
            )}
        </CardFooter>

        {showCalendar && (
          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <HabitCalendar habit={habit} onToggleDate={handleToggleDate} />
          </div>
        )}
      </StyledHabitCard>

      {/* New Dialog component */}
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
    </div>
  );
};
