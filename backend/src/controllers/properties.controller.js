import { properties, getPropertyById as lookup } from "../../../src/data/properties.js";

export const getProperties = (_req, res) => res.json(properties);
export const getPropertyById = (req, res) => {
  const property = lookup(req.params.id);
  return property ? res.json(property) : res.status(404).json({ error: "Propiedad no encontrada." });
};
// No hay persistencia: no simular una creación exitosa ni reflejar cuerpos arbitrarios.
export const createProperty = (_req, res) => res.status(501).json({ error: "Creación no disponible en este catálogo de demostración." });