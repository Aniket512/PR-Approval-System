const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    pullRequestId: {
      type: Schema.Types.ObjectId,
      ref: "PullRequest",
      required: true,
    },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Review", reviewSchema);
