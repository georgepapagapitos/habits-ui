import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { MenuProvider, useMenuContext } from "./menuContext";
import { useMenuManager } from "./useMenuManager";

// Test wrapper component
const wrapper = ({ children }: { children: ReactNode }) => (
  <MenuProvider>{children}</MenuProvider>
);

describe("MenuContext", () => {
  test("provides menu context values", () => {
    const { result } = renderHook(() => useMenuContext(), { wrapper });

    expect(result.current.activeMenuId).toBeNull();
    expect(typeof result.current.registerMenu).toBe("function");
    expect(typeof result.current.isMenuOpen).toBe("function");
    expect(typeof result.current.openMenu).toBe("function");
    expect(typeof result.current.closeMenu).toBe("function");
    expect(typeof result.current.toggleMenu).toBe("function");
    expect(typeof result.current.closeAllMenus).toBe("function");
  });

  test("registers a new menu with a unique ID", () => {
    const { result } = renderHook(() => useMenuContext(), { wrapper });

    let id1: number, id2: number;

    act(() => {
      id1 = result.current.registerMenu();
    });

    act(() => {
      id2 = result.current.registerMenu();
    });

    expect(id2).toBeGreaterThan(id1);
  });

  test("toggles menu open and closed", () => {
    const { result } = renderHook(() => useMenuContext(), { wrapper });

    // Register a menu
    let menuId: number;
    act(() => {
      menuId = result.current.registerMenu();
    });

    // Initially closed
    expect(result.current.isMenuOpen(menuId!)).toBe(false);

    // Open the menu
    act(() => {
      result.current.openMenu(menuId!);
    });
    expect(result.current.isMenuOpen(menuId!)).toBe(true);

    // Close the menu
    act(() => {
      result.current.closeMenu(menuId!);
    });
    expect(result.current.isMenuOpen(menuId!)).toBe(false);

    // Toggle the menu open
    act(() => {
      result.current.toggleMenu(menuId!);
    });
    expect(result.current.isMenuOpen(menuId!)).toBe(true);

    // Toggle the menu closed
    act(() => {
      result.current.toggleMenu(menuId!);
    });
    expect(result.current.isMenuOpen(menuId!)).toBe(false);
  });

  test("ensures only one menu is open at a time", () => {
    const { result } = renderHook(() => useMenuContext(), { wrapper });

    // Register two menus
    let menuId1: number, menuId2: number;
    act(() => {
      menuId1 = result.current.registerMenu();
      menuId2 = result.current.registerMenu();
    });

    // Open first menu
    act(() => {
      result.current.openMenu(menuId1!);
    });
    expect(result.current.isMenuOpen(menuId1!)).toBe(true);
    expect(result.current.isMenuOpen(menuId2!)).toBe(false);

    // Open second menu - should close the first
    act(() => {
      result.current.openMenu(menuId2!);
    });
    expect(result.current.isMenuOpen(menuId1!)).toBe(false);
    expect(result.current.isMenuOpen(menuId2!)).toBe(true);
  });
});

describe("useMenuManager", () => {
  test("uses menu context to manage menus", () => {
    const { result } = renderHook(() => useMenuManager(), { wrapper });

    // Menu should start closed
    expect(result.current.isOpen).toBe(false);

    // Toggle menu open
    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isOpen).toBe(true);

    // Close menu
    act(() => {
      result.current.closeMenu();
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("ensures only one menu is open with useMenuManager", () => {
    // Use a single wrapper to ensure both hooks share the same context
    const { result: hookResults } = renderHook(
      () => ({
        menu1: useMenuManager(),
        menu2: useMenuManager(),
      }),
      { wrapper }
    );

    // Open first menu
    act(() => {
      hookResults.current.menu1.toggleMenu();
    });
    expect(hookResults.current.menu1.isOpen).toBe(true);
    expect(hookResults.current.menu2.isOpen).toBe(false);

    // Open second menu - should close the first
    act(() => {
      hookResults.current.menu2.toggleMenu();
    });
    expect(hookResults.current.menu1.isOpen).toBe(false);
    expect(hookResults.current.menu2.isOpen).toBe(true);
  });
});
