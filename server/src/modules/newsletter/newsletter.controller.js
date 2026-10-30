import { listNewsletterSubscribers, subscribeToNewsletter } from "./newsletter.service.js";

export const subscribe = async (req, res, next) => {
  try {
    const subscription = await subscribeToNewsletter(req.body.email);
    return res.status(201).json({
      success: true,
      message: "Subscribed to the newsletter",
      data: subscription,
    });
  } catch (error) {
    return next(error);
  }
};

export const listSubscribers = async (_req, res, next) => {
  try {
    const subscribers = await listNewsletterSubscribers();
    return res.json({
      success: true,
      message: "Newsletter subscribers fetched",
      data: subscribers,
    });
  } catch (error) {
    return next(error);
  }
};
