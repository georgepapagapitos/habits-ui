import { useState } from "react";
import { HabitForm, HabitList } from "../features/habits/components";
import { useHabitManager } from "../features/habits/hooks/useHabitManager";
import { TimeOfDay, WeekDay } from "../features/habits/types";
import { BottomNav, Header, Messages, Modal } from "../layout/components";
import { AddButton, Container, Content } from "./app.styles";

type HabitFormData = {
  name: string;
  frequency: WeekDay[];
  description?: string;
  timeOfDay?: TimeOfDay;
};

export const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<null | {
    _id: string;
    name: string;
    frequency: WeekDay[];
    description?: string;
    timeOfDay?: TimeOfDay;
  }>(null);

  const {
    habits,
    loading,
    error,
    messages,
    handleAddHabit,
    toggleHabit,
    deleteHabit,
    updateHabit,
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

  // Render the form modal for creating a new habit
  const renderHabitFormModal = () => (
    <Modal onClose={closeModal}>
      <HabitForm onSubmit={onSubmitHabit} onClose={closeModal} />
    </Modal>
  );

  // Render the form modal for editing an existing habit
  const renderEditHabitFormModal = () => (
    <Modal onClose={closeEditModal}>
      <HabitForm
        onSubmit={handleEditSubmit}
        onClose={closeEditModal}
        initialData={habitToEdit || undefined}
        isEditing={true}
      />
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

  // Handle habit deletion
  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      // No need to refresh, the habit state is updated in useHabitManager hook
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  // Handle habit editing - open the edit modal with the selected habit data
  const handleEditHabit = (habitId: string) => {
    const habit = habits.find((h) => h._id === habitId);
    if (habit) {
      setHabitToEdit({
        _id: habit._id,
        name: habit.name,
        frequency: habit.frequency,
        description: habit.description,
        timeOfDay: habit.timeOfDay,
      });
      setIsEditModalOpen(true);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async ({
    name,
    frequency,
    description,
    timeOfDay,
  }: HabitFormData) => {
    if (habitToEdit) {
      try {
        await updateHabit(habitToEdit._id, {
          name,
          frequency,
          description,
          timeOfDay: timeOfDay,
        });

        // Close the modal after successful update
        setIsEditModalOpen(false);
        setHabitToEdit(null);
      } catch (error) {
        console.error("Error updating habit:", error);
      }
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setHabitToEdit(null);
  };

  return (
    <>
      <Header title="Habits" />
      <Container>
        <Content>
          <HabitList
            habits={habits}
            onToggleHabit={toggleHabit}
            onToggleDate={handleToggleDate}
            onDeleteHabit={handleDeleteHabit}
            onEditHabit={handleEditHabit}
            loading={loading}
            error={error}
          />
        </Content>
      </Container>
      <AddButton onClick={openModal}>+</AddButton>
      <BottomNav />
      {isModalOpen && renderHabitFormModal()}
      {isEditModalOpen && renderEditHabitFormModal()}
      <Messages messages={messages} />
    </>
  );
};
