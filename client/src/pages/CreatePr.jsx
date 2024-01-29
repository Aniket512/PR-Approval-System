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
  levels: [],
};

const CreatePr = ({ isOpen, handleClose, setPullRequests }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    levels: [
      {
        approvers: [],
      },
    ],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidation()) {
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
      setFormData({
        title: "",
        description: "",
        levels: [{ approvers: [] }],
      });
      handleClose();
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApproversChange = (levelIndex, e) => {
    const updatedLevels = [...formData.levels];
    updatedLevels[levelIndex].approvers = e.target.value
      .split(",")
      .map((email) => email.trim());
    setFormData({ ...formData, levels: updatedLevels });
  };

  const handleAddLevel = () => {
    setFormData({
      ...formData,
      levels: [...formData.levels, { approvers: [] }],
    });
  };

  const handleValidation = () => {
    const { title, description, levels } = formData;
    if (title === "" || description === "") {
      toast.error("Title and Description are required.");
      return false;
    }

    for (const level of levels) {
      if (level.approvers.length === 0) {
        toast.error("Please provide at least one approver email in each level.");
        return false;
      }
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

          {formData.levels.map((level, index) => (
            <div key={index}>
              <TextField
                label={`Approvers Level ${index + 1} (comma-separated emails)`}
                type="text"
                value={level.approvers}
                onChange={(e) => handleApproversChange(index, e)}
                fullWidth
                sx={{ mt: 2 }}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleAddLevel}
            sx={{ mt: 2 }}
          >
            Add Level
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, display: 'block'}}
          >
            Create PR
          </Button>
        </form>
      </Box>
    </Modal>
  );
};


export default CreatePr;
