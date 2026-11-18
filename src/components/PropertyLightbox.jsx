import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import useReducedMotion from "./map/useReducedMotion.js";
import { FALLBACK_IMAGE, resolveImage } from "../utils/images.js";

const plugins = [Counter, Zoom];
const labels = {
  Lightbox: "Galería de la propiedad",
  "Photo gallery": "Fotografías de la propiedad",
  Close: "Cerrar galería",
  Next: "Siguiente fotografía",
  Previous: "Fotografía anterior",
  "Zoom in": "Acercar fotografía",
  "Zoom out": "Alejar fotografía",
  Slide: "Fotografía",
  Carousel: "Carrusel",
  "{index} of {total}": "Fotografía {index} de {total}",
};

function handleImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  // Captura antes del onError interno de YARL: el onLoad del fallback
  // conserva el ciclo de carga de la librería y evita su icono de error.
  event.stopPropagation();
  image.dataset.fallbackApplied = "true";
  image.removeAttribute("srcset");
  image.alt = "Imagen no disponible";
  image.src = FALLBACK_IMAGE;
}

export default function PropertyLightbox({ images, title, isDemo = true, index, onClose }) {
  const reducedMotion = useReducedMotion();
  const slides = images.map((src, position) => ({
    src: resolveImage(src, 1920, 85),
    alt: `${isDemo ? "Imagen ilustrativa" : "Fotografía"} de ${title || "la propiedad"}, ${position + 1} de ${images.length}`,
  }));

  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      slides={slides}
      plugins={plugins}
      labels={labels}
      controller={{ aria: true, closeOnEscape: true, closeOnBackdropClick: true }}
      portal={{ container: { role: "dialog", "aria-label": "Galería de la propiedad" } }}
      carousel={{ finite: true, preload: 1, imageProps: { onErrorCapture: handleImageError } }}
      render={images.length === 1 ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
      counter={{ separator: "de", container: { style: { backgroundColor: "#0f172a", borderRadius: 6, padding: "6px 10px" } } }}
      styles={{ button: { backgroundColor: "#0f172a", borderRadius: 6 } }}
      animation={reducedMotion ? { fade: 0, swipe: 0, navigation: 0, zoom: 0 } : undefined}
      on={{ exited: onClose }}
    />
  );
}