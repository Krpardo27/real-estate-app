import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(pathname);

  useEffect(() => {
    // El router restaura scroll por historial; solo cambia el foco en una ruta nueva.
    if (previousPath.current !== pathname && navigationType !== "POP") {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
    previousPath.current = pathname;
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
