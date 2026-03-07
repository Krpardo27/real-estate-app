import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { properties } from "../data/properties.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (url, propertyId, index) => {
  const result = await cloudinary.uploader.upload(url, {
    folder: `real-estate/properties/${propertyId}`,
    public_id: `image-${index}`,
  });

  return result.public_id;
};

const migrate = async () => {
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
      } catch (err) {
        console.error("error uploading", url);
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

  fs.writeFileSync(path.resolve("./properties-cloudinary.js"), fileContent);

  console.log("Migration finished");
};

migrate();
