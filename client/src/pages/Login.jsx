import React, { useState } from "react";
import axios from "axios";
import { loginRoute } from "../utils/APIRoutes";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setUserLoggedIn } from "../utils/configs";

const Login = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (handleValidation()) {
      axios
        .post(loginRoute, values)
        .then((res) => {
          setUserLoggedIn(res?.data);
          navigate("/pull-requests");
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response.data.message);
        });
    }
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleValidation = () => {
    const { password, username } = values;
    if (password === "" || username === "") {
      toast.error("Username and Password is required.");
      return false;
    }
    return true;
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
            onChange={(e) => handleChange(e)}
            min="3"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => handleChange(e)}
          />
          <button className="create" type="submit">
            Log In
          </button>
          <span className="nav">
            Don't have an account ? <a href="/signup">Signup</a>
          </span>
        </form>
      </div>
    </>
  );
};

export default Login;
