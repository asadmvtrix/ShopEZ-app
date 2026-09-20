import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { readJSON, writeJSON } from "../lib/storage";

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

function readStoredPreference() {
  const saved = readJSON(MODE_KEY, null);
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  writeJSON(MODE_KEY, "light");
  return "light";
}

export default function ColorModeProvider({ children }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [preference, setPreferenceState] = useState(readStoredPreference);

  const mode =
    preference === "system" ? (prefersDark ? "dark" : "light") : preference;

  useLayoutEffect(() => {
    applyDocumentMode(mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setPreferenceState(() => {
      const next = mode === "dark" ? "light" : "dark";
      writeJSON(MODE_KEY, next);
      return next;
    });
  }, [mode]);

  const setPreference = useCallback((next) => {
    if (next !== "light" && next !== "dark" && next !== "system") return;
    writeJSON(MODE_KEY, next);
    setPreferenceState(next);
  }, []);

  const value = useMemo(
    () => ({ mode, toggleMode, preference, setPreference }),
    [mode, toggleMode, preference, setPreference]
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}
