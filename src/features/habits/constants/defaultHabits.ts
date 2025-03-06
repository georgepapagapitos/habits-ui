import { HabitCreateDTO } from "@habits/types";

// These are used for initial seeding when no habits exist
export const defaultHabitsDTO: HabitCreateDTO[] = [
  {
    name: "Drink 8 glasses of water",
    description: "Stay hydrated throughout the day",
    color: "#3498db",
    icon: "droplet",
    frequency: [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ],
    timeOfDay: "anytime",
    startDate: new Date(),
  },
  {
    name: "Exercise for 30 minutes",
    description: "Any form of physical activity",
    color: "#e74c3c",
    icon: "activity",
    frequency: ["monday", "wednesday", "friday"],
    timeOfDay: "morning",
    startDate: new Date(),
  },
  {
    name: "Read a book",
    description: "At least 20 pages",
    color: "#9b59b6",
    icon: "book",
    frequency: [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ],
    timeOfDay: "evening",
    startDate: new Date(),
  },
];
