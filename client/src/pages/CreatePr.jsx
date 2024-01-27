import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { getHeaders, getOrPostPullRequests } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  TextareaAutosize,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Box,
} from "@mui/material";

const initialState = {
  title: "",
  description: "",
  approvers: [],
  prType: "Parallel",
};

const CreatePr = ({ isOpen, handleClose, setPullRequests }) => {
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      console.log(formData);
      axios
        .post(getOrPostPullRequests, formData, {
          headers: getHeaders(),
        })
        .then((res) => {
          setPullRequests((prev) => [...prev, res?.data]);
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response.data.message);
        });
    }
    setFormData(initialState);
    handleClose();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApproversChange = (e) => {
    const approversArray = e.target.value
      .split(",")
      .map((email) => email.trim());
    setFormData({ ...formData, approvers: approversArray });
  };

  const handleValidation = () => {
    const { title, description } = formData;
    if (title === "" || description === "") {
      toast.error("Title and Description is required.");
      return false;
    }
    return true;
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 500,
          maxHeight: "90%",
          bgcolor: "background.paper",
          p: 4,
        }}
      >
        <h2>Create Pull Request</h2>
        <form onSubmit={(e) => handleSubmit(e, formData)}>
          <TextField
            label="Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            multiline
            minRows={2}
            maxRows={8}
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            name="description"
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Approvers (comma-separated emails)"
            type="text"
            value={formData.approvers}
            onChange={handleApproversChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>PR Type</InputLabel>
            <Select
              value={formData.prType}
              onChange={handleInputChange}
              name="prType"
            >
              <MenuItem value="Parallel">Parallel</MenuItem>
              <MenuItem value="Sequential">Sequential</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Create PR
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default CreatePr;
