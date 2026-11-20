import { expect, test } from "vitest";
import { createChunkClassifier, partitionMapModules, mapSourceLicense } from "./chunks.js";
import { chunkBudget, MAX_JAVASCRIPT_BYTES } from "./chunkBudget.js";
import { zodComments } from "./zodComments.js";

const base = "/node_modules/maplibre-gl/src/";

test("el build conserva el aviso de licencia al compilar MapLibre desde sus fuentes", () => {
  const assets = [];
  mapSourceLicense().generateBundle.call({ emitFile: (asset) => assets.push(asset) });
  expect(assets[0].fileName).toBe("assets/maplibre-gl-6.18.0-LICENSE.txt");
  expect(assets[0].source).toContain("MapLibre contributors");
  expect(assets[0].source).toContain("Redistribution and use in source and binary forms");
});

test("las particiones cartográficas mantienen juntas las dependencias y los ciclos reales", () => {
  const entries = {
    "util/util.ts": ["geo/lng_lat.ts"],
    "geo/lng_lat.ts": ["util/util.ts"],
    "shaders/shaders.ts": [],
    "symbol/symbol_layout.ts": ["data/bucket/symbol_bucket.ts", "util/util.ts"],
    "data/bucket/symbol_bucket.ts": ["style/style_layer/symbol_style_layer.ts"],
    "style/style_layer/symbol_style_layer.ts": ["symbol/symbol_layout.ts"],
    "render/painter.ts": ["data/bucket/symbol_bucket.ts", "shaders/shaders.ts"],
    "ui/map.ts": ["render/painter.ts"],
    "index.ts": ["ui/map.ts"],
  };
  const info = (id) => ({ importedIds: entries[id.slice(base.length)].map((path) => `${base}${path}`) });
  const groups = partitionMapModules(Object.keys(entries).map((path) => `${base}${path}`), info);
  expect(groups.get(`${base}util/util.ts`)).toBe("map-foundation");
  for (const path of ["symbol/symbol_layout.ts", "data/bucket/symbol_bucket.ts", "style/style_layer/symbol_style_layer.ts"]) {
    expect(groups.get(`${base}${path}`)).toBe("map-data");
  }
  expect(groups.get(`${base}render/painter.ts`)).toBe("map-renderer");
  expect(groups.get(`${base}ui/map.ts`)).toBe("map-interface");
  const order = ["map-shaders", "map-foundation", "map-data", "map-renderer", "map-interface"];
  for (const [path, dependencies] of Object.entries(entries)) {
    for (const dependency of dependencies) {
      expect(order.indexOf(groups.get(`${base}${dependency}`))).toBeLessThanOrEqual(order.indexOf(groups.get(`${base}${path}`)));
    }
  }
});

test("no agrupa todo Motion ni todo node_modules en un vendor que anule los imports dinámicos", () => {
  const classify = createChunkClassifier();
  expect(classify("/node_modules/react-dom/client.js")).toBe("react-runtime");
  expect(classify("/node_modules/zod/v4/core/index.js")).toBe("validation");
  expect(classify("/node_modules/motion-dom/dist/index.js")).toBeUndefined();
  expect(classify("/node_modules/framer-motion/dist/index.mjs")).toBeUndefined();
  expect(classify("/src/pages/Home.jsx")).toBeUndefined();
});

const context = { error(message) { throw new Error(message); } };

test.each(["chunk", "asset"])("el presupuesto incluye JavaScript de tipo %s, también workers", (type) => {
  const value = "x".repeat(MAX_JAVASCRIPT_BYTES + 1);
  const output = { type, fileName: "assets/worker.js", ...(type === "chunk" ? { code: value, imports: [] } : { source: value }) };
  expect(() => chunkBudget().generateBundle.call(context, {}, { [output.fileName]: output })).toThrow(/exceden el presupuesto/);
});

test("el presupuesto detecta ciclos entre chunks pero no rechaza imports dinámicos legítimos", () => {
  const a = { type: "chunk", fileName: "a.js", code: "", imports: ["b.js"], dynamicImports: [] };
  const b = { type: "chunk", fileName: "b.js", code: "", imports: ["a.js"], dynamicImports: [] };
  expect(() => chunkBudget().generateBundle.call(context, {}, { "a.js": a, "b.js": b })).toThrow(/circular/);
  a.imports = [];
  a.dynamicImports = ["b.js"];
  expect(() => chunkBudget().generateBundle.call(context, {}, { "a.js": a, "b.js": b })).not.toThrow();
});

test("Zod conserva las anotaciones PURE reales y solo corrige documentación defectuosa", () => {
  const source = '// Wrapped in a `@__PURE__` IIFE:\nconst value = /*@__PURE__*/ makeValue();\n/** a `@__PURE__` example */';
  const plugin = zodComments();
  const result = plugin.transform(source, "/node_modules/zod/v4/core/util.js");
  expect(result.code).toContain("/*@__PURE__*/ makeValue()");
  expect(result.code).not.toContain("`@__PURE__`");
  expect(plugin.transform(source, "/src/application.js")).toBeUndefined();
});