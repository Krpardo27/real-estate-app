import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import propertiesRoutes from "./routes/properties.routes.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
	res.json({ message: "Real Estate API running" });
});

app.use("/api", propertiesRoutes);

export default app;