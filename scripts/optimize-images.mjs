import sharp from "sharp";
import { fileURLToPath } from "node:url";

const files = ["valparaiso", "la-serena", "talca", "concepcion", "santiago"];
for (const file of files) {
  const source = fileURLToPath(new URL(`../public/images/cities/${file}.jpg`, import.meta.url));
  for (const width of [400, 800]) {
    await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 76 }).toFile(
      fileURLToPath(new URL(`../public/images/cities/${file}-${width}.webp`, import.meta.url)),
    );
  }
}
console.log("Variantes WebP de ciudades generadas; originales y créditos conservados.");