import "./config/loadEnv.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import { rateLimit } from "express-rate-limit";

import propertiesRoutes from "./routes/properties.routes.js";
import createUploadRouter from "./routes/upload.routes.js";

export function createApp({ allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173", ...uploadOptions } = {}) {
	const app = express();
	app.disable("x-powered-by");
	app.use((_req, res, next) => {
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("Cache-Control", "no-store");
		next();
	});
	app.use(cors({ origin(origin, callback) {
		if (!origin || origin === allowedOrigin) return callback(null, true);
		const error = new Error("Origen no permitido.");
		error.status = 403;
		callback(error);
	} }));
	app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }));
	if (process.env.NODE_ENV !== "test") app.use(morgan(":method :status :response-time ms"));
	app.use(express.json({ limit: "32kb", inflate: false }));
	app.get("/", (_req, res) => res.json({ message: "Real Estate demo API" }));
	app.use("/api", createUploadRouter(uploadOptions));
	app.use("/api", propertiesRoutes);
	app.use((_req, res) => res.status(404).json({ error: "Recurso no encontrado." }));
	app.use((error, _req, res, _next) => {
		const status = error instanceof multer.MulterError
			? error.code === "LIMIT_FILE_SIZE" ? 413 : 400
			: Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
		res.status(status).json({ error: status >= 500 ? "No se pudo completar la solicitud." : "Archivo o solicitud inválida." });
	});
	return app;
}

export default createApp();