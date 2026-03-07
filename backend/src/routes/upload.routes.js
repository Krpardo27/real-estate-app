import { Router } from "express";
import upload from "../middlewares/upload.js";

const router = Router();

router.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

export default router;
