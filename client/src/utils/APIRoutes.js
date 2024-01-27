import { getAccessToken } from "./configs";

export const host = "http://localhost:5000";
export const signupRoute = `${host}/api/signup`;
export const loginRoute = `${host}/api/login`;
export const getOrPostPullRequests = `${host}/api/pull-requests`;
export const getOrUpdatePullRequest = (pullRequestId) =>
  `${host}/api/pull-requests/${pullRequestId}`;
export const getOrPostComments = (pullRequestId) =>
  `${host}/api/pull-requests/${pullRequestId}/comments`;
export const getOrPostApprovals = (pullRequestId) =>
  `${host}/api/pull-requests/${pullRequestId}/approvals`;

export const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    access_token: getAccessToken(),
  };
};
