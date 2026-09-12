import Box from "@mui/material/Box";

const WIDTH = 38;
const HEIGHT = 24;

const marks = {
  visa: (
    <>
      <rect width={WIDTH} height={HEIGHT} rx="4" fill="#ffffff" stroke="#dfe3e8" />
      <text
        x="19"
        y="16.5"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="0.5"
        fill="#1a1f71"
      >
        VISA
      </text>
    </>
  ),
  mastercard: (
    <>
      <rect width={WIDTH} height={HEIGHT} rx="4" fill="#ffffff" stroke="#dfe3e8" />
      <circle cx="15.5" cy="12" r="6.5" fill="#eb001b" />
      <circle cx="22.5" cy="12" r="6.5" fill="#f79e1b" fillOpacity="0.85" />
    </>
  ),
  amex: (
    <>
      <rect width={WIDTH} height={HEIGHT} rx="4" fill="#016fd0" />
      <text
        x="19"
        y="16"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.3"
        fill="#ffffff"
      >
        AMEX
      </text>
    </>
  ),
  discover: (
    <>
      <rect width={WIDTH} height={HEIGHT} rx="4" fill="#ffffff" stroke="#dfe3e8" />
      <text x="6" y="16" fontSize="7.5" fontWeight="700" letterSpacing="0.2" fill="#4d4d4d">
        DISC
      </text>
      <circle cx="30" cy="13" r="4.5" fill="#f26e21" />
    </>
  ),
};

export default function CardBrandIcon({ brand, dimmed = false, title }) {
  const mark = marks[brand];
  if (!mark) return null;

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={title ?? brand}
      sx={{
        width: WIDTH,
        height: HEIGHT,
        display: "block",
        flexShrink: 0,

        opacity: dimmed ? 0.4 : 1,
        filter: dimmed ? "grayscale(1)" : "none",
        transition: "opacity 150ms, filter 150ms",
      }}
    >
      {mark}
    </Box>
  );
}
