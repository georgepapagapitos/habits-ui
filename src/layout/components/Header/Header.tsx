import { useAuth } from "@auth/hooks";
import { useLocation } from "react-router-dom";
import {
  HeaderActions,
  HeaderContainer,
  LogoutButton,
  RefreshButton,
  Title,
  UserInfo,
} from "./header.styles";

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }: HeaderProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const handleRefresh = () => {
    window.location.reload();

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  // Only show user info and logout on main page, not on login/register
  const showAuthControls = isAuthenticated && location.pathname === "/";

  return (
    <HeaderContainer>
      <Title>{title || "Hannah's Habits"}</Title>
      <HeaderActions>
        {showAuthControls && user && (
          <>
            <UserInfo>{user.username}</UserInfo>
            <LogoutButton onClick={logout}>Logout</LogoutButton>
          </>
        )}
        <RefreshButton onClick={handleRefresh} aria-label="Refresh app">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
            <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </RefreshButton>
      </HeaderActions>
    </HeaderContainer>
  );
};
