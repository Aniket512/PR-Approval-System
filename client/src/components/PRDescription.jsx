import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Box, Button, Card, CardContent, TextField } from "@mui/material";
import { getHeaders, getOrUpdatePullRequest } from "../utils/APIRoutes";
import { getUserId } from "../utils/configs";

export const PRDescription = ({ currentPr, setCurrentPr }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [shouldEdit, setShouldEdit] = useState(false);

  useEffect(() => {
    if (currentPr) {
      setFormData({
        title: currentPr.title,
        description: currentPr.description,
      });
    }
  }, [currentPr]);

  const handleClick = () => {
    setShouldEdit(true);
  };

  const handleInputChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const cancelChanges = () => {
    setShouldEdit(false);
  };

  const updatePR = async () => {
    if (currentPr) {
      axios
        .put(getOrUpdatePullRequest(currentPr?._id), formData, {
          headers: getHeaders(),
        })
        .then((res) => {
          setCurrentPr(res?.data);
          toast.success("PR Details updated successfully");
        })
        .catch((err) => {
          console.error(err);
          toast.error(err?.message);
        });
    }
    cancelChanges();
  };

  return (
    <>
      {!shouldEdit ? (
        <Card>
          <CardContent>
            <p>{currentPr?.title}</p>
            <p>{currentPr.description}</p>
            {getUserId() === currentPr?.requesterId?._id && (
              <Button variant="contained" onClick={handleClick}>
                Edit
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ width: "80%", borderRadius: 2, m: 2 }}>
          <TextField
            value={formData.title}
            onChange={(e) => handleInputChange(e, "title")}
            fullWidth
          />
          <TextField
            minRows={5}
            multiline
            value={formData.description}
            onChange={(e) => handleInputChange(e, "description")}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button variant="outlined" color="error" onClick={cancelChanges}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={updatePR}
              disabled={
                formData.title === currentPr?.title &&
                formData.description === currentPr?.description
              }
            >
              Update
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};
