import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { cities } from "../data/cities.js";
import { runMigration } from "./migrationSafety.js";

const slug = (str) =>
  str
    .toLowerCase()
    .normalize("NFD") // quita tildes
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-"); // espacios -> guiones

async function migrateCities() {
  const newCities = [];

  for (const city of cities) {
    console.log(`Uploading image for ${city.name}...`);

    try {
      const result = await cloudinary.uploader.upload(city.image, {
        folder: "real-estate/cities",
        public_id: slug(city.name),
        resource_type: "image",
        overwrite: false,
      });

      console.log("uploaded:", result.public_id);

      newCities.push({
        ...city,
        image: result.public_id, // guardamos solo public_id
      });
    } catch {
      throw new Error("No se pudo migrar una ciudad; se aborta el catálogo.");
    }
  }

  const fileContent =
    `export const cities = ` + JSON.stringify(newCities, null, 2) + `;\n`;

  fs.writeFileSync(new URL("../../cities-cloudinary.js", import.meta.url), fileContent, { flag: "wx" });
  console.log("Cities migration finished");
}

runMigration(import.meta.url, migrateCities);
