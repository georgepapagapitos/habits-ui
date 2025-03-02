import { FormHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import {
  FormError,
  FormGroup,
  FormLabel,
  FormTitle,
  StyledForm,
} from "./form.styles";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export const Form = ({ children, ...props }: FormProps) => {
  return <StyledForm {...props}>{children}</StyledForm>;
};

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Group = ({ children, ...props }: FormGroupProps) => {
  return <FormGroup {...props}>{children}</FormGroup>;
};

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const Title = ({ children, ...props }: TitleProps) => {
  return <FormTitle {...props}>{children}</FormTitle>;
};

export interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}

export const Label = ({ children, required, ...props }: LabelProps) => {
  return (
    <FormLabel {...props}>
      {children}
      {required && <span className="required">*</span>}
    </FormLabel>
  );
};

export interface ErrorProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Error = ({ children, ...props }: ErrorProps) => {
  return <FormError {...props}>{children}</FormError>;
};
