import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveImage, FALLBACK_IMAGE } from "./images.js";
import { propertyImages, siteImages, cityImageCredits, cityImageSrcSets } from "../data/siteImages.js";

test("cada ciudad tiene fotografía WebP local, variantes y créditos con licencia", () => {
  for (const [city, path] of Object.entries(siteImages.cities)) {
    expect(resolveImage(path)).toBe(path);
    const image = readFileSync(new URL(`../../public${path}`, import.meta.url));
    expect(image.toString("ascii", 0, 4)).toBe("RIFF");
    expect(image.toString("ascii", 8, 12)).toBe("WEBP");
    for (const candidate of cityImageSrcSets[city].split(", ")) {
      const [variant, size] = candidate.split(" ");
      expect(readFileSync(new URL(`../../public${variant}`, import.meta.url)).byteLength).toBeGreaterThan(0);
      expect(size).toMatch(/^\d+w$/);
    }
    const credit = cityImageCredits.find((entry) => entry.city === city);
    expect(credit.author).toBeTruthy();
    expect(credit.license).toBeTruthy();
    expect(credit.source).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  }
});

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