import { generateProperties } from "../utils/generateProperties.js";
import { propertyImages } from "./siteImages.js";

// Datos exclusivamente de demostración, reproducibles entre sesiones.
export const properties = generateProperties(600).map((property) => ({ ...property, images: propertyImages(property) }));

export function getPropertyById(id) {
	const value = String(id ?? "").trim();
	if (!/^\d+$/.test(value)) return null;
	const numericId = Number(value);
	if (!Number.isSafeInteger(numericId) || numericId < 1) return null;
	return properties.find((property) => property.id === numericId) ?? null;
}

