import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Box, Button, TextField } from "@mui/material";
import { getHeaders, getOrPostComments } from "../utils/APIRoutes";

export const AddReview = ({ setComments }) => {
  const [addReview, setAddReview] = useState(false);
  const [comment, setComment] = useState("");
  const { pullRequestId } = useParams();

  const handleAddReview = () => {
    if (!comment) {
      return;
    }
    if (pullRequestId) {
      axios
        .post(
          getOrPostComments(pullRequestId),
          { comment },
          {
            headers: getHeaders(),
          }
        )
        .then((res) => {
          setComments((prev) => [...prev, res?.data]);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err?.response?.data?.message);
        });
      setAddReview(false);
      setComment("");
    }
  };
  return (
    <Box sx={{ width: "80%", m: 2 }}>
      {!addReview ? (
        <Button
          onClick={() => setAddReview(true)}
          color="success"
          variant="contained"
        >
          Add Review +
        </Button>
      ) : (
        <>
          <TextField
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
          />
          <Box
            sx={{
              width: "100%",
              mt: 2,
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => setAddReview(false)}
            >
              Cancel
            </Button>
            <Button
              color="success"
              variant="contained"
              onClick={handleAddReview}
            >
              Submit Review
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};
