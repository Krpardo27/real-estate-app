import { Router } from "express";
import {
  getProperties,
  getPropertyById,
  createProperty,
} from "../controllers/properties.controller.js";
import upload from "../middlewares/upload.js";

const router = Router();

router.get("/properties", getProperties);
router.get("/:id", getPropertyById);

router.post("/", createProperty);

router.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

export default router;
