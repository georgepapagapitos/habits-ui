import { ANIMATION, createTransition } from "@common/theme/animations";
import styled, { css, keyframes } from "styled-components";

// Animations
export const pulse = keyframes`
  0% {
    transform: scale3d(1, 1, 1);
  }
  50% {
    transform: scale3d(1.03, 1.03, 1);
  }
  100% {
    transform: scale3d(1, 1, 1);
  }
`;

export const confetti = keyframes`
  0% {
    transform: translateY(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  10% {
    transform: translateY(-5px) rotate(45deg) scale(1);
    opacity: 1;
  }
  30% {
    transform: translateY(-30px) rotate(180deg) scale(1.3);
    opacity: 1;
  }
  100% {
    transform: translateY(-120px) rotate(720deg) scale(0.5);
    opacity: 0;
  }
`;

export const fadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

// Component styles
export const ConfettiPiece = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${(props) => props.color};
  border-radius: 50%;
  animation: ${confetti} 1.5s ${ANIMATION.easing.bouncy} forwards;
  z-index: 30; /* Ensure it's above all card elements including the ::after pseudo-element */
  pointer-events: none;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
`;

export const StyledHabitCard = styled.div<{
  $isCompleting: boolean;
  $isCompleted: boolean;
  $expanded?: boolean;
}>`
  /* Use the background color based on isCompleted state */
  background: ${(props) =>
    props.$isCompleted
      ? props.theme.colors.transparent.primary20
      : props.theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: visible; /* Always make card overflow visible to show the menu button */
  width: 100%;
  transform-origin: center center;
  margin: 2px 0;

  /* Apply consistent transitions for interactive effects */
  transition: ${createTransition(["transform", "box-shadow"], "medium")};

  /* Deliberately not transitioning background-color to avoid flicker */
  /* During animation phase, background-color will not transition */

  /* During animation, apply pulse effect and prevent clicks */
  &.animating {
    pointer-events: none; /* Prevent additional clicks during animation */
    z-index: 10; /* Ensure it stays on top during animation */
    /* Fix background color to prevent flickering during animation */
    will-change: transform;
  }

  ${(props) =>
    props.$isCompleting &&
    css`
      /* Simple pulse animation instead of flip */
      animation: ${pulse} 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
      will-change: transform;
    `}

  &:hover {
    transform: scale(1.01);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }
`;

export const CardContent = styled.div`
  cursor: pointer;
  transition: ${createTransition(["opacity"], "short")};
  padding: ${({ theme }) => theme.spacing.xs} 0;

  &:hover {
    opacity: 0.95;
  }

  &:active {
    opacity: 0.9;
  }
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: ${createTransition(["opacity"], "medium")};
`;

export const ExpandButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  cursor: pointer;
  transition: ${createTransition(["all"], "short")};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

export const HabitName = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
  transition: ${createTransition(["color"], "medium")};
`;

export const HabitMeta = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 4px;
  transition: ${createTransition(["color"], "medium")};
`;

export const FrequencyBadge = styled.span`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

// Menu button styles
export const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 0;
  width: ${({ theme }) => theme.spacing.xl}; // 32px
  height: ${({ theme }) => theme.spacing.xl}; // 32px
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${createTransition(["all"], "short")};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text};
    transform: scale(1.05);
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.pressed};
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.transparent.primary20};
  }
`;

// Confirmation dialog styles
export const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

export const DialogContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

export const DialogTitle = styled.h3`
  margin-top: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const CancelButton = styled.button`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  transition: ${createTransition(["all"], "short")};
`;

export const DeleteConfirmButton = styled.button`
  background: ${({ theme }) => theme.colors.error};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: white;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  transition: ${createTransition(["background"], "short")};

  &:hover {
    background: #c0392b; /* Darker red for hover state */
  }
`;

export const StreakIndicator = styled.div<{ $hasStreak: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme, $hasStreak }) =>
    $hasStreak ? theme.colors.success : "inherit"};
  font-weight: ${({ theme, $hasStreak }) =>
    $hasStreak ? theme.typography.fontWeights.bold : "inherit"};
`;
