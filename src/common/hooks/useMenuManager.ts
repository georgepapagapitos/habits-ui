import { useCallback, useEffect, useRef, useState } from "react";
import { useMenuContext } from "./menuContext";

export type MenuPlacement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "auto";

/**
 * Element type that can be either button or div for menu trigger
 */
export type MenuTriggerElement = HTMLButtonElement | HTMLDivElement;

/**
 * Hook to manage context menus throughout the application.
 * Uses MenuContext to ensure only one menu is open at a time.
 */
export const useMenuManager = (placement: MenuPlacement = "bottom-right") => {
  const {
    registerMenu,
    isMenuOpen,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggleMenu: _contextToggleMenu,
    closeMenu: contextCloseMenu,
    openMenu: contextOpenMenu,
  } = useMenuContext();

  // Generate a unique ID for this menu instance
  const [menuId] = useState(() => registerMenu());

  // Use local state that syncs with the context
  const [isOpen, setIsOpen] = useState(() => isMenuOpen(menuId));

  // Add state for menu position and ref for the menu button/trigger
  const menuBtnRef = useRef<MenuTriggerElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Keep local state in sync with context
  useEffect(() => {
    setIsOpen(isMenuOpen(menuId));
  }, [isMenuOpen, menuId]);

  // Add global click handler as fallback to ensure menus can be closed
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const clickedOnMenu = target.closest(".context-menu") !== null;
      const clickedOnMenuButton = target.closest(".menu-button") !== null;

      // Only close if clicking outside both menu and menu button
      if (!clickedOnMenu && !clickedOnMenuButton) {
        contextCloseMenu(menuId);
      }
    };

    // Add with a small delay to avoid the current click event
    const timerId = setTimeout(() => {
      document.addEventListener("click", handleGlobalClick);
    }, 100);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [isOpen, menuId, contextCloseMenu]);

  // Calculate position based on placement and button rect
  const calculatePosition = useCallback(
    (rect: DOMRect) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 180; // Approximate menu width
      const menuHeight = 150; // Approximate menu height

      // Button dimensions and coordinates
      const buttonTop = rect.top;
      const buttonBottom = rect.bottom;
      const buttonLeft = rect.left;
      const buttonRight = rect.right;
      const buttonWidth = rect.width;
      const buttonHeight = rect.height;

      let top = 0;
      let left = 0;

      // Anchor points based on placement
      switch (placement) {
        case "top-left":
          // Align menu bottom to button top, left edges aligned
          top = buttonTop - menuHeight;
          left = buttonLeft;
          break;
        case "top-right":
          // Align menu bottom to button top, right edges aligned
          top = buttonTop - menuHeight;
          left = buttonRight - menuWidth;
          break;
        case "top":
          // Align menu bottom to button top, horizontally centered
          top = buttonTop - menuHeight;
          left = buttonLeft + buttonWidth / 2 - menuWidth / 2;
          break;
        case "bottom-left":
          // Align menu top to button bottom, left edges aligned
          top = buttonBottom;
          left = buttonLeft;
          break;
        case "bottom":
          // Align menu top to button bottom, horizontally centered
          top = buttonBottom;
          left = buttonLeft + buttonWidth / 2 - menuWidth / 2;
          break;
        case "auto": {
          // Check available space in each direction
          const spaceAbove = buttonTop;
          const spaceBelow = viewportHeight - buttonBottom;

          // Prioritize showing below the button if there's space
          if (spaceBelow >= menuHeight) {
            // Show below button
            top = buttonBottom;

            // Horizontally align to button
            if (buttonLeft + menuWidth <= viewportWidth) {
              // Align to left edge if it fits
              left = buttonLeft;
            } else if (buttonRight - menuWidth >= 0) {
              // Align to right edge if it fits
              left = buttonRight - menuWidth;
            } else {
              // Center as best as possible
              left = Math.max(
                0,
                Math.min(viewportWidth - menuWidth, buttonLeft)
              );
            }
          } else if (spaceAbove >= menuHeight) {
            // Show above button
            top = buttonTop - menuHeight;

            // Horizontally align to button
            if (buttonLeft + menuWidth <= viewportWidth) {
              // Align to left edge if it fits
              left = buttonLeft;
            } else if (buttonRight - menuWidth >= 0) {
              // Align to right edge if it fits
              left = buttonRight - menuWidth;
            } else {
              // Center as best as possible
              left = Math.max(
                0,
                Math.min(viewportWidth - menuWidth, buttonLeft)
              );
            }
          } else {
            // Not enough space above or below - show centered over button
            top = Math.max(0, buttonTop - menuHeight / 2 + buttonHeight / 2);
            left = Math.max(0, buttonLeft - menuWidth / 2 + buttonWidth / 2);
          }
          break;
        }
        case "bottom-right":
        default:
          // Align menu top to button bottom, right edges aligned
          top = buttonBottom;
          left = buttonRight - menuWidth;
          break;
      }

      // Ensure the menu stays within viewport bounds
      top = Math.max(5, Math.min(viewportHeight - menuHeight - 5, top));
      left = Math.max(5, Math.min(viewportWidth - menuWidth - 5, left));

      return { top, left };
    },
    [placement]
  );

  // Toggle menu open/closed
  const toggleMenu = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      // If opening the menu, calculate position
      if (!isOpen) {
        if (menuBtnRef.current) {
          const rect = menuBtnRef.current.getBoundingClientRect();
          setMenuPosition(calculatePosition(rect));
        }
        contextOpenMenu(menuId);
      } else {
        contextCloseMenu(menuId);
      }
    },
    [menuId, isOpen, contextCloseMenu, contextOpenMenu, calculatePosition]
  );

  // Explicitly close this menu
  const closeMenu = useCallback(() => {
    contextCloseMenu(menuId);
  }, [menuId, contextCloseMenu]);

  return {
    isOpen,
    toggleMenu,
    closeMenu,
    menuBtnRef,
    menuPosition,
  };
};
