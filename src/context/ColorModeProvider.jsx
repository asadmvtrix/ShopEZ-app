import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ColorModeContext } from "./color-mode-context";
import { createAppTheme } from "../theme";
import { readJSON, writeJSON, remove } from "../lib/storage";

const MODE_KEY = "shopez.colorMode";

export default function ColorModeProvider({ children }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", { noSsr: true });
  const [storedMode, setStoredMode] = useState(() => {
    const saved = readJSON(MODE_KEY, null);
    return saved === "light" || saved === "dark" ? saved : null;
  });

  // Until the visitor picks a side, follow the operating system.
  const mode = storedMode ?? (prefersDark ? "dark" : "light");

  useEffect(() => {
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const toggleMode = useCallback(() => {
    setStoredMode((current) => {
      const next = (current ?? (prefersDark ? "dark" : "light")) === "dark" ? "light" : "dark";
      writeJSON(MODE_KEY, next);
      return next;
    });
  }, [prefersDark]);

  // "system" clears the saved choice and hands control back to the OS.
  const setPreference = useCallback((preference) => {
    if (preference === "system") {
      remove(MODE_KEY);
      setStoredMode(null);
      return;
    }
    writeJSON(MODE_KEY, preference);
    setStoredMode(preference);
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(
    () => ({ mode, toggleMode, preference: storedMode ?? "system", setPreference }),
    [mode, toggleMode, storedMode, setPreference]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
