import styled, { css } from "styled-components";

export const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50000;
`;

export const DialogContainer = styled.div<{
  $size?: "small" | "medium" | "large";
}>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  ${({ $size }) => {
    switch ($size) {
      case "small":
        return css`
          width: 90%;
          max-width: 400px;
        `;
      case "large":
        return css`
          width: 90%;
          max-width: 800px;
        `;
      default: // medium
        return css`
          width: 90%;
          max-width: 600px;
        `;
    }
  }}
`;

export const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

export const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

export const DialogTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

export const DialogBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
`;

export const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  width: ${({ theme }) => theme.spacing.xl};
  height: ${({ theme }) => theme.spacing.xl};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;
