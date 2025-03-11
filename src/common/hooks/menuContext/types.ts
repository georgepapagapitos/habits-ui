import React from "react";

export interface MenuContextType {
  activeMenuId: number | null;
  registerMenu: () => number;
  isMenuOpen: (id: number) => boolean;
  openMenu: (id: number) => void;
  closeMenu: (id: number) => void;
  toggleMenu: (id: number, e?: React.MouseEvent) => void;
  closeAllMenus: () => void;
}
