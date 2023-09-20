const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
    },
    categoryImage: { type: String },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference the same model
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // Add children field as an array of ObjectId
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
