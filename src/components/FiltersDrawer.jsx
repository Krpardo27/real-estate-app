import { useEffect, useId, useRef } from "react";
import { FiX } from "react-icons/fi";

// Contador compartido: cerrar un diálogo no desbloquea el scroll de otro.
let scrollLocks = 0;
let previousOverflow = "";

const FiltersDrawer = ({ open, onClose, children }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    dialog.showModal(); // Modal nativo: resto de la página inerte y foco confinado.
    if (scrollLocks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
      if (opener?.isConnected && typeof opener.focus === "function") opener.focus({ preventScroll: true });
    };
  }, [open]);

  const handleBackdrop = (event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      onClose();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Tab") return;
    // Algunos navegadores llevan el foco a su interfaz al alcanzar un extremo
    // del dialog nativo. Mantener un ciclo predecible dentro del formulario.
    const controls = [...event.currentTarget.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={handleBackdrop}
      onKeyDown={handleKeyDown}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-[90%] max-w-sm border-0 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-black/40"
    >
      <div className="h-full overflow-y-auto overscroll-contain p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 id={titleId} className="font-semibold text-lg">Filtros</h2>
          <button ref={closeRef} type="button" aria-label="Cerrar filtros" onClick={onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
};

export default FiltersDrawer;
