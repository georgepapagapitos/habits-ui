# Habits - UI

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
   git clone https://github.com/georgepapagapitos/habits-ui.git
   cd habits-ui
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

The project uses Vitest and React Testing Library for testing. For detailed information, see the [Testing Guide](./docs/testing/testing-guide.md).

Run tests with:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run coverage report
npm run test:coverage
```

## Docker Deployment

This project includes a Dockerfile for containerized deployment.

### Building the Docker Image

```bash
docker build -t habits-ui .
```

### Running the Container

```bash
docker run -p 80:80 -e BACKEND_URL=http://your-backend-url:5050 habits-ui
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
      - BACKEND_URL=http://backend:5050
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

   - Make sure your `BACKEND_URL` environment variable is correctly set to the backend service
   - Check that the backend container is running and accessible from the frontend container
   - Verify the network configuration between containers

2. **Messages Not Showing**:

   - Check the browser console for any JavaScript errors
   - Ensure that the habits API is correctly responding with data
   - Check if timeouts are triggering correctly by adding console logs

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
