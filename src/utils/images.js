export const FALLBACK_IMAGE = "/image-unavailable.svg";

function localImage(source) {
  if (!source.startsWith("/") || source.startsWith("//") || /[?#\\]/.test(source)) return null;
  try {
    const decoded = decodeURIComponent(source);
    if (decoded.startsWith("//") || /[?#\\]/.test(decoded) || [...decoded].some((char) => char.codePointAt(0) < 32) || decoded.split("/").some((part) => part === "." || part === "..")) return null;
    if (!/\.(?:avif|webp|jpe?g|png|svg)$/i.test(decoded)) return null;
    return new URL(source, "https://local.invalid").pathname;
  } catch { return null; }
}

// Archivos públicos locales o URLs HTTPS, sin SDK, cuenta ni claves de Cloudinary.
export function resolveImage(src, width = 800, quality = 75) {
  if (typeof src !== "string" || !src.trim()) return FALLBACK_IMAGE;
  const source = src.trim();
  if (source.startsWith("/")) return localImage(source) || FALLBACK_IMAGE;
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return FALLBACK_IMAGE;
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(Number.isFinite(width) ? Math.min(2560, Math.max(1, Math.round(width))) : 800));
      url.searchParams.set("q", String(Number.isFinite(quality) ? Math.min(85, Math.max(30, Math.round(quality))) : 75));
    }
    return url.href;
  } catch { return FALLBACK_IMAGE; }
}