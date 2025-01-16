"use client";
import React, { useState, useEffect } from "react";

const Login = ({ setActiveComponent, axios, notifyError, notifySuccess }: any) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFormFieldChange = (fieldName: any, e: any) => {
    setUser({ ...user, [fieldName]: e.target.value });
  };

  const validateForm = () => {
    if (!user.email || !user.password) {
      notifyError("Please provide both email and password");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      notifyError("Please provide a valid email address");
      return false;
    }

    return true;
  };

  const apiLogin = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    notifySuccess("Logging in...");
    try {
      //API CALL
      const response = await axios({
        method: "POST",
        url: `/api/v1/user/login`,
        withCredentials: true,
        data: {
          email: user.email.trim(),
          password: user.password,
        },
      });

      if (response.data.status === "success") {
        const { user, token } = response.data.data;

        // Store user data
        localStorage.setItem("USER_MEMBERSHIP", user.membershipType);
        localStorage.setItem("CryptoBot_BackEnd", user._id);
        localStorage.setItem("CryptoAUT_TOKEN", token);

        notifySuccess("Login successful!");
        window.location.reload();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "An error occurred during login. Please try again.";
      notifyError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="techwave_fn_sign">
      <div className="sign__content">
        <h1 className="logo">Designed by Daulat</h1>
        <form className="login" onSubmit={apiLogin}>
          <div className="form__content">
            <div className="form_title">Sign In</div>

            <div className="form__username">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="input"
                value={user.email}
                onChange={(e) => handleFormFieldChange("email", e)}
                required
              />
            </div>

            <div className="form__username">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="input"
                value={user.password}
                onChange={(e) => handleFormFieldChange("password", e)}
                required
              />
            </div>

            <div className="form__alternative">
              <button
                type="submit"
                className="techwave_fn_button"
                disabled={isLoading}
              >
                <span>{isLoading ? "Logging in..." : "Log In"}</span>
              </button>
            </div>
          </div>
        </form>

        <div className="sign__desc">
          <p>
            Not a member?{" "}
            <a
              onClick={() => setActiveComponent("Signup")}
              style={{ cursor: "pointer" }}
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
