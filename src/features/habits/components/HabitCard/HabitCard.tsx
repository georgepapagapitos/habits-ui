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
import {
  ConfettiPiece,
  FrequencyBadge,
  HabitMeta,
  HabitName,
  StyledHabitCard,
  ExpandButton,
  CardContent,
  CardFooter,
} from "./habitCard.styles";

interface HabitCardProps {
  habit: Habit;
  onToggleHabit: (id: string) => void;
  onToggleDate?: (id: string, date: Date) => void;
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
}: HabitCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

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

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      <StyledHabitCard
        $isCompleting={isCompleting}
        $isCompleted={isCompleted}
        $expanded={showCalendar}
      >
        {isCompleting && <Celebration />}

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
    </div>
  );
};
