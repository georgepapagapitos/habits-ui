# Habits - Frontend

A modern habit tracking application built with React, TypeScript, and Vite.

## 🚀 Features

- **Habit Tracking**: Create and track daily, weekly, or custom habits
- **Interactive Calendar**: Visual calendar showing completion history
- **Streaks**: Track consecutive days of habit completion
- **Mobile-First Design**: Responsive layout works on all devices
- **PWA Support**: Install as a standalone app on mobile devices

## 🛠️ Tech Stack

- **React 19**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast development server and build tool
- **Styled Components**: Component-based styling
- **Axios**: API communication
- **Date-fns**: Date utilities
- **PWA**: Progressive Web App features

## 🏗️ Project Structure

```
src/
├── App/                    # Main app component and routes
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   │   ├── components/     # Auth-related components
│   │   ├── hooks/          # Auth hooks (useAuth)
│   │   ├── services/       # Auth API service
│   │   └── types/          # Auth types
│   └── habits/             # Habits feature
│       ├── components/     # Habit-related components
│       ├── constants/      # Constants and messages
│       ├── hooks/          # Custom hooks (useHabitManager)
│       ├── services/       # API services
│       ├── types/          # Type definitions
│       └── utils/          # Utility functions
├── layout/                 # App layout components
│   ├── components/         # Header, Footer, etc.
│   └── styles/             # Layout styles
├── pages/                  # Page components
└── theme/                  # Theme definition and styling
```

## 🚨 Prerequisites

- Node.js 18+
- npm or yarn

## 🔧 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/georgepapagapitos/habits-ui
   cd habits-ui
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file:
   ```bash
   # Optional: Specify API URL if not using the proxy in vite.config.ts
   VITE_API_URL=http://localhost:5050
   ```

## 📦 Running the App

### Development mode:

```bash
npm run dev
# or
yarn dev
```

The app will be available at http://localhost:5173 with hot reloading.

### Build for production:

```bash
npm run build
# or
yarn build
```

### Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## 🐳 Docker

To build and run the UI using Docker:

```bash
# Build the Docker image
docker build -t habits-ui .

# Run the container
docker run -p 80:80 habits-ui
```

## 🔄 API Integration

The frontend communicates with the `habits-api` backend through a proxy configured in `vite.config.ts` during development. For production, the Nginx configuration in the Docker container handles the proxy.

The main API services are located in:

- `src/features/habits/services/habitApi.ts`
- `src/features/auth/services/authApi.ts`

## 🧪 Testing

```bash
npm run test
# or
yarn test
```

## 🎨 Theme Customization

The app uses a theme defined in `src/theme` to maintain consistent styling. To customize the appearance:

1. Edit the color palette in `src/theme/colors.ts`
2. Modify spacing, typography, or other theme variables as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Styled Components](https://styled-components.com/)
- [Date-fns](https://date-fns.org/)
