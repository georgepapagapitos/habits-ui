import { Nav, NavItem } from "./bottomNav.styles";

type ScreenType = "habits" | "rewards" | "stats";

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
        $active={activeScreen === "habits"}
        onClick={() => onScreenChange("habits")}
      >
        <span>Habits</span>
      </NavItem>
      <NavItem
        $active={activeScreen === "rewards"}
        onClick={() => onScreenChange("rewards")}
      >
        <span>Rewards</span>
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
