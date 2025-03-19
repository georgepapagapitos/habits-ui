import { useAuth } from "@auth/hooks";
import { ThemeSelector } from "@common/components";
import { useLocation } from "react-router-dom";
import { FaSync, FaPalette } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import {
  HeaderActions,
  HeaderContainer,
  LogoutButton,
  RefreshButton,
  ThemeButton,
  ThemeSelectorContainer,
  Title,
  UserInfo,
} from "./header.styles";

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }: HeaderProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  const handleRefresh = () => {
    window.location.reload();

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const toggleThemeSelector = () => {
    setShowThemeSelector((prev) => !prev);
  };

  // Close theme selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(event.target as Node) &&
        themeButtonRef.current &&
        !themeButtonRef.current.contains(event.target as Node)
      ) {
        setShowThemeSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Only show user info and logout on main page, not on login/register
  const showAuthControls = isAuthenticated && location.pathname === "/";

  return (
    <HeaderContainer>
      <Title>{title || "Habits"}</Title>
      <HeaderActions>
        <ThemeButton
          onClick={toggleThemeSelector}
          aria-label="Change theme color"
          ref={themeButtonRef}
        >
          <FaPalette size={18} />
        </ThemeButton>
        {showThemeSelector && (
          <ThemeSelectorContainer ref={themeDropdownRef}>
            <ThemeSelector />
          </ThemeSelectorContainer>
        )}
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
