import { useContext } from "react";
import { MenuContextType } from "./types";
import { MenuContext } from "./context";

export const useMenuContext = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenuContext must be used within a MenuProvider");
  }
  return context;
};
