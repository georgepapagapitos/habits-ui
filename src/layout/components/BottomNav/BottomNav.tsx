import { Nav, NavItem } from "./bottomNav.styles";

export const BottomNav: React.FC = () => {
  return (
    <Nav>
      <NavItem>
        <span>Today</span>
      </NavItem>
      <NavItem>
        <span>Weekly</span>
      </NavItem>
      <NavItem>
        <span>Stats</span>
      </NavItem>
    </Nav>
  );
};
