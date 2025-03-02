import styled, { css } from "styled-components";
import { ButtonSize } from "./Button";

interface ButtonStyleProps {
  $size?: ButtonSize;
  $isFullWidth?: boolean;
}

const baseButtonStyles = css<ButtonStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.transitions.short};
  width: ${({ $isFullWidth }) => ($isFullWidth ? "100%" : "auto")};

  .button-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.left {
      margin-right: ${({ theme }) => theme.spacing.xs};
    }

    &.right {
      margin-left: ${({ theme }) => theme.spacing.xs};
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ $size, theme }) => {
    switch ($size) {
      case "small":
        return css`
          font-size: ${theme.typography.fontSizes.xs};
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          min-height: 32px;
        `;
      case "large":
        return css`
          font-size: ${theme.typography.fontSizes.md};
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          min-height: 48px;
        `;
      default: // medium
        return css`
          font-size: ${theme.typography.fontSizes.sm};
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          min-height: 40px;
        `;
    }
  }}
`;

export const StyledButton = styled.button<ButtonStyleProps>`
  ${baseButtonStyles}
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textOnPrimary};
  border: none;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

export const SecondaryButton = styled.button<ButtonStyleProps>`
  ${baseButtonStyles}
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.transparent.primary10};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

export const DangerButton = styled.button<ButtonStyleProps>`
  ${baseButtonStyles}
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.textOnPrimary};
  border: none;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.errorDark};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.errorLight};
  }
`;

export const IconButton = styled.button<ButtonStyleProps>`
  ${({ $size }) => {
    const sizes = {
      small: "32px",
      medium: "40px",
      large: "48px",
    };
    const size = sizes[$size || "medium"];

    return css`
      width: ${size};
      height: ${size};
      min-height: ${size};
      min-width: ${size};
    `;
  }}

  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.transitions.short};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.hover};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
    background-color: ${({ theme }) => theme.colors.pressed};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
