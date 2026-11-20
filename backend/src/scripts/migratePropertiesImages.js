import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import * as source from "../data/properties.js";
import { runMigration } from "./migrationSafety.js";

async function migrate() {
  const properties = source.properties;
  if (!Array.isArray(properties) || !properties.length) throw new Error("Falta un catálogo fuente válido.");
  const newProperties = [];

  for (const property of properties) {
    console.log("Uploading property:", property.id);

    const uploadedImages = [];

    for (let i = 0; i < property.images.length; i++) {
      const url = property.images[i];

      const result = await cloudinary.uploader.upload(url, {
        folder: `real-estate/properties/${property.id}`,
        public_id: `image-${i}`,
        resource_type: "image",
        overwrite: false,
      });

      uploadedImages.push(result.public_id);
      console.log("uploaded:", result.public_id);
    }

    newProperties.push({
      ...property,
      images: uploadedImages,
    });
  }

  fs.writeFileSync(
    new URL("../../properties-cloudinary.js", import.meta.url),
    `export const properties = ${JSON.stringify(newProperties, null, 2)}`,
    { flag: "wx" }
  );

  console.log("Migration finished");
}

runMigration(import.meta.url, migrate);