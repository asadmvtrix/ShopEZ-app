import SvgIcon from "@mui/material/SvgIcon";

// The bag takes currentColor so the mark inverts correctly between the light and dark
// navbar; the handle keeps the fixed accent, which reads on both. public/favicon.svg
// carries the same two shapes on a navy plate.
export const BRAND_ACCENT = "#ff8a4c";

const BAG =
  "M9.6 12.8H22.4l-1.05 10.6a1.6 1.6 0 0 1-1.59 1.4h-7.52a1.6 1.6 0 0 1-1.59-1.4z";
const HANDLE = "M12.9 13v-2.1a3.1 3.1 0 0 1 6.2 0V13";

// The viewBox is cropped to the glyph so the mark sits tight against the wordmark.
export default function BrandMark(props) {
  return (
    <SvgIcon viewBox="6 4 20 24" {...props}>
      <path d={BAG} fill="currentColor" />
      <path
        d={HANDLE}
        fill="none"
        stroke={BRAND_ACCENT}
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
}
