import styled, { css, keyframes } from "styled-components";

// Animations
export const popAndSpin = keyframes`
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.2) rotate(0deg);
  }
  60% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
`;

export const confetti = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(720deg);
    opacity: 0;
  }
`;

// Component styles
export const ConfettiPiece = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${(props) => props.color};
  border-radius: 50%;
  animation: ${confetti} 0.6s ease-out forwards;
`;

export const StyledHabitCard = styled.div<{
  $isCompleting: boolean;
  $isCompleted: boolean;
}>`
  background: ${(props) =>
    props.$isCompleted
      ? props.theme.colors.primaryLight + "20" // Using theme color with opacity
      : props.theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.small};
  position: relative;
  overflow: hidden;
  width: 100%;
  transition: all ${({ theme }) => theme.animations.transitions.short};
  ${(props) =>
    props.$isCompleting &&
    css`
      animation: ${popAndSpin} 0.6s ease-in-out;
    `}
`;

export const HabitName = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const HabitMeta = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

export const FrequencyBadge = styled.span`
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;