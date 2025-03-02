import axios from "axios";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "../types";

const API_URL = `${import.meta.env.VITE_API_URL || "/api"}/auth`;

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async logout(): Promise<void> {
    // No server-side logout needed, just clearing local storage
    // handled by the auth context
  },
};
