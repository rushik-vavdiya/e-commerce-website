import assert from "node:assert/strict";
import { Writable } from "node:stream";
import test from "node:test";

import cloudinary from "../src/config/cloudinary.js";
import env from "../src/config/env.js";
import { uploadToCloudinary } from "../src/utils/cloudinary.js";

const withCloudinaryMocks = async ({ upload, destroy }, run) => {
  const originalUpload = cloudinary.uploader.upload_stream;
  const originalDestroy = cloudinary.uploader.destroy;
  const originalConfig = { ...env.cloudinary };

  cloudinary.uploader.upload_stream = upload;
  cloudinary.uploader.destroy = destroy;
  Object.assign(env.cloudinary, {
    cloudName: "test-cloud",
    apiKey: "test-key",
    apiSecret: "test-secret",
  });

  try {
    await run();
  } finally {
    cloudinary.uploader.upload_stream = originalUpload;
    cloudinary.uploader.destroy = originalDestroy;
    Object.assign(env.cloudinary, originalConfig);
  }
};

test("uploads mixed file batches using Cloudinary automatic resource detection", async () => {
  const resourceTypes = ["image", "video", "raw"];
  const uploadOptions = [];

  await withCloudinaryMocks(
    {
      upload(options, callback) {
        uploadOptions.push(options);
        const resourceType = resourceTypes[uploadOptions.length - 1];
        return new Writable({
          write(chunk, encoding, done) {
            done();
          },
          final(done) {
            callback(null, {
              secure_url: `https://example.test/${resourceType}`,
              public_id: `uploads/${resourceType}`,
              resource_type: resourceType,
            });
            done();
          },
        });
      },
      destroy: async () => ({ result: "ok" }),
    },
    async () => {
      const result = await uploadToCloudinary(
        [
          { buffer: Buffer.from("image"), mimetype: "image/png" },
          { buffer: Buffer.from("video"), mimetype: "video/mp4" },
          { buffer: Buffer.from("document"), mimetype: "application/pdf" },
        ],
        { folder: "test-uploads" },
      );

      assert.deepEqual(
        result.map(({ type }) => type),
        resourceTypes,
      );
      assert.deepEqual(
        uploadOptions.map(({ resource_type, folder }) => ({ resource_type, folder })),
        resourceTypes.map(() => ({ resource_type: "auto", folder: "test-uploads" })),
      );
    },
  );
});

test("cleans up earlier uploads when a batch upload fails", async () => {
  const deleted = [];
  let uploadCount = 0;

  await withCloudinaryMocks(
    {
      upload(options, callback) {
        uploadCount += 1;
        return new Writable({
          write(chunk, encoding, done) {
            done();
          },
          final(done) {
            if (uploadCount === 2) {
              callback(new Error("Upload failed"));
            } else {
              callback(null, {
                secure_url: "https://example.test/image",
                public_id: "uploads/image",
                resource_type: "image",
              });
            }
            done();
          },
        });
      },
      destroy: async (publicId, options) => {
        deleted.push({ publicId, options });
        return { result: "ok" };
      },
    },
    async () => {
      await assert.rejects(
        uploadToCloudinary([{ buffer: Buffer.from("first") }, { buffer: Buffer.from("second") }]),
        /Upload failed/,
      );
      assert.deepEqual(deleted, [
        { publicId: "uploads/image", options: { resource_type: "image" } },
      ]);
    },
  );
});
