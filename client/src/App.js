import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PullRequests from "./pages/PullRequests";
import axios from "axios";
import { isUserLoggedIn, setUserLoggedOut } from "./utils/configs";
import { PullRequestDetails } from "./pages/PullRequestDetails";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (isUserLoggedIn()) {
        setUserLoggedOut();
      }
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pull-requests" element={<PullRequests />} />
        <Route
          path="/pull-requests/:pullRequestId"
          element={<PullRequestDetails />}
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
