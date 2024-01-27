import { Box, Button } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isUserLoggedIn } from "../utils/configs";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isUserLoggedIn()) {
      navigate("/pull-requests");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h2>PR Approval System</h2>
      <Box sx={{ display: "flex", gap: 4 }}>
        <Button variant="contained" onClick={() => navigate("login")}>
          Login
        </Button>
        <Button variant="contained" onClick={() => navigate("signup")}>
          Signup
        </Button>
      </Box>
    </div>
  );
};

export default Home;
