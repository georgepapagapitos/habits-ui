import { useState } from "react";
import { HabitForm, HabitList } from "../features/habits/components";
import { useHabitManager } from "../features/habits/hooks/useHabitManager";
import { WeekDay } from "../features/habits/types";
import { BottomNav, Header, Messages, Modal } from "../layout/components";
import { AddButton, Container, Content } from "./app.styles";

type HabitFormData = {
  name: string;
  frequency: WeekDay[];
  description?: string;
  timeOfDay?: string;
};

export const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    habits,
    loading,
    error,
    messages,
    handleAddHabit,
    toggleHabit,
    refreshHabits,
  } = useHabitManager();

  const onSubmitHabit = ({
    name,
    frequency,
    description,
    timeOfDay,
  }: HabitFormData) => {
    handleAddHabit({
      name,
      frequency,
      description,
      timeOfDay,
    });
    setIsModalOpen(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const renderHabitFormModal = () => (
    <Modal onClose={closeModal}>
      <HabitForm onSubmit={onSubmitHabit} onClose={closeModal} />
    </Modal>
  );

  // Handle toggling habit for specific date
  const handleToggleDate = async (habitId: string, date: Date) => {
    try {
      // This will make an API call to toggle the completion for the specified date
      await toggleHabit(habitId, date);

      // Refresh habits list to get updated data
      await refreshHabits();
    } catch (error) {
      console.error("Error toggling habit for date:", error);
    }
  };

  return (
    <>
      <Header title="Hannah's Habits" />
      <Container>
        <Content>
          <HabitList
            habits={habits}
            onToggleHabit={toggleHabit}
            onToggleDate={handleToggleDate}
            loading={loading}
            error={error}
          />
        </Content>
      </Container>
      <AddButton onClick={openModal}>+</AddButton>
      <BottomNav />
      {isModalOpen && renderHabitFormModal()}
      <Messages messages={messages} />
    </>
  );
};
