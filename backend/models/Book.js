import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a book title"],
      trim: true,
    },
    author: {
      type: String,
      default: "PINENE ACADEMY",
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: 0,
    },
    category: {
      type: String,
      enum: ["Class 9", "Class 10", "Class 11", "Class 12", "JEE Prep"],
      required: true,
    },
    subject: {
      type: String,
      enum: ["Physics", "Chemistry", "Mathematics", "Biology"],
      default: "Physics",
    },
    description: String,
    image_url: String,
    isbn: String,
    pages: Number,
    publisher: {
      type: String,
      default: "PINENE ACADEMY",
    },
    is_bestseller: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Book", BookSchema);
