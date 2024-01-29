import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  getHeaders,
  getOrPostPullRequests,
  getOrUpdatePullRequest,
} from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import CreatePr from "./CreatePr";
import { getUserId, getUserRoles, setUserLoggedOut } from "../utils/configs";

const PullRequests = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(getOrPostPullRequests, {
        headers: getHeaders(),
      })
      .then((res) => {
        setPullRequests(res.data);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  }, []);

  const handleDelete = (prId) => {
    axios
      .delete(getOrUpdatePullRequest(prId), {
        headers: getHeaders(),
      })
      .then((res) => {
        const updatedPRs = pullRequests.filter((pr) => prId !== pr._id);
        setPullRequests(updatedPRs);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const handleLogout = () => {
    setUserLoggedOut();
    navigate("/");
  };

  return (
    <div className="pull-requests-table">
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">Pull Requests</Typography>
        <Box display="flex" gap={2}>
          {getUserRoles().includes("requester") && (
            <Button variant="contained" onClick={() => setIsOpen(true)}>
              Create PR
            </Button>
          )}
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            {/* <th>Type</th> */}
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pullRequests?.map((pr) => (
            <tr key={pr._id}>
              <td>{pr.title}</td>
              {/* <td>{pr.prType}</td> */}
              <td>{pr.status}</td>
              <td>
                <Button
                  onClick={() => navigate(pr._id)}
                  size="small"
                  variant="contained"
                  sx={{ mr: 2 }}
                >
                  View
                </Button>
                {getUserId() === pr.requesterId && (
                  <Button
                    onClick={() => handleDelete(pr._id)}
                    color="error"
                    size="small"
                    variant="contained"
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isOpen && (
        <CreatePr
          isOpen={isOpen}
          handleClose={() => setIsOpen(false)}
          setPullRequests={setPullRequests}
        />
      )}
    </div>
  );
};

export default PullRequests;
