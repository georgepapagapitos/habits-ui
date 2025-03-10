import { Button } from "@components";
import { useHabits } from "@habits/hooks";
import { Habit } from "@habits/types";
import { useState } from "react";

interface EnableRewardBtnProps {
  habit: Habit;
}

export const EnableRewardBtn = ({ habit }: EnableRewardBtnProps) => {
  const { updateHabit } = useHabits();
  const [isUpdating, setIsUpdating] = useState(false);

  const enableReward = async () => {
    setIsUpdating(true);
    try {
      await updateHabit(habit._id, {
        ...habit,
        showReward: true,
      });
      setIsUpdating(false);
    } catch (error) {
      console.error("Error enabling reward:", error);
      setIsUpdating(false);
    }
  };

  if (habit.showReward) {
    return (
      <div style={{ color: "green", padding: "8px 0" }}>✓ Rewards enabled</div>
    );
  }

  return (
    <Button
      onClick={enableReward}
      disabled={isUpdating}
      style={{ margin: "8px 0" }}
    >
      {isUpdating ? "Enabling..." : "Enable Rewards for This Habit"}
    </Button>
  );
};
