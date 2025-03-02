import { ButtonHTMLAttributes, ReactNode } from "react";
import {
  DangerButton,
  IconButton,
  SecondaryButton,
  StyledButton,
} from "./button.styles";

export type ButtonVariant = "primary" | "secondary" | "danger" | "icon";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  isFullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) => {
  switch (variant) {
    case "secondary":
      return (
        <SecondaryButton $size={size} $isFullWidth={isFullWidth} {...props}>
          {leftIcon && <span className="button-icon left">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="button-icon right">{rightIcon}</span>}
        </SecondaryButton>
      );
    case "danger":
      return (
        <DangerButton $size={size} $isFullWidth={isFullWidth} {...props}>
          {leftIcon && <span className="button-icon left">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="button-icon right">{rightIcon}</span>}
        </DangerButton>
      );
    case "icon":
      return (
        <IconButton $size={size} {...props}>
          {children}
        </IconButton>
      );
    default:
      return (
        <StyledButton $size={size} $isFullWidth={isFullWidth} {...props}>
          {leftIcon && <span className="button-icon left">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="button-icon right">{rightIcon}</span>}
        </StyledButton>
      );
  }
};
