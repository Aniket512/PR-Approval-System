import React, { useState } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { signupRoute } from "../utils/APIRoutes";
import { setUserLoggedIn } from "../utils/configs";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: [],
  });

  const handleValidation = () => {
    const { password, confirmPassword, username, email, roles } = formData;
    if (password !== confirmPassword) {
      toast.error("Password and confirm password should be same.");
      return false;
    } else if (username.length < 3) {
      toast.error("Username should be greater than 3 characters.");
      return false;
    } else if (password.length < 8) {
      toast.error("Password should be equal or greater than 8 characters.");
      return false;
    } else if (email === "") {
      toast.error("Email is required.");
      return false;
    } else if (roles.length === 0) {
      toast.error("Please select role.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (handleValidation()) {
      const { email, username, password, roles } = formData;

      console.log(formData);
      axios
        .post(signupRoute, {
          username,
          email,
          password,
          roles,
        })
        .then((res) => {
          console.log(res.data);
          setUserLoggedIn(res?.data);
          navigate("/pull-requests");
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    if (type === "checkbox") {
      setFormData((prevData) => {
        if (checked && !prevData.roles.includes(name)) {
          return {
            ...prevData,
            roles: [...prevData.roles, name],
          };
        } else if (!checked && prevData.roles.includes(name)) {
          return {
            ...prevData,
            roles: prevData.roles.filter((role) => role !== name),
          };
        }
        return prevData;
      });
    } else {
      setFormData({
        ...formData,
        [name]: inputValue,
      });
    }
  };

  return (
    <>
      <div className="FormContainer">
        <form
          className="basic-form"
          action=""
          onSubmit={(event) => handleSubmit(event)}
        >
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <div style={{ display: "flex", gap: '10px' }}>
            <label>
              <input
                type="checkbox"
                name="requester"
                checked={formData.roles.includes("requester")}
                onChange={handleChange}
              />
              Requester
            </label>
            <label>
              <input
                type="checkbox"
                name="approver"
                checked={formData.roles.includes("approver")}
                onChange={handleChange}
              />
              Approver
            </label>
          </div>
          <button className="create" type="submit">
            Signup
          </button>
          <span className="nav">
            Already have an account ? <a href="/login">Login</a>
          </span>
        </form>
      </div>
    </>
  );
};

export default Signup;
