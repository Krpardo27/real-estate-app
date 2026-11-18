import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import { cities } from "../data/cities.js";


dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        overwrite: true,
      });

      console.log("uploaded:", result.public_id);

      newCities.push({
        ...city,
        image: result.public_id, // guardamos solo public_id
      });
    } catch (err) {
      console.error(`Error uploading ${city.name}:`, err?.message || err);
      // Si falla, dejamos la URL original para no perder la data
      newCities.push(city);
    }
  }

  const fileContent =
    `export const cities = ` + JSON.stringify(newCities, null, 2) + `;\n`;

  fs.writeFileSync("./cities-cloudinary.js", fileContent);
  console.log("Cities migration finished");
}

migrateCities().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
