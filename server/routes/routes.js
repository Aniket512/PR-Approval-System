const express = require("express");
const authController = require("../controllers/authController");
const pullRequestController = require("../controllers/pullRequestController");
const { checkAccess } = require("../middlewares/checkAccess");
const validateSession = require("../middlewares/validateSession");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.use(validateSession);

router.get(
  "/pull-requests",
  checkAccess(["requester", "approver"]),
  pullRequestController.getAllPullRequests
);

router.get(
  "/pull-requests/:pullRequestId",
  checkAccess(["requester", "approver"]),
  pullRequestController.getPullRequest
);

router.post(
  "/pull-requests",
  checkAccess(["requester"]),
  pullRequestController.createPullRequest
);

router.delete(
  "/pull-requests/:pullRequestId",
  checkAccess(["requester"]),
  pullRequestController.deletePullRequest
);

router.put(
  "/pull-requests/:pullRequestId",
  checkAccess(["requester"]),
  pullRequestController.updatePullRequest
);

router.get(
  "/pull-requests/:pullRequestId/comments",
  checkAccess(["requester", "approver"]),
  pullRequestController.getComments
);

router.post(
  "/pull-requests/:pullRequestId/comments",
  checkAccess(["approver"]),
  pullRequestController.addComment
);

router.post(
  "/pull-requests/:pullRequestId/approvals",
  checkAccess(["approver"]),
  pullRequestController.addApproval
);

router.get(
  "/pull-requests/:pullRequestId/approvals",
  checkAccess(["requester", "approver"]),
  pullRequestController.getApprovalsForPullRequest
);

module.exports = router;
