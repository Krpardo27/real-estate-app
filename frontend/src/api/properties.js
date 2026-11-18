import { properties } from "../data/properties";

export const getPropertyById = async (id) => {
  return properties.find((p) => p.id === Number(id));
};