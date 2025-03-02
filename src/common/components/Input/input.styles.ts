import styled, { css } from "styled-components";

interface InputProps {
  $hasLeftIcon?: boolean;
  $hasRightIcon?: boolean;
  $hasError?: boolean;
}

export const InputWrapper = styled.div<{ $hasError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.surface};
  transition: all ${({ theme }) => theme.animations.transitions.short};

  &:focus-within {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 1px
      ${({ theme, $hasError }) =>
        $hasError ? theme.colors.error + "40" : theme.colors.primary + "40"};
  }
`;

export const StyledInput = styled.input<InputProps>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: none;
  outline: none;

  ${({ $hasLeftIcon }) =>
    $hasLeftIcon &&
    css`
      padding-left: ${({ theme }) => theme.spacing.xl};
    `}

  ${({ $hasRightIcon }) =>
    $hasRightIcon &&
    css`
      padding-right: ${({ theme }) => theme.spacing.xl};
    `}
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    cursor: not-allowed;
  }
`;

export const InputIcon = styled.div<{ position: "left" | "right" }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textLight};
  pointer-events: none;

  ${({ position }) =>
    position === "left"
      ? css`
          left: ${({ theme }) => theme.spacing.md};
        `
      : css`
          right: ${({ theme }) => theme.spacing.md};
        `}
`;

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;
