import { test, expect } from "vitest";
import { getPropertyById } from "../data/properties.js";

test("detalle estable, IDs válidos y no encontrados honestos", () => {
  expect(getPropertyById("1").id).toBe(1);
  expect(getPropertyById("1")).toStrictEqual(getPropertyById("1"));
  for (const value of [null, undefined, "foo", "1x", "-1", "0", "1.1", "999999999999999999999", "99999"]) expect(getPropertyById(value)).toBe(null);
});