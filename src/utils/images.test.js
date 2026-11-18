import { test, expect } from "vitest";
import { resolveImage, FALLBACK_IMAGE } from "./images.js";
import { propertyImages } from "../data/siteImages.js";

test("admite fotos locales públicas sin configuración ni proveedor", () => {
  expect(resolveImage("/images/hero/casa.webp")).toBe("/images/hero/casa.webp");
  expect(resolveImage("/images/properties/1/salón principal.jpg")).toBe("/images/properties/1/sal%C3%B3n%20principal.jpg");
  expect(resolveImage(FALLBACK_IMAGE)).toBe(FALLBACK_IMAGE);
});
test("rechaza protocolos inseguros, traversal y rutas no fotográficas", () => {
  for (const value of [null, undefined, 42, {}, "", "//example.com/a.jpg", "/images/../a.jpg", "/images/%2e%2e/a.jpg", "/%2Fexample.com/a.jpg", "/images/%5Cfile.jpg", "/images/%00a.jpg", "/images/a.html", "/images/invalid%xx.jpg", "http://example.com/a.jpg", "javascript:alert(1)", "data:image/svg+xml,test", "https://user:pass@example.com/a.jpg", "folder/cloudinary-id"]) expect(resolveImage(value)).toBe(FALLBACK_IMAGE);
});
test("URLs HTTPS siguen disponibles durante la sustitución editorial", () => {
  expect(resolveImage("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
  const url = new URL(resolveImage("https://images.unsplash.com/photo-test", 400, 60));
  expect(url.searchParams.get("w")).toBe("400");
  expect(url.searchParams.get("q")).toBe("60");
});
test("galerías locales respetan orden, IDs y ausencia explícita de fotos", () => {
  const property = { id: 1, isDemo: true, type: "house", images: ["https://example.com/old.jpg"] };
  const config = { properties: { 1: ["/images/properties/1/exterior.webp", "/images/properties/1/salon.webp", "/images/properties/1/exterior.webp"] } };
  expect(propertyImages(property, config)).toStrictEqual(["/images/properties/1/exterior.webp", "/images/properties/1/salon.webp"]);
  expect(propertyImages(property, { properties: { 1: [] } })).toStrictEqual([]);
  expect(property.images).toStrictEqual(["https://example.com/old.jpg"]);
});