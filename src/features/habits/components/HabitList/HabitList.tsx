import { Habit } from "../../types";
import { HabitCard } from "../HabitCard";
import { List } from "./habitList.styles";

interface HabitListProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onToggleDate?: (id: string, date: Date) => void;
  onDeleteHabit?: (id: string) => void;
  onEditHabit?: (id: string) => void;
  onResetHabit?: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const HabitList = ({
  habits,
  onToggleHabit,
  onToggleDate,
  onDeleteHabit,
  onEditHabit,
  onResetHabit,
  loading = false,
  error = null,
}: HabitListProps) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Loading habits...</p>
      </div>
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

  return (
    <List>
      {habits.map((habit) => (
        <HabitCard
          key={habit._id}
          habit={habit}
          onToggleHabit={onToggleHabit}
          onToggleDate={onToggleDate}
          onDelete={onDeleteHabit}
          onEdit={onEditHabit}
          onReset={onResetHabit}
        />
      ))}
    </List>
  );
};
