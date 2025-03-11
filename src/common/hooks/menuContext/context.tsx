import React, { ReactNode, createContext, useCallback, useState } from "react";
import { MenuContextType } from "./types";

export const MenuContext = createContext<MenuContextType | undefined>(
  undefined
);

let nextMenuId = 0;

export const MenuProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const registerMenu = useCallback(() => {
    return ++nextMenuId;
  }, []);

  const isMenuOpen = useCallback(
    (id: number) => {
      return activeMenuId === id;
    },
    [activeMenuId]
  );

  const openMenu = useCallback((id: number) => {
    setActiveMenuId(id);
  }, []);

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
      e?.stopPropagation();

      if (activeMenuId === id) {
        setActiveMenuId(null);
      } else {
        setActiveMenuId(id);
      }
    },
    [activeMenuId]
  );

  const closeAllMenus = useCallback(() => {
    setActiveMenuId(null);
  }, []);

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
