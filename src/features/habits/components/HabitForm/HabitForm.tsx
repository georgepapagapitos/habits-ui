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
}

export const HabitForm = ({ onSubmit, onClose }: HabitFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyType, setFrequencyType] = useState("daiy");
  const [timeOfDay, setTimeOfDay] = useState("anytime");

  // For weekly frequence selection
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);

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
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
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
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
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
      <h2 style={{ color: "#480733" }}>New Habit</h2>

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
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
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
        Create Habit
      </Button>
      <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
    </Form>
  );
};
