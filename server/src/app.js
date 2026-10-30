import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import env from "./config/env.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import apiRoutes from "./routes/index.js";
import { razorpayWebhookController } from "./modules/payment/payment.controller.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhookController,
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// Reads the HttpOnly refresh cookie on /api/auth/refresh and /api/auth/logout.
app.use(cookieParser());

app.use("/api", apiRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Rynova API is running",
  });
});

app.use(errorMiddleware);

export default app;
