import { RequireAuth } from "@auth/components";
import { MenuProvider, MessageProvider } from "@common/hooks";
import { HabitProvider, RewardProvider } from "@habits/hooks";
import { LoginPage, RegisterPage } from "@pages";
import { Navigate, Route, Routes } from "react-router-dom";
import { App } from "./App";
import { GooglePhotosAuth } from "@habits/components/GooglePhotosAuth";

export const AppRoutes = () => {
  return (
    <MessageProvider>
      <MenuProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/photos/auth" element={<GooglePhotosAuth />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <RewardProvider>
                  <HabitProvider>
                    <App />
                  </HabitProvider>
                </RewardProvider>
              </RequireAuth>
            }
          />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MenuProvider>
    </MessageProvider>
  );
};
