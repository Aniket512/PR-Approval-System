const { Schema, model } = require("mongoose");

const pullRequestSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    prType: {
      type: String,
      enum: ["Parallel", "Sequential"],
      default: "Parallel",
    },
    requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvers: [
      {
        approverId: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
      },
    ],
    status: {
      type: String,
      enum: ["Open", "Approved", "Rejected"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("PullRequest", pullRequestSchema);
