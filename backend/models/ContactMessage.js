import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: String,
    message: {
      type: String,
      required: [true, "Please provide a message"],
    },
    subject: String,
    status: {
      type: String,
      enum: ["new", "read", "resolved"],
      default: "new",
    },
    userId: String, // Clerk user ID (optional)
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ContactMessage", ContactMessageSchema);
