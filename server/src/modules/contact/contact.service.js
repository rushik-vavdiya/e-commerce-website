import env from "../../config/env.js";
import { sendEmail } from "../../services/email.service.js";
import { contactRepository } from "./contact.repository.js";
import { AppError } from "../../utils/AppError.js";

// Values typed into the form end up inside the notification email, so they are
// escaped before they are put in the HTML body.
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const receivedAt = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

const emailBody = (contact) => {
  // The form no longer asks for a subject, so the studio inbox is titled with
  // the sender instead.
  const title = `New contact message from ${contact.name}`;

  const lines = [
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Received: ${receivedAt(contact.createdAt)} IST`,
    "",
    contact.message,
  ];

  return {
    subject: title,
    text: lines.join("\n"),
    html: `
      <h2 style="font-family:Georgia,serif;color:#7A2E1F;margin:0 0 12px">New contact message</h2>
      <p style="margin:0 0 16px;color:#8C6A5E;font-size:13px">
        Sent from the RYNOVA contact form on ${escapeHtml(receivedAt(contact.createdAt))} IST.
      </p>
      <table style="border-collapse:collapse;font-size:14px;color:#7A2E1F">
        <tr><td style="padding:4px 12px 4px 0"><strong>Name</strong></td><td>${escapeHtml(contact.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Email</strong></td><td>${escapeHtml(contact.email)}</td></tr>
      </table>
      <p style="margin:20px 0 6px;font-size:14px;color:#7A2E1F"><strong>Message</strong></p>
      <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:22px;color:#4A2B22">
        ${escapeHtml(contact.message)}
      </p>
    `.trim(),
  };
};

// Saves the message and emails a copy to the studio inbox. The order matters:
// the message is stored first, so a mail server outage cannot lose it.
export const createContactMessage = async (payload) => {
  const contact = await contactRepository.create(payload);
  const body = emailBody(contact);

  try {
    await sendEmail({
      to: env.contact.toEmail,
      // Hitting reply in the studio inbox answers the sender, not the studio.
      replyTo: contact.email,
      ...body,
    });
  } catch (error) {
    console.error("Contact notification email failed:", error.message);

    throw new AppError(
      "Your message was saved, but we could not send the email notification. Please try again or email us directly.",
      502,
    );
  }

  return contact;
};

export const listContactMessages = async ({ page = 1, limit = 20 } = {}) => {
  const [items, total] = await Promise.all([
    contactRepository.list({ page, limit }),
    contactRepository.count(),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};
