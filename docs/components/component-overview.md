# Component Overview

This document provides an overview of the component architecture used in the Habits UI.

## Component Structure

The UI components are organized into two main categories:

### Common Components

Located in `src/common/components/`, these are reusable UI elements that can be used across the application:

- **Button**: Standard button components with various styles
- **Input**: Text input fields with validation
- **Form**: Form container with submission handling
- **Card**: Container for displaying content with consistent styling
- **Modal**: Popup dialogs and modals
- **Typography**: Text components for headings, paragraphs, etc.
- **Icon**: SVG icon components with consistent sizing

### Feature Components

Located in `src/features/`, these are domain-specific components organized by feature:

- **Auth Components** (`src/features/auth/components/`):

  - Login form
  - Registration form
  - Forgot password flow

- **Habit Components** (`src/features/habits/components/`):
  - Habit list
  - Habit item
  - Habit form
  - Habit details
  - Streak indicator
  - Habit calendar
  - Completion toggle

### Layout Components

Located in `src/layout/components/`, these define the overall structure of the app:

- **Header**: App header with navigation and user info
- **Footer**: App footer with links and information
- **Sidebar**: Navigation sidebar (when applicable)
- **PageContainer**: Standard page wrapper with consistent padding/margin
- **ErrorBoundary**: Catch and display errors gracefully

## Component Design Principles

### 1. Atomic Design

Components are designed following atomic design principles:

- **Atoms**: Basic building blocks (buttons, inputs, text)
- **Molecules**: Combinations of atoms (form fields, navigation items)
- **Organisms**: Complete sections (forms, headers, cards)
- **Templates**: Page layouts without content
- **Pages**: Complete views with actual content

### 2. Component Composition

- Prefer composition over inheritance
- Create small, focused components that can be combined
- Use children and props to customize component behavior

Example:

```tsx
// Good: Composable components
<Card>
  <CardHeader>Habit Details</CardHeader>
  <CardBody>
    <HabitForm />
  </CardBody>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>

// Avoid: Monolithic components with many props
<HabitCard
  title="Habit Details"
  showForm={true}
  showFooter={true}
  primaryButtonText="Save"
/>
```

### 3. Props API Design

- Use consistent prop naming across components
- Provide sensible defaults
- Use TypeScript for prop type definitions
- Document props with JSDoc comments

Example:

```tsx
/**
 * Button component for user interactions
 */
interface ButtonProps {
  /** The button's label text */
  children: React.ReactNode;
  /** The variant style of the button */
  variant?: "primary" | "secondary" | "danger";
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Callback when button is clicked */
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  disabled = false,
  onClick,
}) => {
  // Component implementation
};
```

## Component Usage Guidelines

### When to Create a New Component

Create a new component when:

1. UI element is used in multiple places
2. Component logic becomes complex
3. Component size exceeds 100-150 lines
4. Component has clear, well-defined responsibility

### Common vs. Feature Components

- Place components in `common/` when they are generic and reusable
- Place components in `features/` when they are specific to a domain feature

## Testing Components

Each component should have:

- Unit tests for component rendering
- Tests for component interactions
- Tests for different prop variations

See the [Test Writing Guide](../testing/test-writing-guide.md) for more details.
