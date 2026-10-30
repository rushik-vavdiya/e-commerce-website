import { createContactMessage, listContactMessages } from "./contact.service.js";

// POST /api/contact — public: stores the message and emails the studio.
export const createContact = async (req, res, next) => {
  try {
    const contact = await createContactMessage(req.body);

    return res.status(201).json({
      success: true,
      message: "Thanks! Your message has reached the studio and we will reply by email.",
      data: contact,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/contact — admin only: the messages the form has collected.
export const listContacts = async (req, res, next) => {
  try {
    // contactListQuerySchema has already coerced page and limit to numbers.
    const { items, pagination } = await listContactMessages(req.validated.query);

    return res.status(200).json({
      success: true,
      message: "Contact messages fetched",
      data: items,
      pagination,
    });
  } catch (error) {
    return next(error);
  }
};
