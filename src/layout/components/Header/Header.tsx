import { useAuth } from "@auth/hooks";
import { ThemeSelector } from "@common/components";
import { useLocation } from "react-router-dom";
import { FaSync } from "react-icons/fa";
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
      <Title>{title || "Habits"}</Title>
      <HeaderActions>
        <ThemeSelector />
        {showAuthControls && user && (
          <>
            <UserInfo>{user.username}</UserInfo>
            <LogoutButton onClick={logout}>Logout</LogoutButton>
          </>
        )}
        <RefreshButton onClick={handleRefresh} aria-label="Refresh app">
          <FaSync size={20} />
        </RefreshButton>
      </HeaderActions>
    </HeaderContainer>
  );
};
