# Component Styling

This document explains the styling approach used in the Habits UI.

## Styling Architecture

The Habits UI uses Styled Components for styling. This approach allows for:

- Component-scoped CSS
- Dynamic styling based on props
- Theme-based design system
- Type safety with TypeScript

## Theme System

The application uses a centralized theme for consistent styling:

```tsx
// src/common/theme.ts
export const theme = {
  colors: {
    primary: "#5D5FEF",
    secondary: "#7879F1",
    success: "#4CAF50",
    danger: "#F44336",
    warning: "#FFC107",
    info: "#2196F3",
    light: "#F5F5F5",
    dark: "#212121",
    text: {
      primary: "#212121",
      secondary: "#757575",
      disabled: "#9E9E9E",
    },
    background: {
      default: "#FFFFFF",
      paper: "#F5F5F5",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.25rem",
      xl: "1.5rem",
      xxl: "2rem",
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    pill: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  },
  transitions: {
    default: "0.3s ease",
    quick: "0.15s ease",
    slow: "0.5s ease",
  },
  breakpoints: {
    xs: "0px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    xxl: "1400px",
  },
};

export type Theme = typeof theme;
```

## Styled Components Usage

### Basic Component Styling

```tsx
import styled from "styled-components";

// Basic styled component
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  padding: ${(props) => `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: none;
  font-size: ${(props) => props.theme.typography.fontSize.md};
  transition: ${(props) => props.theme.transitions.default};

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

export default Button;
```

### Component with Variants

```tsx
import styled, { css } from "styled-components";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
}

const Button = styled.button<ButtonProps>`
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  border: none;
  cursor: pointer;
  transition: ${(props) => props.theme.transitions.default};

  /* Size variations */
  ${(props) =>
    props.size === "small" &&
    css`
      padding: ${props.theme.spacing.xs} ${props.theme.spacing.sm};
      font-size: ${props.theme.typography.fontSize.sm};
    `}

  ${(props) =>
    (!props.size || props.size === "medium") &&
    css`
      padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
      font-size: ${props.theme.typography.fontSize.md};
    `}
  
  ${(props) =>
    props.size === "large" &&
    css`
      padding: ${props.theme.spacing.md} ${props.theme.spacing.lg};
      font-size: ${props.theme.typography.fontSize.lg};
    `}

  /* Variant styles */
  ${(props) =>
    (!props.variant || props.variant === "primary") &&
    css`
      background-color: ${props.theme.colors.primary};
      color: white;

      &:hover {
        background-color: ${props.theme.colors.secondary};
      }
    `}
  
  ${(props) =>
    props.variant === "secondary" &&
    css`
      background-color: transparent;
      color: ${props.theme.colors.primary};
      border: 1px solid ${props.theme.colors.primary};

      &:hover {
        background-color: ${props.theme.colors.light};
      }
    `}
  
  ${(props) =>
    props.variant === "danger" &&
    css`
      background-color: ${props.theme.colors.danger};
      color: white;

      &:hover {
        background-color: darkred;
      }
    `}
`;

export default Button;
```

## Responsive Design

All components are built with a mobile-first approach:

```tsx
const Card = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.md};

  /* Base styles (mobile) */
  width: 100%;

  /* Tablet and above */
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.lg};
    width: 75%;
  }

  /* Desktop */
  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    width: 50%;
  }
`;
```

## Global Styles

Global styles are defined in a single location:

```tsx
// src/common/GlobalStyles.ts
import { createGlobalStyle } from "styled-components";
import { Theme } from "./theme";

const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: ${(props) => props.theme.typography.fontFamily};
    font-size: ${(props) => props.theme.typography.fontSize.md};
    line-height: 1.5;
    color: ${(props) => props.theme.colors.text.primary};
    background-color: ${(props) => props.theme.colors.background.default};
  }
  
  a {
    color: ${(props) => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default GlobalStyles;
```

## Best Practices

1. **Keep styled components in separate files** from React components for better organization
2. **Use theme values** instead of hardcoded styles
3. **Create abstractions** for common patterns
4. **Keep components small** and focused on a single responsibility
5. **Use props** to create variants of components
6. **Use semantic HTML elements** as the base for styled components
7. **Follow mobile-first approach** for responsive design

## When to Use Inline Styles

While styled-components should be the primary styling method, there are cases where inline styles make sense:

- One-time, dynamic styles (e.g., `transform: translateX(${dynamicValue}px)`)
- Component-specific styles that don't fit in the design system and won't be reused

```tsx
// Acceptable use of inline styles
<div style={{ transform: `translateX(${position}px)` }}>
  Dynamically positioned element
</div>
```

## Performance Considerations

- Use memoization (React.memo) for styled components when appropriate
- Avoid complex calculations in styled-component template literals
- Consider using a CSS prop for highly dynamic styling needs
