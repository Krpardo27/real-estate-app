import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const mapPackage = require.resolve("maplibre-gl/package.json");
const mapRoot = dirname(mapPackage);
const mapVersion = JSON.parse(readFileSync(mapPackage, "utf8")).version;
if (mapVersion !== "6.18.0") {
  throw new Error("Revisar la compilación modular y las pruebas del mapa antes de actualizar MapLibre 6.18.0.");
}

// El dist de MapLibre es un único módulo: Rollup no puede dividir sus funciones.
// Las fuentes generadas vienen en el paquete fijado; no se modifican ni se omiten APIs.
export const mapAliases = [
  { find: /^maplibre-gl$/, replacement: join(mapRoot, "src/index.ts") },
  { find: /^maplibre-worker-source$/, replacement: join(mapRoot, "src/source/worker.ts") },
];

export function mapSourceLicense() {
  return {
    name: "maplibre-source-license",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: `assets/maplibre-gl-${mapVersion}-LICENSE.txt`,
        source: readFileSync(join(mapRoot, "LICENSE.txt"), "utf8"),
      });
    },
  };
}

function mapDependencyChunk(id) {
  const path = id.replaceAll("\\", "/");
  if (path.includes("commonjsHelpers")) return "runtime-helpers";
  if (/\/node_modules\/(?:@maplibre\/maplibre-gl-style-spec|@mapbox\/jsonlint-lines-primitives|json-stringify-pretty-compact|minimist)\//.test(path)) return "map-style-spec";
  if (/\/node_modules\/(?:@maplibre\/mlt|@mapbox\/vector-tile|pbf|@maplibre\/vt-pbf)\//.test(path)) return "map-vector-codecs";
  if (/\/node_modules\/(?:bidi-js|@mapbox\/tiny-sdf)\//.test(path)) return "map-text";
  if (/\/node_modules\/(?:gl-matrix|earcut|kdbush|quickselect|potpack|tinyqueue|murmurhash-js|@mapbox\/point-geometry|@mapbox\/unitbezier|@maplibre\/geojson-vt)\//.test(path)) return "map-geometry";
}

function applicationChunk(id) {
  const path = id.replaceAll("\\", "/");
  const map = mapDependencyChunk(path);
  if (map) return map;
  if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(path)) return "react-runtime";
  if (/\/node_modules\/(?:react-router|react-router-dom)\//.test(path)) return "router";
  if (path.includes("/node_modules/zod/")) return "validation";
  if (/\/node_modules\/(?:react-hook-form|@hookform\/resolvers)\//.test(path)) return "forms";
  // Motion se deja al grafo de imports: agruparlo entero eliminaría su carga diferida.
}

export function partitionMapModules(moduleIds, getModuleInfo) {
  const ids = [...moduleIds].filter((id) => id.includes("/node_modules/maplibre-gl/src/"));
  const nodes = new Set(ids);
  const assigned = new Map();
  const claim = (name, roots) => {
    const visit = (id) => {
      if (assigned.has(id) || !nodes.has(id)) return;
      assigned.set(id, name);
      for (const dependency of getModuleInfo(id).importedIds) visit(dependency);
    };
    roots.forEach(visit);
  };

  // Cada capa incluye su clausura de dependencias aún no asignadas. Cortar solo
  // por carpetas creaba ciclos entre clases, registros, renderer e interfaz.
  // Estas fronteras conservan el orden de inicialización, también en el worker.
  claim("map-shaders", ids.filter((id) => id.includes("/src/shaders/glsl/") || id.endsWith("/src/shaders/shaders.ts")));
  claim("map-foundation", ids.filter((id) => /\/src\/(?:util\/(?:util|evented|image|web_worker_transfer|struct_array)|geo\/(?:lng_lat|lng_lat_bounds|mercator_coordinate)|tile\/tile_id|webgl\/context|data\/array_types\.g)\.ts$/.test(id)));
  claim("map-data", ids.filter((id) => /\/src\/(?:symbol\/|data\/bucket\/|style\/create_style_layer\.ts)/.test(id)));
  claim("map-renderer", ids.filter((id) => /\/src\/(?:render\/|webgl\/|geo\/)/.test(id)));
  claim("map-interface", ids);
  return assigned;
}

export function createChunkClassifier({ worker = false } = {}) {
  let mapModules;
  return (id, context) => {
    if (id.includes("/node_modules/maplibre-gl/src/")) {
      mapModules ??= partitionMapModules(context.getModuleIds(), context.getModuleInfo);
      return mapModules.get(id);
    }
    return worker ? mapDependencyChunk(id) : applicationChunk(id);
  };
}