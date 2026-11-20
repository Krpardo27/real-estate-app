import { siteImages } from "../src/data/siteImages.js";
import { resolveImage } from "../src/utils/images.js";

const INVALID_ORIGIN = "VITE_SITE_URL debe ser un origen HTTPS válido, sin ruta, parámetros ni credenciales.";

function siteOrigin(value) {
  if (value === undefined || value === null || value === "") return undefined;
  try {
    // Validar también el texto: URL normaliza rutas, barras y controles inseguros.
    if (typeof value !== "string" || !/^https:\/\/[^/?#\\\s%@]+\/?$/i.test(value)) throw new Error();
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error();
    if (!url.hostname.startsWith("[") && !url.hostname.replace(/\.$/, "").split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) throw new Error();
    return url.origin;
  } catch {
    // Nunca propagar la entrada ni el error del parser: pueden contener secretos.
    throw new Error(INVALID_ORIGIN);
  }
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find((value) => value !== undefined);
}

function removeManagedTags(html) {
  return html.replace(/<(?:meta|link)\b[^>]*>/gi, (tag) => {
    const name = (attribute(tag, "name") || "").toLowerCase();
    const property = (attribute(tag, "property") || "").toLowerCase();
    const rel = (attribute(tag, "rel") || "").toLowerCase();
    return name === "robots" || name === "twitter:image" || property === "og:url" || property === "og:image" || rel.split(/\s+/).includes("canonical") || attribute(tag, "data-homeestate-hero") !== undefined ? "" : tag;
  });
}

/** SEO estático del catálogo demo; configurar un origen no convierte el demo en indexable. */
export function seoAssets(siteUrl) {
  const origin = siteOrigin(siteUrl);
  const home = origin ? `${origin}/` : undefined;
  const robots = `User-agent: *\nAllow: /\n${home ? `Sitemap: ${origin}/sitemap.xml\n` : ""}`;
  const sitemap = home ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${home}</loc></url></urlset>\n` : undefined;

  function middleware(req, res, next) {
    const path = (req.url || "").split(/[?#]/, 1)[0];
    if (path !== "/robots.txt" && path !== "/sitemap.xml") return next();
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const source = path === "/robots.txt" ? robots : sitemap;
    res.statusCode = source === undefined ? 404 : 200;
    res.setHeader("Content-Type", path === "/robots.txt" ? "text/plain; charset=utf-8" : "application/xml; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, follow");
    res.end(req.method === "HEAD" ? undefined : source || "");
  }

  return {
    name: "homeestate-seo-assets",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const social = resolveImage(siteImages.social, 1200);
        const socialUrl = social.startsWith("https://") ? social : origin ? new URL(social, origin).href : undefined;
        const tags = [
          { tag: "meta", attrs: { name: "robots", content: "noindex, follow" }, injectTo: "head" },
        ];
        if (home) tags.push(
          { tag: "link", attrs: { rel: "canonical", href: home }, injectTo: "head" },
          { tag: "meta", attrs: { property: "og:url", content: home }, injectTo: "head" },
        );
        if (socialUrl) tags.push(
          { tag: "meta", attrs: { property: "og:image", content: socialUrl }, injectTo: "head" },
          { tag: "meta", attrs: { name: "twitter:image", content: socialUrl }, injectTo: "head" },
        );
        return { html: removeManagedTags(html), tags };
      },
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      if (sitemap) this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
    },
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}