import styled, { keyframes } from "styled-components";

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const HeaderContainer = styled.header`
  /* Use both position approaches for better cross-platform compatibility */
  position: fixed;
  /* Force hardware acceleration and prevent iOS rendering issues */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  /* Ensure header is above other elements */
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md};
  /* Explicit iOS safe area handling */
  padding-top: 0;
  padding-top: constant(safe-area-inset-top); /* iOS 11.0 */
  padding-top: env(safe-area-inset-top); /* iOS 11.2+ */
  box-shadow: 0 2px 10px ${({ theme }) => theme.colors.shadow};
  /* iOS needs this to ensure visibility */
  will-change: transform;
`;

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primaryText};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  margin: 0;
`;

export const RefreshButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primaryText};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    svg {
      animation: ${rotateAnimation} 0.5s ease-in-out;
    }
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;
