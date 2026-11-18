import { useEffect, useState } from "react";

const query = "(prefers-reduced-motion: reduce)";
const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined" || !window.matchMedia ? true : window.matchMedia(query).matches,
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia(query);
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
};

export default useReducedMotion;