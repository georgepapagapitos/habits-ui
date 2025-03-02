import { format } from "date-fns";
import { useState } from "react";
import { Habit } from "../../types";
import {
  getFrequencyDisplayText,
  getNextDueDate,
  isCompletedToday,
  isHabitDueToday,
} from "../../utils";
import { celebrationColors } from "../../utils/habitColors";
import { HabitCalendar } from "../HabitCalendar";
import { Button } from "../../../../common/components/Button";
import { Dialog } from "../../../../common/components/Dialog";
import { useMenuManager } from "../../../../common/hooks";
import {
  ConfettiPiece,
  FrequencyBadge,
  HabitMeta,
  HabitName,
  StyledHabitCard,
  ExpandButton,
  CardContent,
  CardFooter,
  MenuButton,
  ContextMenu,
  MenuItem,
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
    if (!isDue) return;

    setIsCompleting(true);

    if ("vibrate" in navigator) {
      navigator.vibrate(100);
    }

    // Call the parent handler with the habit ID
    onToggleHabit(habit._id);

    // Reset the animation state after a delay
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
            <div>{isDue ? `🌱` : `🌻`}</div>
            {habit.name}
            <FrequencyBadge>{getFrequencyDisplayText(habit)}</FrequencyBadge>
          </HabitName>
          <HabitMeta>
            {isDue ? (
              <span>Due today</span>
            ) : (
              <span>Next due {format(nextDue, "MMM d")}</span>
            )}
            {lastCompleted && (
              <> • Last completed {format(new Date(lastCompleted), "MMM d")}</>
            )}
          </HabitMeta>
        </CardContent>

        <CardFooter>
          <ExpandButton onClick={toggleCalendar}>
            {showCalendar ? "Hide History" : "Show History"}
          </ExpandButton>

          {/* Show current streak */}
          <div>
            Streak: {habit.streak} {habit.streak === 1 ? "day" : "days"}
          </div>
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
