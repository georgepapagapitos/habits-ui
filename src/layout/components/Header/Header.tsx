import { useAuth } from "@auth/hooks";
import { Menu, ThemeSelector } from "@common/components";
import { useLocation } from "react-router-dom";
import {
  FaBars,
  FaSync,
  FaSignOutAlt,
  FaHome,
  FaChartBar,
  FaUser,
  FaGift,
} from "react-icons/fa";
import {
  HeaderActions,
  HeaderContainer,
  MenuButton,
  Title,
} from "./header.styles";

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }: HeaderProps) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleRefresh = () => {
    window.location.reload();

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  // Only show auth controls on main page, not on login/register
  const showAuthControls = isAuthenticated && location.pathname === "/";

  // Function to handle screen changes - this uses direct DOM manipulation
  // to maintain compatibility with the existing app structure
  const handleScreenChange = (screen: "habits" | "rewards" | "stats") => {
    // Set active screen in localStorage
    localStorage.setItem("activeScreen", screen);

    // Create a custom event that the App component would respond to
    const event = new CustomEvent("screen-change", {
      detail: { screen },
    });

    // Dispatch the event
    document.dispatchEvent(event);
  };

  return (
    <HeaderContainer>
      <Title>{title || "Habits"}</Title>
      <HeaderActions>
        <ThemeSelector />
        {showAuthControls && (
          <Menu
            placement="bottom-end"
            trigger={
              <MenuButton aria-label="Menu">
                <FaBars size={20} />
              </MenuButton>
            }
          >
            <Menu.Item
              icon={<FaHome />}
              onClick={() => handleScreenChange("habits")}
            >
              Home
            </Menu.Item>
            <Menu.Item
              icon={<FaGift />}
              onClick={() => handleScreenChange("rewards")}
            >
              Rewards
            </Menu.Item>
            <Menu.Item
              icon={<FaChartBar />}
              onClick={() => handleScreenChange("stats")}
            >
              Statistics
            </Menu.Item>
            <Menu.Item icon={<FaSync />} onClick={handleRefresh}>
              Refresh
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              icon={<FaSignOutAlt />}
              onClick={logout}
              variant="danger"
            >
              Logout
            </Menu.Item>
          </Menu>
        )}
      </HeaderActions>
    </HeaderContainer>
  );
};
