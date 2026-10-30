import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Name and mobile are kept on the address itself: a customer may order for
    // someone else, and the order snapshot then carries the right person.
    fullName: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 15,
      default: null,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    default: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
  },
  { timestamps: true },
);

const Address = mongoose.model("Address", addressSchema);
export default Address;
