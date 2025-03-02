import { useState, useCallback, useEffect } from 'react';

// Global state for menu management
let currentlyOpenMenuId: number | null = null;
let nextMenuId = 0;

// Custom event for menu state changes 
const MENU_STATE_CHANGED = 'menu:state-changed';

/**
 * Hook to manage context menus throughout the application.
 * Uses a global variable to ensure only one menu is open at a time.
 */
export const useMenuManager = () => {
  // Generate a unique ID for this menu instance
  const [menuId] = useState(() => ++nextMenuId);
  
  // Local state to track if this menu is open
  const [isOpen, setIsOpen] = useState(false);
  
  // Set up global subscription
  useEffect(() => {
    // Function to synchronize our local state with global state
    const syncWithGlobalState = () => {
      const shouldBeOpen = currentlyOpenMenuId === menuId;
      if (isOpen !== shouldBeOpen) {
        setIsOpen(shouldBeOpen);
      }
    };

    // Register handler for global clicks
    const handleGlobalClick = (event: MouseEvent) => {
      // Handle clicks outside the menu
      if (isOpen) {
        const target = event.target as Element;
        if (!target.closest('.menu-button') && !target.closest('.context-menu')) {
          currentlyOpenMenuId = null;
          setIsOpen(false);
          // Dispatch event to notify other menus
          document.dispatchEvent(new CustomEvent(MENU_STATE_CHANGED));
        }
      }
    };
    
    // Handler for menu state change events
    const handleMenuStateChanged = () => {
      syncWithGlobalState();
    };

    // Synchronize immediately
    syncWithGlobalState();
    
    // Listen for clicks to handle outside clicks
    document.addEventListener('mousedown', handleGlobalClick);
    
    // Listen for custom events from other menus
    document.addEventListener(MENU_STATE_CHANGED, handleMenuStateChanged);
    
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
      document.removeEventListener(MENU_STATE_CHANGED, handleMenuStateChanged);
    };
  }, [menuId, isOpen]);

  // Toggle menu open/closed
  const toggleMenu = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (currentlyOpenMenuId === menuId) {
      // Close this menu if it's already open
      currentlyOpenMenuId = null;
      setIsOpen(false);
      // Dispatch event to notify other menus
      document.dispatchEvent(new CustomEvent(MENU_STATE_CHANGED));
    } else {
      // Open this menu and close any other open menu
      currentlyOpenMenuId = menuId;
      setIsOpen(true);
      // Dispatch event to notify other menus
      document.dispatchEvent(new CustomEvent(MENU_STATE_CHANGED));
    }
  }, [menuId]);

  // Explicitly close this menu
  const closeMenu = useCallback(() => {
    if (currentlyOpenMenuId === menuId) {
      currentlyOpenMenuId = null;
      // Dispatch event to notify other menus
      document.dispatchEvent(new CustomEvent(MENU_STATE_CHANGED));
    }
    setIsOpen(false);
  }, [menuId]);

  return {
    isOpen,
    toggleMenu,
    closeMenu
  };
};