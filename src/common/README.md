# UI Component Guidelines

This document outlines best practices for building UI components in our application.

## Component Structure

Components should follow this organization:

1. Keep components small and focused on a single responsibility
2. Create reusable components in `common/components/`
3. Feature-specific components in their respective feature directories
4. Use named exports for all components

## Styling Conventions

1. Use styled-components for all styling
2. Always reference theme variables (colors, spacing, etc.) instead of hardcoded values
3. Component styles should be in separate files (e.g., `componentName.styles.ts`)
4. Use the `$` prefix for transient props in styled-components

## Component Best Practices

1. Use TypeScript interfaces for props
2. Provide default values for optional props
3. Destructure props in function parameters
4. Use the React.forwardRef API for form components
5. Include aria attributes for accessibility
6. Handle loading, error, and empty states

## Theme Usage

Always use theme variables for:
- Colors
- Spacing
- Typography
- Border radius
- Shadows
- Animations/transitions

### Theme Variables

#### Colors

```tsx
// Primary colors
theme.colors.primary       // Main brand color
theme.colors.primaryLight  // Lighter variation
theme.colors.primaryDark   // Darker variation for hover
theme.colors.primaryText   // Text on primary elements

// UI colors
theme.colors.error         // Error state
theme.colors.errorLight    // Light error background
theme.colors.errorDark     // Dark/hover error
theme.colors.success       // Success state
theme.colors.warning       // Warning state
theme.colors.info          // Info state

// Text and backgrounds
theme.colors.text          // Primary text
theme.colors.textLight     // Secondary text
theme.colors.textMuted     // Muted text
theme.colors.textOnPrimary // Text on primary color
theme.colors.background    // Main background
theme.colors.surface       // Card/component backgrounds

// State colors
theme.colors.hover         // Standard hover overlay
theme.colors.pressed       // Standard pressed/active overlay
theme.colors.disabled      // Disabled state

// Transparent colors (for overlays, shadows)
theme.colors.transparent.light  // Light transparent (rgba 0.05)
theme.colors.transparent.medium // Medium transparent (rgba 0.1)
theme.colors.overlay            // Modal overlays
```

#### Spacing

```tsx
theme.spacing.xs   // 4px
theme.spacing.sm   // 8px
theme.spacing.md   // 16px
theme.spacing.lg   // 24px
theme.spacing.xl   // 32px
theme.spacing.xxl  // 48px
```

#### Typography

```tsx
theme.typography.fontSizes.xs   // 0.75rem
theme.typography.fontSizes.sm   // 0.875rem
theme.typography.fontSizes.md   // 1rem
theme.typography.fontSizes.lg   // 1.125rem
theme.typography.fontSizes.xl   // 1.25rem
theme.typography.fontSizes.xxl  // 1.5rem

theme.typography.fontWeights.light   // 300
theme.typography.fontWeights.regular // 400
theme.typography.fontWeights.medium  // 500 
theme.typography.fontWeights.bold    // 700
```

Example:
```tsx
// DO
color: ${({ theme }) => theme.colors.primary};
margin: ${({ theme }) => theme.spacing.md};

// DON'T
color: #3498db;
margin: 16px;
```

## Creating New Components

When creating a new component:

1. Check if a similar component already exists
2. Follow the established pattern for similar components
3. Create both component and styles files
4. Export the component through an index.ts file
5. Add appropriate tests

## Refactoring Existing Components

When refactoring components to meet these guidelines:

1. Extract hardcoded values to theme variables
2. Split large components into smaller ones
3. Move duplicated styles to reusable styled components
4. Ensure all props are properly typed
