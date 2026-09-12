import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { contentEnter, DURATION, EASE } from "../theme/motion";


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
