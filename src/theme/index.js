import { createTheme } from "@mui/material/styles";
import { DURATION, EASE, transition } from "./motion";

const SANS = '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, "SFMono-Regular", monospace';

const palettes = {
  light: {
    mode: "light",
    primary: { main: "#14304a", light: "#3b5a78", dark: "#0b1e30" },
    secondary: { main: "#d9480f", light: "#f2762f", dark: "#a83309" },
    background: { default: "#f4f2ee", paper: "#ffffff" },
    text: { primary: "#14304a", secondary: "#5b6b7b" },
    divider: "#e0dcd4",
  },
  dark: {
    mode: "dark",
    primary: { main: "#8ab6de", light: "#b0d0ea", dark: "#5d8cb5" },
    secondary: { main: "#ff8a4c", light: "#ffa877", dark: "#d2632c" },
    background: { default: "#10161c", paper: "#171f27" },
    text: { primary: "#e6edf3", secondary: "#9aa9b7" },
    divider: "#26313c",
  },
};

// Only used to read the default breakpoint helpers while building the type scale.
const { breakpoints } = createTheme();

// The headings step down on small screens from one place, so a page title can never
// end up larger on a phone than the hero headline above it.
const heading = (weight, sizes, extra = {}) => ({
  fontWeight: weight,
  fontSize: sizes.xs,
  [breakpoints.up("sm")]: { fontSize: sizes.sm ?? sizes.md },
  [breakpoints.up("md")]: { fontSize: sizes.md },
  ...extra,
});

export function createAppTheme(mode) {
  const palette = palettes[mode] ?? palettes.light;

  return createTheme({
    palette,
    shape: { borderRadius: 6 },
    transitions: {
      duration: {
        shortest: DURATION.instant,
        shorter: DURATION.fast,
        short: DURATION.normal,
        standard: DURATION.normal,
        complex: DURATION.slow,
        enteringScreen: DURATION.normal,
        leavingScreen: DURATION.fast,
      },
      easing: {
        easeInOut: EASE,
        easeOut: EASE,
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
    },
    typography: {
      fontFamily: SANS,
      h1: heading(600, { xs: "1.75rem", sm: "2rem", md: "2.25rem" }, { letterSpacing: "-0.02em" }),
      h2: heading(600, { xs: "1.375rem", sm: "1.5rem", md: "1.75rem" }, { letterSpacing: "-0.015em" }),
      h3: heading(600, { xs: "1.15rem", md: "1.375rem" }),
      h4: heading(600, { xs: "1.0625rem", md: "1.125rem" }),
      h5: { fontSize: "1rem", fontWeight: 600 },
      h6: { fontSize: "0.9375rem", fontWeight: 600 },
      subtitle2: { fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.75rem" },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          "#root": { minHeight: "100vh", display: "flex", flexDirection: "column" },
          html: { height: "100%" },
          body: {
            minHeight: "100%",
            margin: 0,
            // Stops accidental horizontal scroll from locking touch/scroll on phones
            // and in Chrome device-mode inspection.
            overflowX: "hidden",
          },
          img: { display: "block", maxWidth: "100%" },
          // Overlay scrollbars on Windows and macOS hide themselves until you scroll,
          // which makes panels that scroll on their own look like dead ends. These are
          // always visible once a track exists.
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.palette.text.disabled} transparent`,
          },
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.text.disabled,
            borderRadius: 8,
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: theme.palette.text.secondary,
          },
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              transitionDuration: "0.01ms !important",
              scrollBehavior: "auto !important",
            },
          },
        }),
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            paddingInline: 18,
            transition: transition("background-color", "color", "border-color", "transform", "box-shadow"),
            "@media (prefers-reduced-motion: no-preference)": {
              "&:active:not(:disabled)": { transform: "scale(0.96)" },
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: transition("background-color", "color", "transform"),
            "@media (prefers-reduced-motion: no-preference)": {
              "&:active": { transform: "scale(0.94)" },
            },
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: "inherit" },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            transition: transition("border-color", "box-shadow", "transform"),
          }),
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      MuiTextField: {
        defaultProps: { size: "small", fullWidth: true },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiLink: {
        defaultProps: { underline: "hover" },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: "none", fontWeight: 600, minHeight: 44 } },
      },
      MuiDrawer: {
        defaultProps: { transitionDuration: DURATION.normal },
      },
      MuiDialog: {
        defaultProps: { transitionDuration: DURATION.normal },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            transition: transition("opacity", "transform"),
          },
        },
      },
    },
  });
}

export { MONO };
