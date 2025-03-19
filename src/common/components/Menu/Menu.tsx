import { useMenuContext } from "@common/hooks/menuContext";
import {
  autoPlacement,
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  Placement,
  shift,
  useFloating,
} from "@floating-ui/react";
import React, { ReactNode, useEffect, useState, useCallback } from "react";
import {
  MenuContainer,
  MenuDivider,
  MenuItem,
  MenuItemButton,
  MenuItemContent,
  MenuItemIcon,
  MenuList,
} from "./menu.styles";

// Define placement types that match Floating UI's Placement type
export type MenuPlacement = Placement | "auto";

// Helper to handle auto placement
const getPlacement = (placement: MenuPlacement): Placement | undefined => {
  return placement === "auto" ? undefined : placement;
};

// MenuItem Component
export interface MenuItemProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
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
  const { closeAllMenus } = useMenuContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default browser behavior
    e.preventDefault();

    // Stop propagation to prevent the menu from closing too early
    e.stopPropagation();

    if (onClick && !disabled) {
      // Close all menus first
      closeAllMenus();

      // Use requestAnimationFrame to ensure the click handler runs after React has processed state changes
      window.requestAnimationFrame(() => {
        if (onClick) onClick();
      });
    }
  };

  return (
    <MenuItem>
      <MenuItemButton
        onClick={handleClick}
        $variant={variant}
        disabled={disabled}
      >
        {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
        <MenuItemContent>{children}</MenuItemContent>
      </MenuItemButton>
    </MenuItem>
  );
};

// Main Menu Component
export interface MenuProps {
  children: React.ReactNode;
  trigger: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
  placement?: MenuPlacement;
}

export const Menu = ({
  children,
  trigger,
  isOpen: controlledIsOpen,
  onOpenChange,
  className = "",
  placement = "bottom-end",
}: MenuProps) => {
  // Controlled mode handling
  const isControlled = controlledIsOpen !== undefined;

  // Context menu management
  const {
    registerMenu,
    isMenuOpen,
    toggleMenu: contextToggleMenu,
    openMenu: contextOpenMenu,
    closeMenu: contextCloseMenu,
  } = useMenuContext();

  // State management
  const [menuId] = useState(() => registerMenu());
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine actual open state
  // For tests, we'll also support an internal state that gets set directly
  const isOpen = isControlled
    ? controlledIsOpen || false
    : isMenuOpen(menuId) || internalOpen;

  // Update open state based on source (context or controlled)
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (isControlled) {
        onOpenChange?.(open);
      } else {
        if (open) {
          contextOpenMenu(menuId);
          setInternalOpen(true);
        } else {
          contextCloseMenu(menuId);
          setInternalOpen(false);
        }
      }
    },
    [isControlled, onOpenChange, contextOpenMenu, contextCloseMenu, menuId]
  );

  // Floating UI setup
  const { x, y, strategy, refs } = useFloating({
    placement: getPlacement(placement),
    open: isOpen,
    onOpenChange: handleOpenChange,
    middleware: [
      offset(8),
      placement === "auto"
        ? autoPlacement({
            allowedPlacements: [
              "top",
              "bottom",
              "top-start",
              "top-end",
              "bottom-start",
              "bottom-end",
            ],
            alignment: "end",
            padding: 8,
          })
        : flip({
            fallbackPlacements: ["top-end", "top", "bottom-end", "bottom"],
            padding: 8,
          }),
      shift({ padding: 16 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Add escape key handler specifically for tests
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleOpenChange]);

  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Close this menu when component unmounts
      contextCloseMenu(menuId);
      setInternalOpen(false);
    };
  }, [contextCloseMenu, menuId]);

  // Handle trigger click
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Toggle directly using the context and internal state
    setInternalOpen(!isOpen);

    if (isControlled) {
      onOpenChange?.(!isOpen);
    } else {
      contextToggleMenu(menuId, e);
    }
  };

  // Render the component
  return (
    <MenuContainer className={`menu-container ${className}`}>
      <div
        ref={refs.setReference}
        onClick={handleTriggerClick}
        className="menu-trigger"
        style={{ cursor: "pointer" }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-testid="menu-trigger"
      >
        {trigger}
      </div>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 20000,
            }}
            className="menu-floating"
            data-testid="menu-content"
          >
            <MenuList className="menu-list">{children}</MenuList>
          </div>
        </FloatingPortal>
      )}
    </MenuContainer>
  );
};

Menu.Item = MenuItemComponent;
Menu.Divider = MenuDivider;
