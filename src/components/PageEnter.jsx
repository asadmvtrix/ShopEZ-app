import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ANIMATE } from "../theme/motion";

export default function PageEnter({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div key={pathname} className={ANIMATE.contentEnter}>
      {children}
    </div>
  );
}
