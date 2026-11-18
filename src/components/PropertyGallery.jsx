import { useCallback, useEffect, useRef, useState } from "react";
import Photo from "./PropertyImage.jsx";

export default function PropertyGallery({ images, title, isDemo = true }) {
  const sources = [...new Set((Array.isArray(images) ? images : [])
    .filter((src) => typeof src === "string" && src.trim())
    .map((src) => src.trim()))];
  const [Viewer, setViewer] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const triggerRef = useRef(null);
  const close = useCallback(() => {
    setActiveIndex(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }, []);

  // También se puede cancelar con Escape mientras se descarga el primer chunk.
  useEffect(() => {
    if (activeIndex === null || Viewer) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, Viewer, close]);

  const open = (index, trigger) => {
    triggerRef.current = trigger;
    setActiveIndex(index);
    setLoadError(false);
    if (!Viewer) {
      // Ni la librería, ni los plugins, ni su CSS se solicitan antes del clic.
      import("./PropertyLightbox.jsx")
        .then((module) => setViewer(() => module.default))
        .catch(() => setLoadError(true));
    }
  };

  const imageClassName = `w-full rounded-lg object-cover ${sources.length <= 1 ? "aspect-4/3 max-h-130 sm:aspect-video" : "aspect-4/3"}`;

  return (
    <section aria-label={isDemo ? "Imágenes ilustrativas de la propiedad" : "Fotografías de la propiedad"} className="mb-8">
      <div className={`grid gap-3 ${sources.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        {sources.length ? sources.map((src, index) => (
          <button
            key={src}
            type="button"
            aria-label={`Ampliar fotografía ${index + 1} de ${sources.length}`}
            aria-haspopup="dialog"
            onClick={(event) => open(index, event.currentTarget)}
            className="block min-w-0 cursor-zoom-in rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
          >
            <Photo
              src={src}
              width={index === 0 ? 1280 : 800}
              sizes={sources.length === 1 ? "(max-width: 1279px) 100vw, 1280px" : "(max-width: 639px) 100vw, 640px"}
              alt={`${isDemo ? "Imagen ilustrativa" : "Fotografía"} de ${title || "la propiedad"}, ${index + 1} de ${sources.length}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              className={imageClassName}
            />
          </button>
        )) : (
          <Photo width={1280} sizes="(max-width: 1279px) 100vw, 1280px" alt="Imagen no disponible" className={imageClassName} />
        )}
      </div>
      {isDemo && <p className="mt-2 text-xs text-slate-500">Imágenes ilustrativas del catálogo de demostración.</p>}
      {activeIndex !== null && !Viewer && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-700">
          {loadError
            ? <p role="alert">No se pudo cargar la galería. Cierra y vuelve a intentarlo.</p>
            : <p role="status">Cargando galería…</p>}
          <button type="button" onClick={close} className="min-h-11 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">Cerrar galería</button>
        </div>
      )}
      {activeIndex !== null && Viewer && (
        <Viewer images={sources} title={title} isDemo={isDemo} index={activeIndex} onClose={close} />
      )}
    </section>
  );
}