import { HabitForm, HabitList, RewardGallery, Stats } from "@habits/components";
import { useHabits } from "@habits/hooks";
import { TimeOfDay, WeekDay } from "@habits/types";
import { BottomNav, Header, Messages, Modal } from "@layout/components";
import { useState } from "react";
import { AddButton, Container, Content } from "./app.styles";
import { LuPlus } from "react-icons/lu";

type HabitFormData = {
  name: string;
  frequency: WeekDay[];
  description?: string;
  timeOfDay?: TimeOfDay;
  showReward?: boolean;
};

type ScreenType = "habits" | "rewards" | "stats";

// Helper to get initial screen from localStorage or default to "today"
const getInitialScreen = (): ScreenType => {
  const savedScreen = localStorage.getItem("activeScreen");
  // Only use the saved screen if it's a valid ScreenType
  if (
    savedScreen === "habits" ||
    savedScreen === "rewards" ||
    savedScreen === "stats"
  ) {
    return savedScreen as ScreenType;
  }
  return "habits";
};

export const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeScreen, setActiveScreen] =
    useState<ScreenType>(getInitialScreen);
  const [habitToEdit, setHabitToEdit] = useState<null | {
    _id: string;
    name: string;
    frequency: WeekDay[];
    description?: string;
    timeOfDay?: TimeOfDay;
  }>(null);

  // Use the habit context
  const { habits, handleAddHabit, updateHabit } = useHabits();

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

  // This function is used by HabitCard components via a context
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleScreenChange = (screen: ScreenType) => {
    setActiveScreen(screen);
    localStorage.setItem("activeScreen", screen);
  };

  // Render the appropriate screen content based on active screen
  const renderScreenContent = () => {
    switch (activeScreen) {
      case "stats":
        return <Stats />;
      case "rewards":
        return <RewardGallery />;
      case "habits":
      default:
        return <HabitList />;
    }
  };

  // Get the title for the header based on active screen
  const getHeaderTitle = () => {
    switch (activeScreen) {
      case "stats":
        return "Statistics";
      case "rewards":
        return "Photo Rewards";
      case "habits":
      default:
        return "Habits";
    }
  };

  return (
    <>
      <Header title={getHeaderTitle()} />
      <Container>
        <Content>{renderScreenContent()}</Content>
      </Container>
      {/* Only show the add button for Today screen */}
      {activeScreen === "habits" && (
        <AddButton onClick={openModal} aria-label="Add habit">
          <LuPlus size={24} />
        </AddButton>
      )}
      <BottomNav
        activeScreen={activeScreen}
        onScreenChange={handleScreenChange}
      />
      {isModalOpen && renderHabitFormModal()}
      {isEditModalOpen && renderEditHabitFormModal()}
      <Messages />
    </>
  );
};
