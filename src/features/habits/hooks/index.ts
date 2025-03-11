export * from "./useHabitManager";
export * from "./habitContext";
export * from "./rewardContext";

// Re-export specific components for clarity
import { RewardProvider, useRewards } from "./rewardContext";
export { RewardProvider, useRewards };
