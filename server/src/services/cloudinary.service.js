import cloudinary from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

export const deleteImage = async (publicId) => {
  if (!publicId) {
    return { result: "not found" };
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (!["ok", "not found"].includes(result.result)) {
    throw new AppError(`Cloudinary image deletion failed: ${result.result}`, 502);
  }

  return result;
};

// `type` is Cloudinary's resource type: "image", "video", or "raw".
export const deleteMedia = async (publicId, type = "image") => {
  if (!publicId) {
    return { result: "not found" };
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: ["image", "video", "raw"].includes(type) ? type : "image",
  });

  if (!["ok", "not found"].includes(result.result)) {
    throw new AppError(`Cloudinary media deletion failed: ${result.result}`, 502);
  }

  return result;
};
