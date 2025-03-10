import { Nav, NavItem } from "./bottomNav.styles";

type ScreenType = "today" | "weekly" | "stats";

interface BottomNavProps {
  activeScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onScreenChange,
}) => {
  return (
    <Nav>
      <NavItem
        $active={activeScreen === "today"}
        onClick={() => onScreenChange("today")}
      >
        <span>Today</span>
      </NavItem>
      <NavItem
        $active={activeScreen === "weekly"}
        onClick={() => onScreenChange("weekly")}
      >
        <span>Weekly</span>
      </NavItem>
      <NavItem
        $active={activeScreen === "stats"}
        onClick={() => onScreenChange("stats")}
      >
        <span>Stats</span>
      </NavItem>
    </Nav>
  );
};
