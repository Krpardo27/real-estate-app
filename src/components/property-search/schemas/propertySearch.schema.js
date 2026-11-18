import { z } from "zod";
import { chileRegions } from "../../../data/regions.js";
import { propertyTypes } from "../../../data/propertyTypes.js";
import { PROPERTY_PRICE_LIMITS } from "../../../utils/propertyFilters.js";

export const propertySearchSchema = z.object({
  region: z.string({ error: "Selecciona una región válida." })
    .refine((value) => value === "" || chileRegions.some((region) => region.id === value), "Selecciona una región válida.")
    .optional(),
  district: z.string({ error: "Selecciona una comuna válida." }).optional(),
  type: z.string({ error: "Selecciona un tipo de propiedad válido." })
    .refine((value) => value === "" || propertyTypes.some((type) => type.value === value), "Selecciona un tipo de propiedad válido.")
    .optional(),
  price: z.string({ error: "Selecciona un precio máximo de la lista." })
    .refine((value) => value === "" || PROPERTY_PRICE_LIMITS.some((limit) => String(limit) === value), "Selecciona un precio máximo de la lista.")
    .optional(),
}).superRefine(({ region, district }, context) => {
  if (!district) return;
  const selectedRegion = chileRegions.find((entry) => entry.id === region);
  if (!selectedRegion) {
    context.addIssue({ code: "custom", path: ["district"], message: "Selecciona una región antes de elegir una comuna." });
  } else if (!selectedRegion.communes.includes(district)) {
    context.addIssue({ code: "custom", path: ["district"], message: "La comuna debe pertenecer a la región seleccionada." });
  }
});

/** @typedef {z.infer<typeof propertySearchSchema>} PropertySearchValues */