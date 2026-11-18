import { FALLBACK_IMAGE, resolveImage } from "../utils/images.js";

// El placeholder es local: una caída de terceros nunca encadena nuevos errores.
export default function PropertyImage({ src, width = 800, quality = 75, alt, ...props }) {
  const resolved = resolveImage(src, width, quality);
  let responsive = false;
  try {
    const host = new URL(resolved).hostname;
    responsive = host === "images.unsplash.com";
  } catch { /* El resolvedor ya devuelve un fallback seguro. */ }
  return <img
    {...props}
    src={resolved}
    srcSet={responsive ? [400, 800, 1440].map((size) => `${resolveImage(src, size, quality)} ${size}w`).join(", ") : undefined}
    sizes={props.sizes || "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px"}
    alt={alt}
    decoding="async"
    onError={(event) => {
      event.currentTarget.onerror = null;
      event.currentTarget.removeAttribute("srcset");
      if (event.currentTarget.getAttribute("src") !== FALLBACK_IMAGE) event.currentTarget.src = FALLBACK_IMAGE;
    }}
  />;
}