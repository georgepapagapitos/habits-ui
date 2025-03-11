# Habits - UI

A modern habit tracking application built with React, TypeScript, and Vite, designed to work with the Habits API.

## Features

- 📝 Create and manage daily habits
- 📅 Track completions with customizable frequency (daily, weekdays, weekends, or specific days)
- 📊 View habit completion history and statistics
- 🔥 Track streak progress for consistent habit completion
- 📸 View reward photos for completing habits
- 🎨 Customizable habit colors and icons
- 💬 Encouraging messages for motivation
- 📱 Responsive design for mobile and desktop
- 🌙 Built with modern React best practices and components
- 📦 PWA support for installation on devices

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Styling**: Styled Components 6
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router v7
- **Testing**: Vitest + React Testing Library
- **API Communication**: Axios
- **Date Handling**: date-fns + date-fns-tz
- **PWA Support**: vite-plugin-pwa
- **Linting & Formatting**: ESLint 9 + Prettier
- **Code Quality**: TypeScript strict mode, Husky pre-commit hooks

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Habits API running (see [Habits API Repository](https://github.com/georgepapagapitos/habits-api))

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/georgepapagapitos/habits-ui.git
   cd habits-ui
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   VITE_API_URL=http://localhost:5050/api
   ```

4. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with the UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## Project Structure

```
habits-ui/
├── public/             # Static assets and PWA icons
├── src/
│   ├── App/            # Main App component
│   ├── common/         # Shared components, utilities, and hooks
│   │   ├── components/ # Reusable UI components (Button, Input, Form, Dialog, etc.)
│   │   ├── constants/  # Application constants
│   │   ├── hooks/      # Custom hooks (useMenuManager, useMessageManager, etc.)
│   │   ├── styles/     # Global styles
│   │   ├── theme/      # Theme configuration (colors, spacing, typography, etc.)
│   │   ├── types/      # Shared TypeScript interfaces
│   │   └── utils/      # Utility functions
│   ├── components/     # Standalone components
│   │   └── Stats/      # Statistics components
│   ├── features/       # Feature-based modules
│   │   ├── auth/       # Authentication feature
│   │   │   ├── components/ # Login/Register forms, RequireAuth, etc.
│   │   │   ├── hooks/      # Auth-specific hooks and context
│   │   │   ├── services/   # Auth API services
│   │   │   └── types/      # Auth TypeScript interfaces
│   │   └── habits/     # Habits feature
│   │       ├── components/ # Habit components (HabitList, HabitCard, HabitForm, etc.)
│   │       ├── constants/  # Habit-related constants
│   │       ├── hooks/      # Habit-specific hooks
│   │       ├── types/      # TypeScript interfaces for habits
│   │       └── utils/      # Habit utility functions
│   ├── layout/         # Layout components
│   │   └── components/ # Header, Messages, Modal, BottomNav, etc.
│   ├── pages/          # Page components
│   ├── tests/          # Test utilities and setup
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite type declarations
├── docs/               # Documentation
├── eslint.config.js    # ESLint configuration
├── index.html         # HTML template
├── nginx.conf         # Nginx configuration for Docker
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite configuration
└── vitest.config.ts   # Vitest configuration
```

## Documentation

For detailed documentation on various aspects of the project, see the following guides:

- **Components**

  - [Component Overview](./docs/components/component-overview.md)
  - [Component Styling](./docs/components/component-styling.md)

- **Development**

  - [State Management](./docs/development/state-management.md)
  - [API Integration](./docs/development/api-integration.md)

- **Testing**
  - [Testing Guide](./docs/testing/testing-guide.md)
  - [Test Writing Guide](./docs/testing/test-writing-guide.md)

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

The project uses Vitest and React Testing Library for testing. Tests are organized alongside the components they test. For detailed information, see the [Testing Guide](./docs/testing/testing-guide.md).

Run tests with:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI visualization
npm run test:ui

# Run coverage report
npm run test:coverage
```

Key testing utilities and practices:

- **Component Testing**: Tests for individual components with React Testing Library
- **Context Testing**: Tests for React Context providers and consumers
- **User Event Testing**: Simulating user interactions
- **Mock Implementation**: Mocking API calls and services

## Docker Deployment

This project includes a Dockerfile for containerized deployment.

### Building the Docker Image

```bash
docker build -t habits-ui .
```

### Running the Container

```bash
docker run -p 80:80 -e VITE_API_URL=http://your-backend-url:5050/api habits-ui
```

### Docker Compose Example

```yaml
version: "3"

services:
  backend:
    image: habits-api:latest
    ports:
      - "5050:5050"
    environment:
      - MONGODB_URI=mongodb://db:27017/habits
    depends_on:
      - db

  frontend:
    image: habits-ui:latest
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:5050/api
    depends_on:
      - backend

  db:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## Troubleshooting Docker Deployment

If you're experiencing issues with the Docker deployment:

1. **API Connection Issues**:

   - Make sure your `VITE_API_URL` environment variable is correctly set to the backend service API URL
   - Check that the backend container is running and accessible from the frontend container
   - Verify the network configuration between containers
   - Check the API paths in the application code match the expected endpoints

2. **UI Issues**:

   - Check the browser console for any JavaScript errors
   - Ensure that the Habits API is correctly responding with data
   - Verify that environment variables are being properly injected at build time
   - Use React DevTools to inspect component state and props

3. **CORS Issues**:

   - The nginx configuration already includes CORS headers
   - If you're still experiencing CORS issues, ensure the backend also has proper CORS setup

4. **Debugging Inside Container**:
   - You can shell into the running container to inspect files:
     ```bash
     docker exec -it <container_id> /bin/sh
     ```
   - Check if the nginx configuration was correctly updated:
     ```bash
     cat /etc/nginx/conf.d/default.conf
     ```
   - Verify environment variables:
     ```bash
     env
     ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
