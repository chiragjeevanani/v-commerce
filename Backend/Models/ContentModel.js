import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    content: {
      type: [],
      required: true,
    },

    contentType: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);
