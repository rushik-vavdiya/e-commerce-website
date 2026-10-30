import Newsletter from "./newsletter.model.js";

export const createNewsletter = async (email) => {
  const newsletter = new Newsletter({ email });
  return await newsletter.save();
};

export const listNewsletterSubscribers = () =>
  Newsletter.find({}, "email createdAt").sort({ createdAt: -1 }).limit(500).lean();
