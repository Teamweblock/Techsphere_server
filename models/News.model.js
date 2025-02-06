const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    heading: {
      type: String, required: [true, "Please provide a heading"],
      trim: true,
      maxLength: [50, "heading cannot be more than 20 characters"],
      minlength: [2, "heading cannot be less than 2 characters"],
    },
    heroimage: { type: String },
    title: {
      type: String, required: [true, "Please provide a title"],
      trim: true,
      maxLength: [50, "title cannot be more than 20 characters"],
      minlength: [2, "title cannot be less than 2 characters"],
    },
    summery: {
      type: String, required: [true, "Please provide a summery"],
      trim: true,
      maxLength: [300, "summery cannot be more than 300 characters"],
      minlength: [10, "summery cannot be less than 100 characters"],
    },
    content_1: { type: String },
    image_2: { type: String },
    content_2: { type: String },
    image_3: { type: String },
    content_3: { type: String },
    Status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // default to inactive player
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
    NewsDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", NewsSchema);