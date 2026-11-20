import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import * as source from "../data/properties.js";
import { runMigration } from "./migrationSafety.js";

const uploadImage = async (url, propertyId, index) => {
  const result = await cloudinary.uploader.upload(url, {
    folder: `real-estate/properties/${propertyId}`,
    public_id: `image-${index}`,
    overwrite: false,
  });

  return result.public_id;
};

const migrate = async () => {
  const properties = source.properties;
  if (!Array.isArray(properties) || !properties.length) throw new Error("Falta un catálogo fuente válido.");
  const newProperties = [];

  for (const property of properties) {
    console.log(`Migrating property ${property.id}...`);

    const uploadedImages = [];

    for (let i = 0; i < property.images.length; i++) {
      const url = property.images[i];

      try {
        const publicId = await uploadImage(url, property.id, i);

        uploadedImages.push(publicId);

        console.log("uploaded:", publicId);
      } catch {
        throw new Error("No se pudo migrar una imagen; se aborta el catálogo.");
      }
    }

    newProperties.push({
      ...property,
      images: uploadedImages,
    });
  }

  const fileContent = `export const properties = ${JSON.stringify(
    newProperties,
    null,
    2,
  )};`;

  fs.writeFileSync(new URL("../../properties-cloudinary.js", import.meta.url), fileContent, { flag: "wx" });

  console.log("Migration finished");
};

runMigration(import.meta.url, migrate);
