// Compatibilidad con Zod 4.6.7: dos comentarios de documentación contienen
// un marcador PURE en un lugar donde Rollup intenta interpretarlo como anotación.
// Se corrige solo el texto de documentación; las anotaciones reales siguen intactas.
export function zodComments() {
  return {
    name: "zod-documentation-comments",
    enforce: "pre",
    transform(code, id) {
      if (!/\/node_modules\/zod\/v4\/core\/(?:util|regexes)\.js(?:\?|$)/.test(id.replaceAll("\\", "/"))) return;
      const transformed = code.replace(/\/\*\*[\s\S]*?\*\/|\/\/[^\n]*/g, (comment) => comment.replaceAll("`@__PURE__`", "`pure-annotated`"));
      if (transformed !== code) return { code: transformed, map: null };
    },
  };
}