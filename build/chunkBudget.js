export const MAX_JAVASCRIPT_BYTES = 500_000;

/** Presupuesto real sin gzip; incluye los archivos del worker, no eleva el warning de Vite. */
export function chunkBudget() {
  return {
    name: "javascript-chunk-budget",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (!/\.(?:m?js)$/.test(output.fileName)) continue;
        const bytes = Buffer.byteLength(output.type === "chunk" ? output.code : output.source);
        if (bytes > MAX_JAVASCRIPT_BYTES) {
          this.error(`${output.fileName}: ${bytes} bytes exceden el presupuesto de ${MAX_JAVASCRIPT_BYTES}. Revisar imports y particiones.`);
        }
      }
      // No intercambiar un warning de tamaño por ciclos de inicialización.
      const visited = new Set();
      const active = new Set();
      const visit = (name) => {
        if (active.has(name)) this.error(`Dependencia circular entre chunks JavaScript: ${name}`);
        if (visited.has(name)) return;
        const chunk = bundle[name];
        if (chunk?.type !== "chunk") return;
        active.add(name);
        for (const imported of chunk.imports) visit(imported);
        active.delete(name);
        visited.add(name);
      };
      for (const name of Object.keys(bundle)) visit(name);
    },
  };
}