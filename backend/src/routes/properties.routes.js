import { Router } from "express";
import {
  getProperties,
  getPropertyById,
  createProperty,
} from "../controllers/properties.controller.js";

const router = Router();

router.get("/properties", getProperties);
router.get("/properties/:id", getPropertyById);
router.get("/:id", getPropertyById);

router.post("/", createProperty);

export default router;
