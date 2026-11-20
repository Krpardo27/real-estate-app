import { useReducedMotion } from "framer-motion";

// Entrada única, sin ocultar contenido ni alterar el tamaño reservado del layout.
export function useEntranceMotion() {
  const reducedMotion = useReducedMotion();
  return (index = 0) => ({
    initial: reducedMotion ? false : { opacity: 1, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : Math.min(index * 0.06, 0.18), ease: [0.22, 1, 0.36, 1] },
  });
}