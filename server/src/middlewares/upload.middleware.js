import multer from "multer";

const allowedImageTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      callback(new Error("Only AVIF, GIF, JPEG, PNG, and WebP images are allowed"));
      return;
    }

    callback(null, true);
  },
});

const allowedMediaTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

// Review media accepts both images and short videos, so it has its own multer
// instance with a larger per-file limit (50 MB) than product images.
export const uploadReviewMedia = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMediaTypes.has(file.mimetype)) {
      callback(
        new Error(
          "Only images (AVIF, GIF, JPEG, PNG, WebP) or videos (MP4, WebM, MOV) are allowed",
        ),
      );
      return;
    }

    callback(null, true);
  },
});
