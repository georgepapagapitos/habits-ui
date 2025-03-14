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
  width: 8px;
  height: 8px;
  background: ${(props) => props.color};
  border-radius: 50%;
  animation: ${confetti} 0.6s ease-out forwards;
`;

export const StyledHabitCard = styled.div<{
  $isCompleting: boolean;
  $isCompleted: boolean;
  $expanded?: boolean;
}>`
  background: ${(props) =>
    props.$isCompleted
      ? props.theme.colors.transparent.primary20 // Using 20% transparent primary color
      : props.theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.small};
  position: relative;
  overflow: visible; /* Always make card overflow visible to show the menu button */
  width: 100%;
  transition: all ${({ theme }) => theme.animations.transitions.short};
  ${(props) =>
    props.$isCompleting &&
    css`
      animation: ${popAndSpin} 0.6s ease-in-out;
    `}
`;

export const CardContent = styled.div`
  cursor: pointer;
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`;

export const ExpandButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
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

// Menu button styles
export const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  padding: 0;
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  z-index: 5;
  width: ${({ theme }) => theme.spacing.xl}; // 32px
  height: ${({ theme }) => theme.spacing.xl}; // 32px
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.pressed};
  }

  &:focus {
    outline: none;
  }
`;

// Context menu styles
export const ContextMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 10px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  z-index: 10;
  min-width: 120px;
`;

export const MenuItem = styled.button`
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  &.delete {
    color: ${({ theme }) => theme.colors.error};
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
  padding: 8px 16px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const DeleteConfirmButton = styled.button`
  background: ${({ theme }) => theme.colors.error};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};

  &:hover {
    background: #c0392b; /* Darker red for hover state */
  }
`;
