import multer from "multer";

import { AppError } from "../utils/AppError.js";

// Maps a thrown error to the status and message the client sees.
//
// Expected failures are AppError instances and carry their own status. The
// remaining branches translate the errors the libraries below us raise:
// Mongoose validation/casting/duplicate keys and Multer's upload limits.
const resolveError = (error) => {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, message: error.message };
  }

  // A unique index rejected a write.
  if (error.code === 11000) {
    return { statusCode: 409, message: "A record with this value already exists" };
  }

  if (error instanceof multer.MulterError) {
    return {
      statusCode: error.code === "LIMIT_FILE_SIZE" ? 413 : 400,
      message: error.code === "LIMIT_FILE_SIZE" ? "Image must not exceed 5 MB" : error.message,
    };
  }

  // Mongo could not cast a value, or a schema rule failed.
  if (["ValidationError", "CastError"].includes(error.name)) {
    return { statusCode: 400, message: error.message };
  }

  // Two writes raced on the same document (optimistic concurrency).
  if (error.name === "VersionError") {
    return { statusCode: 409, message: "The record changed while you were saving it" };
  }

  return { statusCode: 500, message: "Internal server error" };
};

const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const { statusCode, message } = resolveError(error);

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({ success: false, message });
};

export default errorMiddleware;
