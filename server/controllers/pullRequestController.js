const PullRequest = require("../models/PullRequest");
const Review = require("../models/Review");
const User = require("../models/User");
const Role = require("../models/Role");

const APPROVED = "Approved";
const REJECTED = "Rejected";
const PENDING = "Pending";

const getAllPullRequests = async (req, res) => {
  try {
    const pullRequests = await PullRequest.find({
      $or: [
        { requesterId: req.user._id },
        { "levels.approvers.approverId": req.user._id },
      ],
    });

    res.status(200).json(pullRequests);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while fetching the pull requests",
    });
  }
};

const createPullRequest = async (req, res) => {
  try {
    const { title, description, levels } = req.body;
    const requesterId = req.user._id;

    if (!title || !description || !levels) {
      return res.status(400).json({
        message:
          "Missing required fields, insufficient data for creating pullRequest",
      });
    }

    const allApprovers = levels.reduce(
      (approvers, level) => approvers.concat(level.approvers),
      []
    );
    const uniqueApprovers = new Set(
      allApprovers.map((approver) => approver.toString())
    );

    if (uniqueApprovers.size !== allApprovers.length) {
      return res
        .status(400)
        .json({ message: "All approvers must be unique across levels" });
    }

    const approverRoleId = await Role.findOne({ roleName: "approver" }).select(
      "_id"
    );

    const approverObjects = [];

    // Iterate through each level and its approvers
    for (const level of levels) {
      const existingApprovers = await User.find({
        email: { $in: level.approvers },
        roles: approverRoleId,
      });

      if (existingApprovers.length !== level.approvers.length) {
        return res.status(400).json({
          message:
            "Some users with the given emails do not exist or do not have the 'approver' role",
        });
      }

      const levelApprovers = level.approvers
        .filter((email) => email !== req.user.email)
        .map((email) => {
          const matchingApprover = existingApprovers.find(
            (approver) => approver.email === email
          );
          return {
            approverId: matchingApprover._id,
          };
        });

      approverObjects.push({
        approvers: levelApprovers,
      });
    }

    const newPullRequest = await PullRequest.create({
      title,
      description,
      requesterId,
      levels: approverObjects,
    });

    res.status(201).json(newPullRequest);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while creating pull request",
    });
  }
};

const getPullRequest = async (req, res) => {
  try {
    const { pullRequestId } = req.params;

    const pullRequest = await PullRequest.findById(pullRequestId)
      .populate("requesterId", "username email")
      .populate({
        path: "levels.approvers.approverId",
        select: "username email",
      });

    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found." });
    }

    res.status(200).json(pullRequest);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while fetching the pull request",
    });
  }
};

const updatePullRequest = async (req, res) => {
  try {
    const { pullRequestId } = req.params;
    const userId = req.user._id;
    const { title, description } = req.body;

    const pullRequest = await PullRequest.findById(pullRequestId);
    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found" });
    }

    //check if the user is the requester of the pull request
    if (pullRequest.requesterId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this pull request",
      });
    }

    const body = {};
    if (title) body.title = title;
    if (description) body.description = description;

    const updatedPullRequest = await PullRequest.findByIdAndUpdate(
      pullRequestId,
      { $set: { title, description } },
      { new: true }
    );

    res.status(200).json(updatedPullRequest);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while updating pull request",
    });
  }
};

const deletePullRequest = async (req, res) => {
  try {
    const { pullRequestId } = req.params;
    const userId = req.user._id;

    const pullRequest = await PullRequest.findById(pullRequestId);

    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found" });
    }

    if (pullRequest.requesterId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this pull request",
      });
    }

    await Review.deleteMany({ pullRequestId });
    await PullRequest.findByIdAndDelete(pullRequestId);

    res.status(204).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while deleting pull request",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { pullRequestId } = req.params;
    const userId = req.user._id;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const pullRequest = await PullRequest.findById(pullRequestId);
    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found" });
    }

    const userLevelIndex = pullRequest.levels.findIndex((level) =>
      level.approvers.some((approver) => approver.approverId.equals(userId))
    );

    if (userLevelIndex === -1) {
      return res
        .status(403)
        .json({ message: "You are not authorized to review this PR" });
    }

    const review = await Review.create({
      pullRequestId,
      comment,
      reviewerId: userId,
    });

    await review.populate("reviewerId");
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while adding comment",
    });
  }
};

const getComments = async (req, res) => {
  try {
    const { pullRequestId } = req.params;

    const pullRequest = await PullRequest.findById(pullRequestId);

    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found" });
    }

    //get all the reviews associated with the pull request
    const reviews = await Review.find({ pullRequestId })
      .sort({ createdAt: 1 })
      .populate("reviewerId");

    res.status(200).json({ reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while getting comments",
    });
  }
};

const addApproval = async (req, res) => {
  try {
    const { pullRequestId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Check if the pull request exists
    const pullRequest = await PullRequest.findById(pullRequestId);
    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found" });
    }

    // Check if the user is in the list of approvers for the PR
    const userLevelIndex = pullRequest.levels.findIndex((level) =>
      level.approvers.some((approver) => approver.approverId.equals(userId))
    );

    if (userLevelIndex === -1) {
      return res
        .status(403)
        .json({ message: "You are not an approver for this PR" });
    }

    // Check if the PR has already been approved or rejected
    if (pullRequest.status !== "Open") {
      return res
        .status(400)
        .json({ message: "PR is already approved or rejected" });
    }

    if (userLevelIndex > 0) {
      const previousLevel = pullRequest.levels[userLevelIndex - 1];
      const isPreviousLevelApproved = previousLevel.status === APPROVED;

      if (!isPreviousLevelApproved) {
        return res.status(403).json({
          message:
            "Please wait for the previous level approvers to approve the pull request",
        });
      }
    }

    // if (pullRequest.prType === "Sequential") {
    //   const approverIndex = pullRequest.approvers.findIndex(
    //     (approver) => approver.approverId.toString() === userId.toString()
    //   );

    //   if (approverIndex !== 0) {
    //     const previousApprover = pullRequest.approvers[approverIndex - 1];
    //     if (previousApprover.status !== APPROVED) {
    //       return res.status(403).json({
    //         message:
    //           "Please wait for the previous approver to approve the pull request",
    //       });
    //     }
    //   }
    // }

    const existingDecision = pullRequest.levels[userLevelIndex].approvers.find(
      (approver) => approver.approverId.equals(userId)
    );

    if (existingDecision && existingDecision.status !== PENDING) {
      return res.status(403).json({
        message: "You have already made a decision for this pull request",
      });
    }

    const updatedPullRequest = await PullRequest.findOneAndUpdate(
      { _id: pullRequestId },
      {
        $set: {
          "levels.$[level].approvers.$[approver].status": status,
        },
      },
      {
        arrayFilters: [
          { "level.approvers.approverId": userId },
          { "approver.approverId": userId },
        ],
        new: true,
        runValidators: true,
      }
    ).populate("levels.approvers.approverId");

    const anyApprovedInCurrentLevel = updatedPullRequest.levels[
      userLevelIndex
    ].approvers.some((approver) => approver.status === APPROVED);

    if (anyApprovedInCurrentLevel) {
      await PullRequest.findOneAndUpdate(
        {
          _id: pullRequestId,
          "levels._id": updatedPullRequest.levels[userLevelIndex]._id,
          "levels.status": "Pending",
        },
        { $set: { "levels.$.status": APPROVED } }
      );
    }

    const allRejectedInCurrentLevel = updatedPullRequest.levels[
      userLevelIndex
    ].approvers.every((approver) => approver.status === REJECTED);

    if (allRejectedInCurrentLevel) {
      await PullRequest.findOneAndUpdate(
        {
          _id: pullRequestId,
          "levels._id": updatedPullRequest.levels[userLevelIndex]._id,
          "levels.status": "Pending",
        },
        { $set: { "levels.$.status": REJECTED } }
      );
    }

    const updatedPullRequestAfterStatusUpdate = await PullRequest.findById(
      pullRequestId
    );

    const anyLevelRejected = updatedPullRequestAfterStatusUpdate.levels.some(
      (level) => level.status === REJECTED
    );

    if (anyLevelRejected) {
      await PullRequest.findByIdAndUpdate(pullRequestId, { status: REJECTED });
    }

    const allLevelsApproved = updatedPullRequestAfterStatusUpdate.levels.every(
      (level) => level.status === "Approved"
    );

    if (allLevelsApproved) {
      await PullRequest.findByIdAndUpdate(pullRequestId, { status: APPROVED });
    }

    res.status(200).json({ pullRequest: updatedPullRequest });

    // const anyRejected = updatedPullRequest.approvers.some(
    //   (approver) => approver.status === REJECTED
    // );

    // if (anyRejected) {
    //     await PullRequest.findByIdAndUpdate(pullRequestId, {
    //       status: REJECTED,
    //     });
    // }

    // If all the approvers have approved the pull request, update the pull request's status to approved
    // const allApproved = updatedPullRequest.approvers.every(
    //   (approver) => approver.status === APPROVED
    // );

    // if (allApproved) {
    //   await PullRequest.findByIdAndUpdate(pullRequestId, {
    //     status: APPROVED,
    //   });
    // }

    // If all the approvers have rejected the pull request, update the pull request's status to rejected
    // const allRejected = updatedPullRequest.approvers.every(
    //   (approver) => approver.status === REJECTED
    // );

    // if (allRejected) {
    //   await PullRequest.findByIdAndUpdate(pullRequestId, {
    //     status: REJECTED,
    //   });
    // }
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while adding approval",
    });
  }
};

const getApprovalsForPullRequest = async (req, res) => {
  try {
    const { pullRequestId } = req.params;

    const pullRequest = await PullRequest.findById(pullRequestId);
    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found" });
    }

    const approvals = pullRequest.approvers;
    res.status(200).json({ approvals });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      error: err.message,
      message: "An error occured while getting the approvals",
    });
  }
};

module.exports = {
  createPullRequest,
  getAllPullRequests,
  getPullRequest,
  updatePullRequest,
  deletePullRequest,
  addComment,
  getComments,
  addApproval,
  getApprovalsForPullRequest,
};
