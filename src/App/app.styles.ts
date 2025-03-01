import styled, { keyframes } from "styled-components";
import { withSafeArea } from "../common/utils";

// Animation keyframes
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// App styled components
export const Container = styled.div`
  /* Use a fixed height that accounts for header and bottom nav */
  min-height: calc(100dvh - 120px); /* 60px header + 60px bottom nav */
  background-color: ${({ theme }) => theme.colors.background};
  padding-top: 60px; /* Match header height */
  padding-bottom: 60px; /* Match bottom nav height */

  /* Adjust for safe area insets where supported */
  @supports (padding-top: env(safe-area-inset-top)) {
    padding-top: ${withSafeArea("60px", "top")};
    padding-bottom: ${withSafeArea("60px", "bottom")};
  }

  /* Prevent horizontal scrolling */
  overflow-x: hidden;

  /* Ensure the container fills available space */
  display: flex;
  flex-direction: column;
`;

export const Content = styled.main`
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 600px;
  margin: 0 auto;
  width: 100%;

  /* Make content take available space but not force scrolling */
  flex: 1;

  /* Add overscroll behavior to prevent bouncing on iOS */
  overscroll-behavior: none;
`;

export const AddButton = styled.button`
  position: fixed;
  bottom: ${withSafeArea("80px", "bottom")}; /* 60px for nav + 20px spacing */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: background-color
    ${({ theme }) => theme.animations.transitions.short};

  /* Ensure button is clickable on mobile */
  z-index: 900; /* Updated z-index as recommended */

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  /* Add active state for better mobile feedback */
  &:active {
    transform: scale(0.95);
  }
`;

export const MessageContainer = styled.div`
  position: fixed;
  bottom: ${withSafeArea("140px", "bottom")}; /* Position above AddButton */
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 20px;
  animation: ${fadeInUp} ${({ theme }) => theme.animations.transitions.short};
  z-index: 1500;
  max-width: 80%;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;
