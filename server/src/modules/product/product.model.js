import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // A product can belong to a vendor store, but an admin-created product
    // has no store yet, so this stays optional instead of blocking creation.
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    comarePrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: {
        type: Number,
        min: 0,
      },
      width: {
        type: Number,
        min: 0,
      },
      height: {
        type: Number,
        min: 0,
      },
    },
    sku: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Extra categories the product also belongs to. The first picks the main
    // categoryId below, so a product can live in many departments at once.
    categoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    mainImage: {
      type: String,
      default: null,
    },
    mainImagePublicId: {
      type: String,
      default: null,
    },
    galleryImages: [
      {
        type: String,
      },
    ],
    galleryImagePublicIds: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "draft",
    },
    ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    productSpecifications: [
      {
        key: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    variants: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        options: [
          {
            type: String,
            required: true,
            trim: true,
          },
        ],
      },
    ],
    variantCombinations: [
      {
        variantName: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        stock: {
          type: Number,
          required: true,
          min: 0,
        },
        sku: {
          type: String,
          trim: true,
        },
        comarePrice: {
          type: Number,
          min: 0,
        },
        mainImage: {
          type: String,
          default: null,
        },
        mainImagePublicId: {
          type: String,
          default: null,
        },
        galleryImages: [
          {
            type: String,
          },
        ],
        galleryImagePublicIds: [
          {
            type: String,
          },
        ],
      },
    ],
  },

  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
      transform: (document, result) => {
        delete result.mainImagePublicId;
        delete result.galleryImagePublicIds;
        for (const variant of result.variantCombinations ?? []) {
          delete variant.mainImagePublicId;
          delete variant.galleryImagePublicIds;
        }
        return result;
      },
    },
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
