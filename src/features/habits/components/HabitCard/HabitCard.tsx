import { format } from "date-fns";
import { useState, useEffect } from "react";
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
  ConfirmDialog,
  DialogContent,
  DialogTitle,
  ButtonGroup,
  CancelButton,
  DeleteConfirmButton,
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
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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

  // Handle opening the menu
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card toggle
    setShowMenu(!showMenu);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cast event.target to Element to use the closest method
      const target = event.target as Element;
      
      // If the click is outside the menu and the menu button
      if (showMenu && !target.closest(".menu-button") && !target.closest(".context-menu")) {
        setShowMenu(false);
      }
    };

    // Add event listener when menu is open
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Handle edit request
  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(habit._id);
    }
  };

  // Handle delete request
  const handleDelete = () => {
    setShowMenu(false);
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

        {/* Menu button */}
        <MenuButton 
          onClick={handleMenuClick}
          aria-label="Options"
          className="menu-button"
        >
          <span style={{ 
            fontSize: "20px", 
            fontWeight: "bold",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
          }}>⋮</span>
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
          <HabitCalendar habit={habit} onToggleDate={handleToggleDate} />
        )}
      </StyledHabitCard>

      {/* Confirmation dialog */}
      {showConfirmDelete && (
        <ConfirmDialog>
          <DialogContent>
            <DialogTitle>Delete Habit</DialogTitle>
            <p>Are you sure you want to delete "{habit.name}"?</p>
            <p>This action cannot be undone.</p>
            <ButtonGroup>
              <CancelButton onClick={() => setShowConfirmDelete(false)}>
                Cancel
              </CancelButton>
              <DeleteConfirmButton onClick={confirmDelete}>
                Delete
              </DeleteConfirmButton>
            </ButtonGroup>
          </DialogContent>
        </ConfirmDialog>
      )}
    </div>
  );
};
