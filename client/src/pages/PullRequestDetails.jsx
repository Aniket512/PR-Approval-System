import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {
  getHeaders,
  getOrPostApprovals,
  getOrPostComments,
  getOrUpdatePullRequest,
} from "../utils/APIRoutes";
import { AddReview } from "../components/AddReview";
import { Comments } from "../components/Comments";
import { Box, Button, Chip, CircularProgress } from "@mui/material";
import { PRDescription } from "../components/PRDescription";
import { getUserId, getUserRoles } from "../utils/configs";

export const PullRequestDetails = () => {
  const { pullRequestId } = useParams();
  const [currentPr, setCurrentPR] = useState({});
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pullRequestId) {
      getPrDetails();
      getComments();
    }
  }, []);

  const checkStatus = () => {
    const status = currentPr?.approvers?.find(
      (app) => app.approverId._id === getUserId()
    )?.status;
    return status === "Pending" && currentPr?.status === "Open";
  };

  const getColor = (approverStatus) => {
    if (approverStatus === "Approved") {
      return "success";
    }
    if (approverStatus === "Rejected") {
      return "error";
    }
  };

  const getPrDetails = () => {
    axios
      .get(getOrUpdatePullRequest(pullRequestId), {
        headers: getHeaders(),
      })
      .then((res) => {
        setCurrentPR(res?.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.message);
      });
  };

  const getComments = () => {
    setLoading(true);
    axios
      .get(getOrPostComments(pullRequestId), {
        headers: getHeaders(),
      })
      .then((res) => {
        setComments(res?.data?.reviews);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response.data?.message);
      })
      .finally(() => setLoading(false));
  };

  const handlePRApproval = (status) => {
    axios
      .post(
        getOrPostApprovals(pullRequestId),
        { status },
        {
          headers: getHeaders(),
        }
      )
      .then((res) => {
        const updatedPRApprovers = res?.data?.pullRequest?.approvers;
        setCurrentPR((prev) => ({
          ...prev,
          approvers: updatedPRApprovers,
        }));
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.message);
      });
  };

  return (
    <Box sx={{ m: 4, display: "flex", gap: 2 }}>
      <Box sx={{ width: "80%" }}>
        {currentPr && (
          <PRDescription currentPr={currentPr} setCurrentPr={setCurrentPR} />
        )}
        <br />
        <div>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              {comments?.length > 0 ? (
                comments.map((comment) => (
                  <Comments key={comment._id} comment={comment} />
                ))
              ) : (
                <p>No comments</p>
              )}
              {getUserRoles().includes("approver") && (
                <AddReview setComments={setComments} />
              )}
            </>
          )}
        </div>
      </Box>

      <div>
        <h3>Approvers status</h3>
        {currentPr?.approvers?.map((approver, i) => (
          <p key={approver._id}>
            {i + 1}:{approver.approverId.username} -{" "}
            <Chip color={getColor(approver.status)} label={approver.status} />
          </p>
        ))}
        {getUserRoles().includes("approver") && checkStatus() && (
          <Box display="flex" gap={2}>
            <Button
              color="success"
              variant="contained"
              onClick={() => handlePRApproval("Approved")}
            >
              Approve pr
            </Button>
            <Button
              color="error"
              variant="outlined"
              onClick={() => handlePRApproval("Rejected")}
            >
              Reject pr
            </Button>
          </Box>
        )}
      </div>
    </Box>
  );
};
