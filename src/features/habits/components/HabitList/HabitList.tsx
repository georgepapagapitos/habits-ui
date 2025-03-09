import { HabitCard } from "@habits/components";
import { useHabits } from "@habits/hooks";
import { List } from "./habitList.styles";

export const HabitList = () => {
  const { habits, loading, error } = useHabits();

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
        <HabitCard key={habit._id} habit={habit} />
      ))}
    </List>
  );
};
