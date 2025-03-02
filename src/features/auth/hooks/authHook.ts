import { useContext } from "react";
import { AuthContext } from "./authContext";

export const useAuthImplementation = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
