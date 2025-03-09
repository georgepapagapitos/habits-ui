import { RequireAuth } from "@auth/components";
import { MenuProvider, MessageProvider } from "@common/hooks";
import { HabitProvider } from "@habits/hooks";
import { LoginPage, RegisterPage } from "@pages";
import { Navigate, Route, Routes } from "react-router-dom";
import { App } from "./App";

export const AppRoutes = () => {
  return (
    <MessageProvider>
      <MenuProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <HabitProvider>
                  <App />
                </HabitProvider>
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
