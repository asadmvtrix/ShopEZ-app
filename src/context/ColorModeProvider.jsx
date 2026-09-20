import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { readJSON, writeJSON, remove } from "../lib/storage";

const ColorModeContext = createContext(null);

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within a ColorModeProvider");
  }
  return context;
}

const MODE_KEY = "shopez.colorMode";

function applyDocumentMode(mode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

export default function ColorModeProvider({ children }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [storedMode, setStoredMode] = useState(() => {
    const saved = readJSON(MODE_KEY, null);
    return saved === "light" || saved === "dark" ? saved : null;
  });

  const mode = storedMode ?? (prefersDark ? "dark" : "light");

  useLayoutEffect(() => {
    applyDocumentMode(mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setStoredMode((current) => {
      const next = (current ?? (prefersDark ? "dark" : "light")) === "dark" ? "light" : "dark";
      writeJSON(MODE_KEY, next);
      return next;
    });
  }, [prefersDark]);

  const setPreference = useCallback((preference) => {
    if (preference === "system") {
      remove(MODE_KEY);
      setStoredMode(null);
      return;
    }
    writeJSON(MODE_KEY, preference);
    setStoredMode(preference);
  }, []);

  const value = useMemo(
    () => ({ mode, toggleMode, preference: storedMode ?? "system", setPreference }),
    [mode, toggleMode, storedMode, setPreference]
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}
