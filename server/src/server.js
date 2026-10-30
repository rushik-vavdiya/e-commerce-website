import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import mongoose from "mongoose";

const startServer = async () => {
  try {
    if (!env.jwt.accessSecret) throw new Error("JWT_ACCESS_SECRET is not configured");
    if (
      env.nodeEnv === "production" &&
      (!process.env.CLIENT_URL || env.jwt.accessSecret.length < 32)
    ) {
      throw new Error(
        "Production requires CLIENT_URL and a JWT access secret of at least 32 characters",
      );
    }
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`Rynova server running on port ${env.port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Closing server.`);
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
