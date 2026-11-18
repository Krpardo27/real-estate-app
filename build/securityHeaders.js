import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// Una sola fuente de verdad. No importar JSON con sintaxis dependiente de Node.
const { headers: rules } = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const headerRules = rules.map(({ source, headers }) => ({
  // Estas reglas públicas usan grupos regex; rewrites y fallback pertenecen a Vercel/Vite.
  pattern: new RegExp(`^(?:${source})$`),
  headers,
}));

export function securityHeaders() {
  let devNonce;

  function middleware(req, res, next) {
    let pathname = (req.url || "/").split(/[?#]/, 1)[0];
    try { pathname = decodeURIComponent(pathname); } catch { /* Vite resolverá la URL malformada. */ }
    for (const { pattern, headers } of headerRules) {
      if (pattern.test(pathname)) {
        for (const { key, value } of headers) {
          // Vite necesita su preámbulo inline en dev. El nonce aleatorio evita
          // habilitar unsafe-inline/unsafe-eval y no altera la política de producción.
          const header = devNonce && key.toLowerCase() === "content-security-policy"
            ? value.replace("script-src 'self'", `script-src 'self' 'nonce-${devNonce}'`)
            : value;
          res.setHeader(key, header);
        }
      }
    }
    next();
  }

  function register(server) {
    // Registrar antes del middleware interno, también para errores y recursos.
    server.middlewares.use(middleware);
  }

  return {
    name: "homeestate-security-headers",
    // Debe envolver también robots/sitemap atendidos por el plugin SEO.
    enforce: "pre",
    config(_config, { command, isPreview }) {
      if (command === "serve" && !isPreview) {
        devNonce = randomBytes(18).toString("base64");
        return { html: { cspNonce: devNonce } };
      }
    },
    configureServer: register,
    configurePreviewServer: register,
  };
}