import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import upload, { matchesImageSignature } from "../middlewares/upload.js";
import cloudinary from "../config/cloudinary.js";

const uploadImage = (buffer) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream({
    folder: "real-estate", resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"], overwrite: false,
  }, (error, result) => error ? reject(error) : resolve(result)).end(buffer);
});

export default function createUploadRouter({ token = process.env.UPLOAD_API_TOKEN, uploadImage: saveImage = uploadImage } = {}) {
  const router = Router();
  router.post("/upload", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }), (req, res, next) => {
    // Nunca incluir este token en VITE_* ni distribuirlo al navegador.
    if (typeof token !== "string" || token.length < 32) return res.status(503).json({ error: "Subidas no habilitadas." });
    const provided = req.get("authorization")?.match(/^Bearer (\S+)$/)?.[1] || "";
    const expected = Buffer.from(token);
    const received = Buffer.from(provided);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return res.status(401).json({ error: "No autorizado." });
    next();
  }, upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Falta una imagen." });
    if (!matchesImageSignature(req.file)) return res.status(415).json({ error: "El contenido no corresponde a una imagen permitida." });
    const result = await saveImage(req.file.buffer);
    res.json({ url: result.secure_url, public_id: result.public_id });
  });
  return router;
}
