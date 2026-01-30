import express from "express";
import cors from "cors";
import pagoRoutes from "./routes/pagoRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use("/api/pagos", pagoRoutes);

export default app;
