// The rules the product image endpoints enforce, shared by every screen that
// picks a product photo (the create wizard's Images step and the edit page's
// image panels).
//
// The types and the 5 MB ceiling match server/src/middlewares/upload.middleware.js;
// MAX_GALLERY matches the maxCount on the gallery field and the limit
// updateProductImages applies in product.service.js.
export const ACCEPTED_TYPES = ['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'];
export const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_GALLERY = 10;

// A sentence to show the person picking the file, or null when the file is fine.
export const fileProblem = (file) => {
  if (!file) return null;
  if (file.size > MAX_BYTES) return `“${file.name}” is larger than 5 MB.`;
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `“${file.name}” is not an AVIF, GIF, JPEG, PNG or WebP image.`;
  }
  return null;
};
