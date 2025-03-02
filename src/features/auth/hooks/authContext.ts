import { createContext } from "react";
import { AuthContextType } from "../types";

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
