import Contact from "./contact.model.js";

export const contactRepository = {
  create: (data) => Contact.create(data),
  list: ({ page, limit }) =>
    Contact.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  count: () => Contact.countDocuments(),
};
