import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

 const handleLogin = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      formData,
      {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Login Response:", response.data);

    if (response.data?.success) {

      // Save authentication
      localStorage.setItem(
        "authResponse",
        JSON.stringify(response.data)
      );

      localStorage.setItem(
        "isAuthenticated",
        "true"
      );

      // Save token separately
      localStorage.setItem(
        "token",
        response.data.token
      );

      // Save seller/customer information
      localStorage.setItem(
        "sellerId",
        response.data.user.sellerId
      );

      localStorage.setItem(
        "customerId",
        response.data.user.customerId
      );

      // Redirect
      navigate("/dashboard", {
        replace: true,
      });
    }

  } catch (err) {

    console.error("Login Error:", err);

    setError(
      err.response?.data?.message ||
      err.message ||
      "Authentication failed"
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.page}>

      <div style={styles.loginCard}>

        <h1 style={styles.title}>
          Amazon SP-API
        </h1>

        <p style={styles.subtitle}>
          Seller Portal
        </p>

        <form onSubmit={handleLogin}>

          <div style={styles.formGroup}>

            <label style={styles.label}>
              User Name
            </label>

            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter User Name"
              required
              style={styles.input}
            />

          </div>

          <div style={styles.formGroup}>

            <label style={styles.label}>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              required
              style={styles.input}
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Authenticating..."
              : "Login"}
          </button>

        </form>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

      </div>

    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
  },

  loginCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "35px",
    borderRadius: "10px",
    boxShadow:
      "0 3px 15px rgba(0,0,0,0.12)",
  },

  title: {
    textAlign: "center",
    color: "#1976d2",
    margin: 0,
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: "30px",
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "15px",
  },

  loginButton: {
    width: "100%",
    padding: "12px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  error: {
    marginTop: "18px",
    padding: "12px",
    background: "#f8d7da",
    color: "#721c24",
    borderRadius: "5px",
    textAlign: "center",
  },
};

export default LandingPage;