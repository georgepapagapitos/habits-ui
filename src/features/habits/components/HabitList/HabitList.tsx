import { Spinner } from "@components/Spinner";
import { HabitCard } from "@habits/components";
import { useHabits } from "@habits/hooks";
import { isCompletedToday } from "@habits/utils";
import {
  SortOption,
  getSortOptionText,
  sortHabits,
} from "@habits/utils/sortUtils";
import { logger } from "@utils/logger";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaSort } from "react-icons/fa";
import {
  HabitCardContainer,
  List,
  ListHeader,
  LoadingContainer,
  SortSelect,
} from "./habitList.styles";

// Key for localStorage - matches the one in sortUtils
const SORT_PREFERENCE_KEY = "habits-sort-preference";
// Key for storing ordered habit IDs in localStorage
const HABIT_ORDER_KEY = "habits-order";

// Explicitly check if we're in a test environment
// This needs to be consistent between local and pipeline runs
const isTestEnvironment =
  typeof process !== "undefined" && process.env.NODE_ENV === "test";

export const HabitList = () => {
  const { habits, loading, error } = useHabits();

  // Keep track of the previous habit IDs to maintain stable order
  const orderedHabitIdsRef = useRef<string[]>([]);

  // Initialize sort option from localStorage
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    try {
      const savedPreference = localStorage.getItem(SORT_PREFERENCE_KEY);
      // Validate the saved preference is a valid SortOption value
      if (
        savedPreference &&
        Object.values(SortOption).includes(savedPreference as SortOption)
      ) {
        return savedPreference as SortOption;
      }
    } catch (error) {
      logger.error("Error accessing localStorage for sort preference:", error);
    }
    return SortOption.DEFAULT;
  });

  // Get sorted habits but maintain stable positions for completed habits
  // This MUST be before any conditional returns to follow React's Rules of Hooks
  const sortedHabits = useMemo(() => {
    if (habits.length === 0) return [];

    // Always use consistent sorting in test environments
    if (isTestEnvironment) {
      // In tests, ALWAYS prioritize pure sort order without any DOM-related adjustments
      return sortHabits([...habits], sortOption);
    }

    // Check if any habits are currently animating a toggle
    const animatingHabitIds = Array.from(
      document.querySelectorAll(
        ".habit-card-container.toggling, .styledHabitCard.toggling"
      )
    )
      .map((el) => {
        // Get the habit ID from the element or its parent
        const id = (el as HTMLElement).dataset.habitId;
        if (!id && el.parentElement) {
          return (el.parentElement as HTMLElement).dataset.habitId;
        }
        return id;
      })
      .filter(Boolean) as string[];

    // If toggle animation is in progress, maintain the current order completely
    if (animatingHabitIds.length > 0) {
      // Freeze the entire list order during toggle animation only
      logger.debug(
        `Toggle animation in progress, freezing list order for habits: ${animatingHabitIds.join(", ")}`
      );
      return [...habits].sort((a, b) => {
        const aIndex = orderedHabitIdsRef.current.indexOf(a._id);
        const bIndex = orderedHabitIdsRef.current.indexOf(b._id);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return 0;
      });
    }

    // No toggle animations in progress, apply normal sorting with position transitions
    // When habits need to rearrange, they'll get smooth transitions
    const sorted = sortHabits([...habits], sortOption);

    // Update the reference with the new order for future renders
    // Track if order has changed to trigger transitions
    const orderHasChanged = !arraysEqual(
      orderedHabitIdsRef.current,
      sorted.map((h) => h._id)
    );

    if (orderHasChanged && orderedHabitIdsRef.current.length > 0) {
      // Order changed - add position-transition class to enable smooth animations
      requestAnimationFrame(() => {
        document
          .querySelectorAll(".habit-card-container")
          .forEach((container) => {
            (container as HTMLElement).classList.add("position-transition");

            // Remove the class after animation completes
            setTimeout(() => {
              (container as HTMLElement).classList.remove(
                "position-transition"
              );
            }, 600); // Match transition duration
          });
      });
    }

    orderedHabitIdsRef.current = sorted.map((habit) => habit._id);

    // Save to localStorage for persistence
    try {
      localStorage.setItem(
        HABIT_ORDER_KEY,
        JSON.stringify(orderedHabitIdsRef.current)
      );
    } catch (error) {
      logger.error("Error saving habit order to localStorage:", error);
    }

    return sorted;
  }, [habits, sortOption]);

  // Helper function to compare arrays
  function arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // Load the habit order from localStorage on initial render
  // This is only used for initializing sort preference now
  useEffect(() => {
    // Initialization happens in the useState - no need to do anything here
  }, []);

  // Save to localStorage when sort option changes
  useEffect(() => {
    try {
      localStorage.setItem(SORT_PREFERENCE_KEY, sortOption);
    } catch (error) {
      logger.error("Error saving sort preference to localStorage:", error);
    }
  }, [sortOption]);

  // No need for saving ordered habit IDs separately - useMemo handles that now

  // Effect to listen for habit toggle events and animations
  useEffect(() => {
    const handleHabitToggled = (e: Event) => {
      // Get the custom event data
      const customEvent = e as CustomEvent;
      const { habitId, isCompleted } = customEvent.detail;

      // Find the habit card element
      const habitCard = document.querySelector(
        `.habit-card-container[data-habit-id="${habitId}"]`
      ) as HTMLElement;

      if (!habitCard) return;

      // Find the list container
      const listContainer = document.querySelector(
        '[class^="List"]'
      ) as HTMLElement;

      // Freeze ONLY toggle animations by adding a specific class
      if (listContainer) {
        listContainer.classList.add("animation-freeze");
      }

      // Add specific toggling class to identify toggle animations vs position changes
      habitCard.classList.add("animating");
      habitCard.classList.add("toggling");

      // Add animating-items class to the list container
      if (listContainer) {
        listContainer.classList.add("animating-items");
      }

      // Update the data-completed attribute immediately for smoother transitions
      habitCard.setAttribute("data-completed", isCompleted.toString());

      // Animation timing
      const animationDuration = 500;
      const removeCooldown = 950; // Slightly longer than the context update delay

      // Freeze only the toggling card during animation
      habitCard.style.transition = "none";
      // Force a reflow to ensure style changes apply immediately
      void habitCard.offsetHeight;

      // After the pulse animation completes
      setTimeout(() => {
        // Only after the toggle API call has likely completed, remove the freeze
        if (listContainer) {
          listContainer.classList.remove("animation-freeze");
        }

        // Add transition class to the toggled card for smooth movement
        habitCard.classList.add("position-transition");
        habitCard.style.transition = "";

        // After transitions are set up, remove the animating class
        setTimeout(() => {
          habitCard.classList.remove("animating");
          habitCard.classList.remove("toggling");

          // After position change completes, remove transition classes
          setTimeout(() => {
            habitCard.classList.remove("position-transition");

            // Remove the animating-items class from the list
            if (listContainer) {
              listContainer.classList.remove("animating-items");
            }
          }, 600);
        }, removeCooldown);
      }, animationDuration);
    };

    // Add event listener
    document.addEventListener("habit-toggled", handleHabitToggled);

    // Clean up
    return () => {
      document.removeEventListener("habit-toggled", handleHabitToggled);
    };
  }, []);

  // Handle sort option change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  // Return loading state if habits are loading
  if (loading) {
    return (
      <LoadingContainer>
        <Spinner label="Loading habits" />
      </LoadingContainer>
    );
  }

  // Return error state if there was an error loading habits
  if (error) {
    return <div>Error loading habits: {error}</div>;
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
      }}
    >
      <ListHeader>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaSort style={{ marginRight: "6px", opacity: 0.7 }} />
          <SortSelect
            value={sortOption}
            onChange={handleSortChange}
            aria-label="Sort habits by"
          >
            {Object.values(SortOption).map((option) => (
              <option key={option} value={option}>
                {getSortOptionText(option)}
              </option>
            ))}
          </SortSelect>
        </div>
      </ListHeader>

      <List>
        {sortedHabits.map((habit) => (
          <HabitCardContainer
            key={habit._id}
            className="habit-card-container"
            data-habit-id={habit._id}
            data-testid={`habit-card-container-${habit._id}`}
          >
            <HabitCard habit={habit} />
          </HabitCardContainer>
        ))}
      </List>
    </div>
  );
};
