import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { securityHeaders } from "./securityHeaders.js";
import { seoAssets } from "./seo.js";

const { headers: rules } = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const publicHeaders = Object.fromEntries(rules.find(({ source }) => source === "/(.*)").headers.map(({ key, value }) => [key, value]));

function middleware(plugin, hook) {
  const use = vi.fn();
  expect(plugin[hook]({ middlewares: { use } })).toBeUndefined();
  expect(use).toHaveBeenCalledOnce();
  return use.mock.calls[0][0];
}

function response() {
  const headers = {};
  return { headers, setHeader: (key, value) => { headers[key] = value; }, end: vi.fn() };
}

describe.each(["configureServer", "configurePreviewServer"])("securityHeaders: %s", (hook) => {
  it.each(["/", "/index.html", "/not-found", "/src/main.jsx?t=123", "/favicon.svg", "/robots.txt", "/sitemap.xml"])("aplica exactamente la política pública en %s", (url) => {
    const next = vi.fn();
    const res = response();
    middleware(securityHeaders(), hook)({ url }, res, next);
    expect(res.headers).toEqual(publicHeaders);
    expect(next).toHaveBeenCalledOnce();
    expect(res.end).not.toHaveBeenCalled();
  });

  it.each(["/search", "/search?q=house", "/map", "/favorites", "/property/123", "/%73earch"])("conserva noindex, follow en %s", (url) => {
    const res = response();
    middleware(securityHeaders(), hook)({ url }, res, vi.fn());
    expect(res.headers).toEqual({ ...publicHeaders, "X-Robots-Tag": "noindex, follow" });
  });

  it("conserva la caché pública exclusivamente para assets", () => {
    const res = response();
    middleware(securityHeaders(), hook)({ url: "/assets/app-abcd.js?v=1" }, res, vi.fn());
    const cache = rules.find(({ source }) => source === "/assets/(.*)").headers;
    expect(res.headers).toEqual({ ...publicHeaders, ...Object.fromEntries(cache.map(({ key, value }) => [key, value])) });
  });

  it("no amplía script-src/connect-src ni añade credenciales o excepciones de desarrollo", () => {
    const res = response();
    middleware(securityHeaders(), hook)({ url: "/@vite/client" }, res, vi.fn());
    expect(res.headers["Content-Security-Policy"]).toBe(publicHeaders["Content-Security-Policy"]);
    expect(res.headers["Content-Security-Policy"]).toContain("script-src 'self';");
    expect(res.headers["Content-Security-Policy"]).not.toMatch(/unsafe-eval|nonce-|ws:|localhost|script-src[^;]*unsafe-inline/);
    expect(res.headers).not.toHaveProperty("Access-Control-Allow-Origin");
    expect(res.headers).not.toHaveProperty("Access-Control-Allow-Credentials");
  });

  it("tolera URLs malformadas sin omitir las cabeceras globales", () => {
    const res = response();
    const next = vi.fn();
    middleware(securityHeaders(), hook)({ url: "/%E0%A4%A" }, res, next);
    expect(res.headers).toEqual(publicHeaders);
    expect(next).toHaveBeenCalledOnce();
  });

  it("protege también las respuestas terminadas por el plugin SEO", () => {
    const plugin = securityHeaders();
    expect(plugin.enforce).toBe("pre");
    const secure = middleware(plugin, hook);
    const seo = middleware(seoAssets("https://example.com"), hook);
    for (const url of ["/robots.txt", "/sitemap.xml"]) {
      const res = response();
      secure({ url, method: "GET" }, res, () => seo({ url, method: "GET" }, res, vi.fn()));
      expect(res.headers).toMatchObject(publicHeaders);
      expect(res.headers["X-Robots-Tag"]).toBe("noindex, follow");
      expect(res.end).toHaveBeenCalledOnce();
    }
  });
});

it("dev y preview aplican las mismas cabeceras sin modificar Vercel", () => {
  for (const url of ["/", "/search?q=test", "/property/1", "/assets/app.js", "/robots.txt"]) {
    const dev = response();
    const preview = response();
    const plugin = securityHeaders();
    middleware(plugin, "configureServer")({ url }, dev, vi.fn());
    middleware(plugin, "configurePreviewServer")({ url }, preview, vi.fn());
    expect(dev.headers).toEqual(preview.headers);
  }
  expect(JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")).headers).toEqual(rules);
});

it("dev configura un nonce aleatorio para el preámbulo React sin permitir scripts arbitrarios", () => {
  const plugin = securityHeaders();
  const config = plugin.config({}, { command: "serve", isPreview: false });
  const nonce = config.html.cspNonce;
  expect(nonce).toMatch(/^[A-Za-z0-9+/]{24}$/);
  const res = response();
  middleware(plugin, "configureServer")({ url: "/" }, res, vi.fn());
  const policy = res.headers["Content-Security-Policy"];
  expect(policy.replace(` 'nonce-${nonce}'`, "")).toBe(publicHeaders["Content-Security-Policy"]);
  expect(policy).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
  const other = securityHeaders().config({}, { command: "serve", isPreview: false });
  expect(other.html.cspNonce).not.toBe(nonce);
});

it.each([
  { command: "build", isPreview: false },
  { command: "serve", isPreview: true },
])("producción y preview mantienen intacta la CSP de despliegue: %j", (environment) => {
  const plugin = securityHeaders();
  expect(plugin.config({}, environment)).toBeUndefined();
  const res = response();
  middleware(plugin, "configurePreviewServer")({ url: "/" }, res, vi.fn());
  expect(res.headers).toEqual(publicHeaders);
});