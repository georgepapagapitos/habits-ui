import { ReactNode, useRef, useEffect, useState, useCallback } from "react";
import { useMenuManager } from "../../hooks/useMenuManager";
import {
  MenuContainer,
  MenuDivider,
  MenuItem,
  MenuItemButton,
  MenuItemContent,
  MenuItemIcon,
  MenuList,
} from "./menu.styles";

export interface MenuItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

export const MenuItemComponent = ({
  icon,
  children,
  onClick,
  variant = "default",
  disabled = false,
}: MenuItemProps) => {
  return (
    <MenuItem>
      <MenuItemButton onClick={onClick} $variant={variant} disabled={disabled}>
        {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
        <MenuItemContent>{children}</MenuItemContent>
      </MenuItemButton>
    </MenuItem>
  );
};

export interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Menu = ({
  trigger,
  children,
  isOpen: controlledIsOpen,
  onClose,
}: MenuProps) => {
  // Use context-managed menu if no controlled state is provided
  const { isOpen: contextIsOpen, toggleMenu, closeMenu } = useMenuManager();

  // For backward compatibility, we still support controlled mode
  const [localIsOpen, setLocalIsOpen] = useState(controlledIsOpen || false);
  const menuRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? localIsOpen : contextIsOpen;

  const handleOpen = (e?: React.MouseEvent) => {
    if (isControlled) {
      setLocalIsOpen(!localIsOpen);
    } else {
      toggleMenu(e);
    }
  };

  const handleClose = useCallback(() => {
    if (isControlled) {
      setLocalIsOpen(false);
      if (onClose) {
        onClose();
      }
    } else {
      closeMenu();
    }
  }, [isControlled, onClose, closeMenu]);

  // Handle outside clicks for controlled mode (context handles its own clicks)
  useEffect(() => {
    if (!isControlled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (localIsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [localIsOpen, handleClose, isControlled]);

  // Update local state when controlled state changes
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setLocalIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  return (
    <MenuContainer className="context-menu">
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className="menu-button"
        style={{ cursor: "pointer", position: "relative" }}
      >
        {trigger}
      </div>
      {isOpen && <MenuList ref={menuRef}>{children}</MenuList>}
    </MenuContainer>
  );
};

Menu.Item = MenuItemComponent;
Menu.Divider = MenuDivider;
