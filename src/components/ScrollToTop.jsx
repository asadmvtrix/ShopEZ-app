import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Instant jump — smooth scroll-to-top on every route change feels slow in a shop.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
