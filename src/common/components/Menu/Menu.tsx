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
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default browser behavior
    e.preventDefault();

    // Stop propagation to prevent the menu from closing too early
    e.stopPropagation();

    if (onClick && !disabled) {
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
    closeMenu: contextCloseMenu,
  } = useMenuContext();

  // State management
  const [menuId] = useState(() => registerMenu());
  const [contextIsOpen, setContextIsOpen] = useState(() => isMenuOpen(menuId));
  const [localIsOpen, setLocalIsOpen] = useState(controlledIsOpen || false);

  // Determine actual open state
  const isOpen = isControlled ? localIsOpen : contextIsOpen;

  // Update open state based on source (context or controlled)
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (isControlled) {
        setLocalIsOpen(open);
        onOpenChange?.(open);
      } else {
        if (!open) {
          contextCloseMenu(menuId);
        } else {
          contextToggleMenu(menuId);
        }
      }
    },
    [isControlled, onOpenChange, contextCloseMenu, contextToggleMenu, menuId]
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

  // Keep local state in sync with context
  useEffect(() => {
    setContextIsOpen(isMenuOpen(menuId));
  }, [isMenuOpen, menuId]);

  // Update local state when controlled state changes
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setLocalIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  // Add click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking inside a dialog
      if ((e.target as Element).closest('[role="dialog"]')) {
        return;
      }

      // Don't close if clicking inside the menu itself
      if ((e.target as Element).closest(".menu-list")) {
        return;
      }

      // Don't close if clicking on the trigger
      if ((e.target as Element).closest(".menu-trigger")) {
        return;
      }

      // Otherwise close the menu
      handleOpenChange(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleOpenChange]);

  // Add escape key handler
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

  // Handle trigger click
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenChange(!isOpen);
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
