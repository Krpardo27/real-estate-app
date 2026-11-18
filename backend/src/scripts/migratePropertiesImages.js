import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import { properties } from "../data/properties.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrate() {
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
        overwrite: true,
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
    "./properties-cloudinary.js",
    `export const properties = ${JSON.stringify(newProperties, null, 2)}`
  );

  console.log("Migration finished");
}

migrate().catch(console.error);