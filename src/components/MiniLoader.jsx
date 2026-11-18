const MiniLoader = ({ label = "Cargando…" }) => {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-8 text-sm text-slate-600">
      <span aria-hidden="true" className="h-5 w-5 shrink-0 border-2 border-slate-500 border-t-transparent rounded-full motion-safe:animate-spin" />
      <span>{label}</span>
    </div>
  );
};

export default MiniLoader;
