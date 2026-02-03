import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    content: {
      type: mongoose.Schema.Types.Mixed,
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
