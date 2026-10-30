import Category from "./category.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const categoryRepository = {
  createCategory: async (categoryData) => {
    return await Category.create(categoryData);
  },

  getAllCategories: async (search = "") => {
    const filter = search
      ? {
          $or: ["name", "description", "slug"].map((field) => ({
            [field]: { $regex: escapeRegex(search), $options: "i" },
          })),
        }
      : {};

    return await Category.find(filter)
      .populate("parentCategoryId", "name slug")
      .sort({ createdAt: -1 });
  },

  getCategoryById: async (categoryId) => {
    return await Category.findById(categoryId).populate("parentCategoryId", "name slug");
  },

  getCategoryBySlug: async (slug) => {
    return await Category.findOne({ slug }).populate("parentCategoryId", "name slug");
  },

  findCategoryByName: async (name) => {
    return await Category.findOne({ name });
  },

  findCategoryBySlug: async (slug) => {
    return await Category.findOne({ slug });
  },

  updateCategory: async (categoryId, updateData) => {
    return await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
      runValidators: true,
    });
  },

  deleteCategory: async (categoryId) => {
    return await Category.findByIdAndDelete(categoryId);
  },

  findChildCategories: async (parentCategoryId) => {
    return await Category.find({
      parentCategoryId,
    }).sort({ name: 1 });
  },
};
