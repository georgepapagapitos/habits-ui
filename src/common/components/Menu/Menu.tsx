import { ReactNode, useEffect, useRef, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false);
  const menuRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (controlledIsOpen === undefined) {
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    if (controlledIsOpen === undefined) {
      setIsOpen(false);
    } else if (onClose) {
      onClose();
    }
  };

  // Handle outside clicks
  useEffect(() => {
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

    if (isOpen || controlledIsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, controlledIsOpen, onClose]);

  // Update local state when controlled state changes
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  return (
    <MenuContainer>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{ cursor: "pointer", position: "relative" }}
      >
        {trigger}
      </div>
      {(isOpen || controlledIsOpen) && (
        <MenuList ref={menuRef}>{children}</MenuList>
      )}
    </MenuContainer>
  );
};

Menu.Item = MenuItemComponent;
Menu.Divider = MenuDivider;
