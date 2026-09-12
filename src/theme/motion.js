import { keyframes } from "@mui/system";


export const DURATION = {
  instant: 100,
  fast: 160,
  normal: 220,
  slow: 280,
  enter: 200,
};

export const EASE = "cubic-bezier(0.2, 0, 0, 1)";

export function transition(...properties) {
  return properties
    .map((property) => `${property} ${DURATION.fast}ms ${EASE}`)
    .join(", ");
}


export const contentEnter = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const badgeBump = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.28); }
  100% { transform: scale(1); }
`;

export const confirmPulse = keyframes`
  0% { transform: scale(1); }
  45% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;
