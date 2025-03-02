import styled, { keyframes } from "styled-components";

// Animation for messages appearing
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

// Container that holds all messages
export const MessagesWrapper = styled.div`
  position: fixed;
  bottom: calc(
    60px + env(safe-area-inset-bottom, 0px) + 80px
  ); /* Position above AddButton */
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  z-index: 1500;
`;

// Individual message - enhanced styling
export const MessageContainer = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 20px;
  max-width: 80%;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  animation:
    ${fadeInUp} 0.3s ease forwards,
    fadeOut 0.3s ease 3.7s forwards;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  letter-spacing: 0.2px;

  /* Add subtle fade-out animation */
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  /* Prevent overlap of messages */
  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;
