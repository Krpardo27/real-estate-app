import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Un único entorno del servidor, independiente del directorio de ejecución.
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)), quiet: true });