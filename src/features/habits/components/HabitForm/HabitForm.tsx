import { useState } from "react";
import { WeekDay } from "../../types";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  SecondaryButton,
  Select,
} from "./habitForm.styles";

interface HabitFormProps {
  onSubmit: (habit: {
    name: string;
    frequency: WeekDay[];
    description?: string;
    timeOfDay?: string;
  }) => void;
  onClose: () => void;
  initialData?: {
    _id?: string;
    name: string;
    frequency: WeekDay[];
    description?: string;
    timeOfDay?: string;
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
  const [timeOfDay, setTimeOfDay] = useState(
    initialData?.timeOfDay || "anytime"
  );

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

    onSubmit({
      name,
      frequency,
      description: description || undefined,
      timeOfDay,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 style={{ color: "#480733" }}>
        {isEditing ? "Edit Habit" : "New Habit"}
      </h2>

      <FormGroup>
        <Label htmlFor="name">Habit Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter habit name"
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="frequency">Frequency</Label>
        <Select
          id="frequency"
          value={frequencyType}
          onChange={(e) => setFrequencyType(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays (Mon-Fri)</option>
          <option value="weekends">Weekends (Sat-Sun)</option>
          <option value="weekly">Custom Days</option>
        </Select>
      </FormGroup>

      {frequencyType === "weekly" && (
        <FormGroup>
          <Label>Select Days</Label>
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
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  background: selectedDays.includes(day) ? "#480733" : "white",
                  color: selectedDays.includes(day) ? "white" : "#333",
                  cursor: "pointer",
                }}
              >
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </button>
            ))}
          </div>
          {selectedDays.length === 0 && (
            <div style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
              Please select at least one day
            </div>
          )}
        </FormGroup>
      )}

      <FormGroup>
        <Label htmlFor="timeOfDay">Time of Day</Label>
        <Select
          id="timeOfDay"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
        >
          <option value="anytime">Anytime</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </Select>
      </FormGroup>

      <Button
        type="submit"
        disabled={frequencyType === "weekly" && selectedDays.length === 0}
      >
        {isEditing ? "Update Habit" : "Create Habit"}
      </Button>
      <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
    </Form>
  );
};
