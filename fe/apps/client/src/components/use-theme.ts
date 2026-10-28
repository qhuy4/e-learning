import { useContext } from "react";
import { ThemeProviderContext, initialState } from "./theme-context";

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === initialState)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
