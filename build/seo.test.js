import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { createServer } from "vite";
import { seoAssets } from "./seo.js";
import { siteImages } from "../src/data/siteImages.js";
import { resolveImage } from "../src/utils/images.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function assets(plugin) {
  const emitted = [];
  plugin.generateBundle.call({ emitFile: (asset) => emitted.push(asset) });
  return Object.fromEntries(emitted.map(({ fileName, source }) => [fileName, source]));
}

function request(plugin, hook, url, method = "GET") {
  const use = vi.fn();
  plugin[hook]({ middlewares: { use } });
  const res = { setHeader: vi.fn(), end: vi.fn() };
  const next = vi.fn();
  use.mock.calls[0][0]({ url, method }, res, next);
  return { res, next };
}

describe("seoAssets: origen público", () => {
  it.each([undefined, null, ""])("no inventa origen si está vacío (%s)", (origin) => {
    const plugin = seoAssets(origin);
    const transformed = plugin.transformIndexHtml.handler(html);
    expect(transformed.tags.some(({ attrs }) => attrs.rel === "canonical" || attrs.property === "og:url")).toBe(false);
    expect(assets(plugin)).toEqual({ "robots.txt": "User-agent: *\nAllow: /\n" });
    expect(transformed.tags).toContainEqual(expect.objectContaining({ attrs: { name: "robots", content: "noindex, follow" } }));
  });

  it.each([
    "https://example.com", "https://example.com/", "https://EXAMPLE.com:443/",
  ])("normaliza un origen HTTPS válido (%s)", (origin) => {
    const plugin = seoAssets(origin);
    const { tags } = plugin.transformIndexHtml.handler(html);
    expect(tags).toContainEqual(expect.objectContaining({ attrs: { rel: "canonical", href: "https://example.com/" } }));
    // La demo permanece noindex aunque el origen esté configurado.
    expect(tags).toContainEqual(expect.objectContaining({ attrs: { name: "robots", content: "noindex, follow" } }));
    const output = assets(plugin);
    expect(output["robots.txt"]).toBe("User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n");
    expect(output["sitemap.xml"].match(/<loc>/g)).toHaveLength(1);
    expect(output["sitemap.xml"]).toContain("<loc>https://example.com/</loc>");
    expect(output["sitemap.xml"]).not.toMatch(/<loc>[^<]*\/(?:search|property|favorites|map)(?:[/?<])/);
  });

  it.each([
    "http://example.com", "//example.com", "javascript:alert(1)", "https://example.com/path",
    "https://example.com/?token=PRIVATE", "https://example.com?", "https://example.com/#PRIVATE",
    "https://example.com#", "https://user:PRIVATE@example.com", "https://@example.com",
    "https://example.com/../", "https://example.com/./", "https://example.com\\PRIVATE",
    "https://example.com\n", " https://example.com", " ", "https://example.com/%2e/",
    "https://%65xample.com", "https://-invalid.example", "https://example.com:99999", 42, {},
  ])("rechaza entradas inseguras sin revelarlas (%#)", (value) => {
    expect(() => seoAssets(value)).toThrow(/^VITE_SITE_URL debe ser un origen HTTPS válido, sin ruta, parámetros ni credenciales\.$/);
  });
});

describe("seoAssets: HTML e imágenes", () => {
  it("no precarga el hero en el HTML compartido por rutas y conserva la imagen social", () => {
    const { tags, html: transformed } = seoAssets().transformIndexHtml.handler(html);
    expect(tags.some(({ attrs }) => attrs.rel === "preload")).toBe(false);
    expect(tags).toContainEqual(expect.objectContaining({ attrs: { property: "og:image", content: resolveImage(siteImages.social, 1200) } }));
    expect(transformed).toContain("Catálogo demo de propiedades en Chile | HomeEstate");
    expect(transformed).toContain('src="/src/main.jsx"');
    expect(transformed).not.toContain('name="robots"');
  });

  it("elimina canonical e imágenes sociales anteriores incluso sin origen", () => {
    const input = `${html}<link href='https://old.example/' rel='canonical'><meta content='https://old.example/' property='og:url'><meta property='og:image' content='old'><meta name='twitter:image' content='old'>`;
    const result = seoAssets().transformIndexHtml.handler(input);
    expect(result.html).not.toContain("old");
    expect(result.html).not.toContain("canonical");
  });

  it("admite fotografías públicas locales sin importar assets desde Node", () => {
    const previous = { hero: siteImages.hero, social: siteImages.social };
    try {
      siteImages.hero = "/images/hero.webp";
      siteImages.social = "/images/social.webp";
      const withoutOrigin = seoAssets().transformIndexHtml.handler(html).tags;
      expect(withoutOrigin.some(({ attrs }) => attrs.rel === "preload")).toBe(false);
      expect(withoutOrigin.some(({ attrs }) => attrs.property === "og:image")).toBe(false);
      const withOrigin = seoAssets("https://example.com").transformIndexHtml.handler(html).tags;
      expect(withOrigin).toContainEqual(expect.objectContaining({ attrs: { property: "og:image", content: "https://example.com/images/social.webp" } }));
    } finally {
      Object.assign(siteImages, previous);
    }
  });

  it("integra transformIndexHtml con Vite sin ejecutar build", async () => {
    const server = await createServer({ configFile: false, plugins: [seoAssets("https://example.com")], server: { middlewareMode: true, watch: null }, appType: "custom" });
    try {
      const output = await server.transformIndexHtml("/", html);
      expect(output.match(/name="robots"/g)).toHaveLength(1);
      expect(output).toContain('content="noindex, follow"');
      expect(output).toContain('rel="canonical" href="https://example.com/"');
      expect(output).toContain("&amp;fit=crop");
      expect(output).not.toContain("local.invalid");
    } finally {
      await server.close();
    }
  });
});

describe.each(["configureServer", "configurePreviewServer"])("seoAssets: %s", (hook) => {
  it("sirve robots/sitemap coherentes con los assets emitidos", () => {
    const plugin = seoAssets("https://example.com");
    for (const [file, source] of Object.entries(assets(plugin))) {
      const { res, next } = request(plugin, hook, `/${file}?ignored=1`);
      expect(res.statusCode).toBe(200);
      expect(res.end).toHaveBeenCalledWith(source);
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", file.endsWith("xml") ? "application/xml; charset=utf-8" : "text/plain; charset=utf-8");
      expect(res.setHeader).toHaveBeenCalledWith("X-Robots-Tag", "noindex, follow");
      expect(next).not.toHaveBeenCalled();
    }
  });

  it("responde HEAD sin cuerpo y 404 sin sitemap si falta origen", () => {
    const plugin = seoAssets();
    const head = request(plugin, hook, "/robots.txt", "HEAD");
    expect(head.res.statusCode).toBe(200);
    expect(head.res.end).toHaveBeenCalledWith(undefined);
    const missing = request(plugin, hook, "/sitemap.xml");
    expect(missing.res.statusCode).toBe(404);
    expect(missing.res.end).toHaveBeenCalledWith("");
    expect(missing.next).not.toHaveBeenCalled();
  });

  it("delega rutas de la SPA y métodos ajenos", () => {
    for (const [url, method] of [["/", "GET"], ["/search", "GET"], ["/robots.txt", "POST"]]) {
      const { res, next } = request(seoAssets(), hook, url, method);
      expect(next).toHaveBeenCalledOnce();
      expect(res.end).not.toHaveBeenCalled();
    }
  });
});

it("sin dominio no se inventa canonical ni URL pública", () => {
  const plugin = seoAssets();
  const transformed = plugin.transformIndexHtml.handler("</head>");
  expect(JSON.stringify(transformed)).not.toMatch(/canonical|og:url/);
  const files = [];
  plugin.generateBundle.call({ emitFile: (asset) => files.push(asset) });
  expect(files.find((file) => file.fileName === "sitemap.xml")).toBeUndefined();
});
it("dominio verificado genera canonical y sitemap solo de portada", () => {
  const plugin = seoAssets("https://example.com");
  expect(plugin.transformIndexHtml.handler("</head>").tags).toContainEqual(expect.objectContaining({ attrs: { rel: "canonical", href: "https://example.com/" } }));
  const files = [];
  plugin.generateBundle.call({ emitFile: (asset) => files.push(asset) });
  expect(files.find((file) => file.fileName === "robots.txt").source).toMatch(/Sitemap: https:\/\/example.com\/sitemap.xml/);
  expect(files.find((file) => file.fileName === "sitemap.xml").source).toMatch(/<loc>https:\/\/example.com\/<\/loc>/);
});
it("rechaza dominios malformados, inseguros o con credenciales", () => {
  for (const value of ["https://Home Estate.cl", "http://example.com", "https://user:pass@example.com", "https://example.com/path", "https://example.com?x=1"]) expect(() => seoAssets(value)).toThrow();
});

it("imagen social local y ausencia de precargas ajenas a la ruta", () => {
  const previous = { hero: siteImages.hero, social: siteImages.social };
  try {
    Object.assign(siteImages, { hero: "/images/hero/casa.webp", social: "/images/social.webp" });
    const { tags } = seoAssets("https://example.com").transformIndexHtml.handler("</head>");
    expect(tags.some(({ attrs }) => attrs.rel === "preload")).toBe(false);
    expect(tags).toContainEqual(expect.objectContaining({ attrs: { property: "og:image", content: "https://example.com/images/social.webp" } }));
    expect(JSON.stringify(tags)).not.toMatch(/unsplash|cloudinary|imagesrcset/);
    expect(JSON.stringify(seoAssets().transformIndexHtml.handler("</head>"))).not.toMatch(/og:image/);
  } finally {
    Object.assign(siteImages, previous);
  }
});