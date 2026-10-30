import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";
import { AppError } from "./AppError.js";

const uploadOne = (file, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url || !result.public_id || !result.resource_type) {
          reject(new Error("Cloudinary did not return complete upload details"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type,
        });
      },
    );

    Readable.from([file.buffer]).pipe(uploadStream);
  });

const deleteUploadedFiles = async (files) => {
  const errors = [];

  for (const file of files) {
    try {
      const result = await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.type,
      });
      if (!["ok", "not found"].includes(result.result)) {
        throw new Error(`Cloudinary cleanup failed: ${result.result}`);
      }
    } catch (error) {
      errors.push(error);
    }
  }

  return errors;
};

// Accepts one Multer file or an array of files, including mixed media.
// The return shape matches the input: one result for one file, an array for many.
export const uploadToCloudinary = async (files, { folder } = {}) => {
  const isMultiple = Array.isArray(files);
  const fileList = isMultiple ? files : [files];

  if (fileList.length === 0 || fileList.some((file) => !file?.buffer)) {
    throw new AppError("At least one valid file is required", 400);
  }

  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError("Cloudinary is not configured", 503);
  }

  const uploaded = [];
  try {
    for (const file of fileList) {
      uploaded.push(await uploadOne(file, folder));
    }
  } catch (error) {
    const cleanupErrors = await deleteUploadedFiles(uploaded);
    if (cleanupErrors.length) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        "Cloudinary upload failed and some uploaded files could not be cleaned up",
      );
    }
    throw error;
  }

  return isMultiple ? uploaded : uploaded[0];
};
