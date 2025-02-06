const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
  {
    tag: { type: String },
    Status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // default to inactive player
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tags", TagSchema);
