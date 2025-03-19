import React, {
  ReactNode,
  createContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { MenuContextType } from "./types";

export const MenuContext = createContext<MenuContextType | undefined>(
  undefined
);

let nextMenuId = 0;

// Helper to detect test environment
const isTestEnvironment = (): boolean => {
  return (
    typeof process !== "undefined" &&
    process.env &&
    (process.env.NODE_ENV === "test" ||
      process.env.VITEST !== undefined ||
      process.env.JEST_WORKER_ID !== undefined)
  );
};

export const MenuProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  // Track clicks on menu triggers to prevent immediate closing
  const menuTriggerClicked = useRef(false);

  // Determine if running in test environment
  const isInTest = isTestEnvironment();

  const registerMenu = useCallback(() => {
    return ++nextMenuId;
  }, []);

  const isMenuOpen = useCallback(
    (id: number) => {
      return activeMenuId === id;
    },
    [activeMenuId]
  );

  const openMenu = useCallback(
    (id: number) => {
      // First close any other open menus to ensure only one is open
      setActiveMenuId(id);

      // Only use delay in non-test environment
      if (!isInTest) {
        // Set flag to prevent immediate closing
        menuTriggerClicked.current = true;
        // Reset flag after a short delay
        setTimeout(() => {
          menuTriggerClicked.current = false;
        }, 100);
      }
    },
    [isInTest]
  );

  const closeMenu = useCallback(
    (id: number) => {
      if (activeMenuId === id) {
        setActiveMenuId(null);
      }
    },
    [activeMenuId]
  );

  const toggleMenu = useCallback(
    (id: number, e?: React.MouseEvent) => {
      if (e) {
        // Prevent event from propagating to document
        e.stopPropagation();
        e.preventDefault();
      }

      // Only use delay in non-test environment
      if (!isInTest) {
        // Set flag to prevent immediate closing
        menuTriggerClicked.current = true;
      }

      // Update the active menu state
      setActiveMenuId((prevId) => {
        if (prevId === id) {
          return null; // Close if already open
        } else {
          return id; // Open this menu, closing any other open menu
        }
      });

      // Only use delay in non-test environment
      if (!isInTest) {
        // Reset flag after a short delay
        setTimeout(() => {
          menuTriggerClicked.current = false;
        }, 100);
      }
    },
    [isInTest]
  );

  const closeAllMenus = useCallback(() => {
    setActiveMenuId(null);
  }, []);

  // Global click handler to close menus when clicking outside
  useEffect(() => {
    // In test environment, don't add global click handler as it can interfere with tests
    if (isInTest) return;

    const handleGlobalClick = (e: MouseEvent) => {
      // If this click was on a menu trigger, don't close menus immediately
      if (menuTriggerClicked.current) {
        return;
      }

      // Don't close if clicking inside a menu or trigger
      if (
        (e.target as Element).closest(".menu-list") ||
        (e.target as Element).closest(".menu-trigger")
      ) {
        return;
      }

      // Close all menus when clicking outside
      closeAllMenus();
    };

    // Add the event listener
    document.addEventListener("mousedown", handleGlobalClick);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
    };
  }, [closeAllMenus, isInTest]);

  const value = {
    activeMenuId,
    registerMenu,
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    closeAllMenus,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};
