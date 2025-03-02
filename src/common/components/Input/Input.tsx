import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import {
  StyledInput,
  InputWrapper,
  InputIcon,
  ErrorText,
} from "./input.styles";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div>
        <InputWrapper $hasError={!!error}>
          {leftIcon && <InputIcon position="left">{leftIcon}</InputIcon>}
          <StyledInput
            ref={ref}
            $hasLeftIcon={!!leftIcon}
            $hasRightIcon={!!rightIcon}
            $hasError={!!error}
            {...props}
          />
          {rightIcon && <InputIcon position="right">{rightIcon}</InputIcon>}
        </InputWrapper>
        {error && <ErrorText>{error}</ErrorText>}
      </div>
    );
  }
);
