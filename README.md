# Hannah's Habits - UI

A modern habit tracking application built with React, TypeScript, and Vite.

## Features

- 📝 Create and manage daily habits
- 📅 Track completions with customizable frequency (daily, weekdays, weekends, or specific days)
- 📊 View habit completion history
- 🔔 Track streak progress for consistent habit completion
- 📱 Responsive design for mobile and desktop
- 🌙 Built with modern React best practices

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Styled Components
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router v7
- **Testing**: Vitest + React Testing Library
- **API Communication**: Axios
- **Date Handling**: date-fns
- **PWA Support**: vite-plugin-pwa

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/hannahs-habits.git
   cd hannahs-habits/habits-ui
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with the UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
habits-ui/
├── public/             # Static assets
├── src/
│   ├── App/            # Main App component
│   ├── common/         # Shared components, utilities, and hooks
│   │   ├── components/ # Reusable UI components (Button, Input, etc.)
│   │   ├── hooks/      # Custom hooks
│   │   └── utils/      # Utility functions
│   ├── features/       # Feature-based modules
│   │   ├── auth/       # Authentication feature
│   │   └── habits/     # Habits feature
│   │       ├── components/ # Habit-specific components
│   │       ├── hooks/      # Habit-specific hooks
│   │       ├── types/      # TypeScript interfaces and types
│   │       └── utils/      # Habit utility functions
│   ├── layout/         # Layout components
│   │   └── components/ # Header, Footer, etc.
│   ├── tests/          # Test utilities
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite type declarations
├── .eslintrc.json     # ESLint configuration
├── index.html         # HTML template
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## Design Decisions

### Component Structure

Components are organized into two main categories:
- **Common Components**: Reusable UI elements like buttons, inputs, and forms
- **Feature Components**: Feature-specific components organized by domain

### State Management

- **Local State**: React's `useState` for component-level state
- **Cross-Component State**: Custom hooks with Context API for feature-specific state management
- **API Data**: Custom data fetching hooks with caching and error handling

### Styling Approach

- Styled Components for component-specific styling
- Consistent theme variables for colors, spacing, and typography
- Mobile-first responsive design

## Testing

The project uses Vitest and React Testing Library for testing:

- **Unit Tests**: For individual functions and utilities
- **Component Tests**: For UI components
- **Integration Tests**: For feature workflows

Run tests with:

```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.