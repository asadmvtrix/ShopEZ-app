import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { contentEnter, DURATION, EASE } from "../theme/motion";

// One shared enter for every route: brief fade, no slide. Query changes are ignored
// so filters/search do not replay the animation.
export default function PageEnter({ children }) {
  const { pathname } = useLocation();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <Box
      key={pathname}
      sx={
        reduceMotion
          ? undefined
          : {
              animation: `${contentEnter} ${DURATION.enter}ms ${EASE} backwards`,
            }
      }
    >
      {children}
    </Box>
  );
}
