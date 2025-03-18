import styled from "styled-components";
import {
  ANIMATION,
  createTransition,
} from "../../../../common/theme/animations";

export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: min-content;
  gap: ${({ theme }) => theme.spacing.xs};
  position: relative;
  min-height: 200px; /* Minimum height to prevent layout shifts during transitions */
  transition: height 0.5s ease;

  /* Force GPU acceleration and create stacking context */
  transform: translate3d(0, 0, 0);

  /* Remove any possibility of margin collapse */
  padding: 0.1px 0;
  margin: -0.1px 0;

  /* Ensure proper flow and layering during animations */
  & > div {
    z-index: 1;
    position: relative; /* Ensures position transition works properly */
    /* Ensure stable layout */
    contain: layout style paint;
  }

  /* Add a class for when items are animating */
  &.animating-items {
    pointer-events: none; /* Prevent interaction during animation */
    will-change: contents; /* Hint to browser that contents will change */
  }

  /* Animation freeze - only apply during toggle animation, not during reordering */
  &.animation-freeze {
    pointer-events: none !important; /* Prevent interaction */

    /* Only freeze the animating card, not the others */
    & > .habit-card-container:not(.animating) {
      transition: none !important;
    }

    /* Freeze background colors on each card during animation */
    .styledHabitCard.animating {
      background: var(--default-background) !important;
      transition: none !important;
    }
  }
`;

export const HabitCardContainer = styled.div`
  position: relative;
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s ease,
    margin 0.3s ease,
    top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Use a more predictable transform */
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000;

  /* Fix containing block for absolute positioning */
  transform-style: flat;

  /* Prevent any layout shifts when adding/removing classes */
  will-change: transform, opacity;

  /* Initial entry animation */
  &.habit-enter-active {
    animation: habitEnter ${ANIMATION.duration.standard} forwards;
  }

  /* Prevent card from moving during toggle animation */
  &.animating {
    z-index: 5; /* Higher z-index to prevent other elements overlapping */
    /* Don't block normal transitions */
    position: relative;
  }

  /* Add smooth position transition after animation */
  &.position-transition {
    transition:
      transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1),
      opacity 0.3s ease-out,
      top 0.6s cubic-bezier(0.25, 0.1, 0.25, 1),
      left 0.6s cubic-bezier(0.25, 0.1, 0.25, 1),
      margin 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  @keyframes habitEnter {
    from {
      opacity: 0;
      transform: translate3d(0, -20px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

export const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const SortSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ${createTransition(["all"], "short")};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary + "40"};
  }

  @media (max-width: 480px) {
    max-width: 140px;
  }
`;
