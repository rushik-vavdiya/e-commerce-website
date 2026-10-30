import mongoose from "mongoose";

// Messages sent through the storefront contact form. The message is stored as
// well as emailed, so nothing is lost if the mail server is having a bad day.
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

contactSchema.index({ createdAt: -1 });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
