import {
  createNewsletter,
  listNewsletterSubscribers as listSubscribers,
} from "./newsletter.repository.js";
import { AppError } from "../../utils/AppError.js";

export const subscribeToNewsletter = async (email) => {
  try {
    return await createNewsletter(email);
  } catch (error) {
    // Unique index collisions can occur when two requests subscribe at once.
    if (error.code === 11000) {
      throw new AppError("This email is already subscribed", 409);
    }
    throw error;
  }
};

export const listNewsletterSubscribers = () => listSubscribers();
