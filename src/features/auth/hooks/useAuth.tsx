import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { authApi } from "../services/authApi";
import {
  AuthContextType,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from "../types";

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: Boolean(localStorage.getItem("token")),
  isLoading: false,
  error: null,
};

// Action types
type AuthAction =
  | { type: "LOGIN_REQUEST" }
  | {
      type: "LOGIN_SUCCESS";
      payload: { user: AuthState["user"]; token: string };
    }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "REGISTER_REQUEST" }
  | {
      type: "REGISTER_SUCCESS";
      payload: { user: AuthState["user"]; token: string };
    }
  | { type: "REGISTER_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_REQUEST":
    case "REGISTER_REQUEST":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for token on mount
  useEffect(() => {
    if (state.token) {
      const loadUser = async () => {
        try {
          const user = await authApi.getCurrentUser(state.token as string);
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user, token: state.token as string },
          });
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({
            type: "LOGIN_FAILURE",
            payload: "Session expired. Please login again.",
          });
        }
      };
      loadUser();
    }
  }, []);

  // Login function
  const login = async (credentials: LoginRequest) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem("token", data.token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: data.user, token: data.token },
      });
    } catch (error: any) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload:
          error.response?.data?.message || "Login failed. Please try again.",
      });
    }
  };

  // Register function
  const register = async (userData: RegisterRequest) => {
    dispatch({ type: "REGISTER_REQUEST" });
    try {
      const data = await authApi.register(userData);
      localStorage.setItem("token", data.token);
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: { user: data.user, token: data.token },
      });
    } catch (error: any) {
      dispatch({
        type: "REGISTER_FAILURE",
        payload:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
