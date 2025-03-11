import { Button, Form, Group, Input, Label, Title } from "@components";
import { TimeOfDay, WeekDay } from "@habits/types";
import { useState } from "react";
import { logger } from "@utils/logger";
import { DayButton, FormGroup, Select, StyledSelect } from "./habitForm.styles";

interface HabitFormProps {
  onSubmit: (habit: {
    name: string;
    frequency: WeekDay[];
    description?: string;
    timeOfDay?: TimeOfDay;
  }) => void;
  onClose: () => void;
  initialData?: {
    _id?: string;
    name: string;
    frequency: WeekDay[];
    description?: string;
    timeOfDay?: TimeOfDay;
  };
  isEditing?: boolean;
}

export const HabitForm = ({
  onSubmit,
  onClose,
  initialData,
  isEditing = false,
}: HabitFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    initialData?.timeOfDay || "anytime"
  );
  // showReward state removed - rewards are now automatic for all habits

  // Determine initial frequency type based on the provided frequency array
  const determineFrequencyType = (frequency: WeekDay[] = []): string => {
    if (!frequency || frequency.length === 0) {
      return "daily";
    }

    const allDays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const weekends = ["saturday", "sunday"];

    if (
      frequency.length === 7 &&
      allDays.every((day) => frequency.includes(day as WeekDay))
    ) {
      return "daily";
    } else if (
      frequency.length === 5 &&
      weekdays.every((day) => frequency.includes(day as WeekDay))
    ) {
      return "weekdays";
    } else if (
      frequency.length === 2 &&
      weekends.every((day) => frequency.includes(day as WeekDay))
    ) {
      return "weekends";
    } else {
      return "weekly";
    }
  };

  const [frequencyType, setFrequencyType] = useState(
    initialData ? determineFrequencyType(initialData.frequency) : "daily"
  );

  // For weekly frequency selection
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>(
    initialData && determineFrequencyType(initialData.frequency) === "weekly"
      ? initialData.frequency
      : []
  );

  // Handle day selection for weekly frequency
  const toggleDay = (day: WeekDay) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert frequencyType to actual frequency array
    let frequency: WeekDay[] = [];

    switch (frequencyType) {
      case "daily":
        // All 7 days of the week
        frequency = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        break;
      case "weekdays":
        // Monday through Friday
        frequency = ["monday", "tuesday", "wednesday", "thursday", "friday"];
        break;
      case "weekends":
        // Saturday and Sunday
        frequency = ["saturday", "sunday"];
        break;
      case "weekly":
        // Use selectedDays
        frequency = selectedDays;
        break;
      default:
        // Default to daily if something unexpected happens
        frequency = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
    }

    const habitData = {
      name,
      frequency,
      description: description || undefined,
      timeOfDay,
    };

    logger.debug("Submitting habit data:", habitData);

    onSubmit(habitData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>{isEditing ? "Edit Habit" : "New Habit"}</Title>

      <Group>
        <Label htmlFor="name" required>
          Habit Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter habit name"
          required
        />
      </Group>

      <Group>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description"
        />
      </Group>

      <Group>
        <Label htmlFor="frequency" required>
          Frequency
        </Label>
        <StyledSelect
          id="frequency"
          value={frequencyType}
          onChange={(e) => setFrequencyType(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays (Mon-Fri)</option>
          <option value="weekends">Weekends (Sat-Sun)</option>
          <option value="weekly">Custom Days</option>
        </StyledSelect>
      </Group>

      {frequencyType === "weekly" && (
        <Group>
          <Label htmlFor="days-selection">Select Days</Label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {(
              [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
              ] as WeekDay[]
            ).map((day) => (
              <DayButton
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                $selected={selectedDays.includes(day)}
              >
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </DayButton>
            ))}
          </div>
          {selectedDays.length === 0 && (
            <div style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
              Please select at least one day
            </div>
          )}
        </Group>
      )}

      <FormGroup>
        <Label htmlFor="timeOfDay">Time of Day</Label>
        <Select
          id="timeOfDay"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
        >
          <option value="anytime">Anytime</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </Select>
      </FormGroup>

      {/* Show reward checkbox removed - rewards are now automatic */}

      <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
        <Button
          type="submit"
          disabled={frequencyType === "weekly" && selectedDays.length === 0}
        >
          {isEditing ? "Update Habit" : "Create Habit"}
        </Button>
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};
