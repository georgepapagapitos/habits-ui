import { useCallback, useEffect, useState } from "react";
import { useMenuContext } from "./menuContext";

/**
 * Hook to manage context menus throughout the application.
 * Uses MenuContext to ensure only one menu is open at a time.
 */
export const useMenuManager = () => {
  const {
    registerMenu,
    isMenuOpen,
    toggleMenu: contextToggleMenu,
    closeMenu: contextCloseMenu,
  } = useMenuContext();

  // Generate a unique ID for this menu instance
  const [menuId] = useState(() => registerMenu());

  // Use local state that syncs with the context
  const [isOpen, setIsOpen] = useState(() => isMenuOpen(menuId));

  // Keep local state in sync with context
  useEffect(() => {
    setIsOpen(isMenuOpen(menuId));
  }, [isMenuOpen, menuId]);

  // Set up click outside handler
  useEffect(() => {
    // Handle clicks outside the menu
    const handleGlobalClick = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as Element;
        if (
          !target.closest(".menu-button") &&
          !target.closest(".context-menu")
        ) {
          contextCloseMenu(menuId);
        }
      }
    };

    // Listen for clicks to handle outside clicks
    document.addEventListener("mousedown", handleGlobalClick);

    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
    };
  }, [menuId, isOpen, contextCloseMenu]);

  // Toggle menu open/closed
  const toggleMenu = useCallback(
    (e?: React.MouseEvent) => {
      contextToggleMenu(menuId, e);
    },
    [menuId, contextToggleMenu]
  );

  // Explicitly close this menu
  const closeMenu = useCallback(() => {
    contextCloseMenu(menuId);
  }, [menuId, contextCloseMenu]);

  return {
    isOpen,
    toggleMenu,
    closeMenu,
  };
};
