import mongoose from "mongoose";

// The one editable card on the right of the Collections mega menu. It is its own
// tiny collection on purpose: the copy changes far more often than the
// categories do, and an admin can rewrite it in the panel editor without a code
// change or a deployment.
//
// Only ever one document. `getFeatured()` creates it with these defaults the
// first time the menu is opened, so the panel is never empty.
const menuFeaturedSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "collections",
      unique: true,
    },
    eyebrow: {
      type: String,
      trim: true,
      default: "Just in",
    },
    title: {
      type: String,
      trim: true,
      default: "New festive kurta sets",
    },
    buttonLabel: {
      type: String,
      trim: true,
      default: "Shop new arrivals",
    },
    // Kept as a route path: the client renders it through <Link>.
    href: {
      type: String,
      trim: true,
      default: "/shop",
    },
  },
  { timestamps: true },
);

menuFeaturedSchema.set("toJSON", {
  transform: (document, result) => {
    delete result.__v;
    return result;
  },
});

const MenuFeatured = mongoose.model("MenuFeatured", menuFeaturedSchema);

export default MenuFeatured;
