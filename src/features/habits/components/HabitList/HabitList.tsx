import { HabitCard } from "@habits/components";
import { Spinner } from "@components/Spinner";
import { useHabits } from "@habits/hooks";
import {
  getNextDueDate,
  isCompletedToday,
  isHabitDueToday,
} from "@habits/utils";
import { List, LoadingContainer } from "./habitList.styles";

export const HabitList = () => {
  const { habits, loading, error } = useHabits();

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner label="Loading habits" />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#e74c3c" }}>
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>You don't have any habits yet!</p>
        <p>Add your first habit using the button below.</p>
      </div>
    );
  }

  // Sort habits according to priority:
  // 1. Due today and not completed (top priority)
  // 2. Not due today, sorted by next due date
  // 3. Completed habits (lowest priority)
  const sortedHabits = [...habits].sort((a, b) => {
    const aIsDueToday = isHabitDueToday(a);
    const bIsDueToday = isHabitDueToday(b);
    const aIsCompletedToday = isCompletedToday(a);
    const bIsCompletedToday = isCompletedToday(b);

    // First priority: due today and not completed
    if (
      aIsDueToday &&
      !aIsCompletedToday &&
      (!bIsDueToday || bIsCompletedToday)
    ) {
      return -1;
    }
    if (
      bIsDueToday &&
      !bIsCompletedToday &&
      (!aIsDueToday || aIsCompletedToday)
    ) {
      return 1;
    }

    // Second priority: completed habits go to the bottom
    if (aIsCompletedToday && !bIsCompletedToday) {
      return 1;
    }
    if (bIsCompletedToday && !aIsCompletedToday) {
      return -1;
    }

    // Third priority: sort by next due date
    const aNextDue = getNextDueDate(a);
    const bNextDue = getNextDueDate(b);

    return aNextDue.getTime() - bNextDue.getTime();
  });

  return (
    <List>
      {sortedHabits.map((habit) => (
        <HabitCard key={habit._id} habit={habit} />
      ))}
    </List>
  );
};
