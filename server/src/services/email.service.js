import nodemailer from "nodemailer";
import env from "../config/env.js";
import { AppError } from "../utils/AppError.js";

let transporter;

const getTransporter = () => {
  if (!env.email.host || !env.email.user || !env.email.password || !env.email.fromEmail) {
    throw new AppError("Email service is not configured", 503);
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.secure,
      auth: { user: env.email.user, pass: env.email.password },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  return transporter;
};

// `replyTo` is optional: when it is set (the contact form sets it to the
// sender), hitting reply in the inbox answers that address instead of the
// studio's own sending address.
export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!to || !subject || (!html && !text)) {
    throw new AppError("Email recipient, subject, and content are required", 503);
  }

  const mailer = getTransporter();
  try {
    return await mailer.sendMail({
      from: `"${env.email.fromName}" <${env.email.fromEmail}>`,
      to,
      replyTo: replyTo || undefined,
      subject,
      html,
      text,
    });
  } catch (error) {
    const deliveryError = new AppError("Email could not be sent. Please try again later.", 502);
    deliveryError.cause = error;
    throw deliveryError;
  }
};
