import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:5000";

function LandingPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "priya.nair",
    password: "Priya@12345",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear error while user is editing
    if (error) {
      setError("");
    }
  };

  // ============================================================
  // HANDLE LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/auth/login`,
        {
          userName: formData.userName.trim(),
          password: formData.password,
        },
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login Response:", response.data);

      const data = response.data;

      // ========================================================
      // VALIDATE LOGIN RESPONSE
      // ========================================================

      if (!data?.success) {
        setError(
          data?.message ||
            "Invalid username or password."
        );

        return;
      }

      // ========================================================
      // USER / AUTH DATA
      // ========================================================

      const user = data?.user || {};

      const token =
        data?.token ||
        data?.accessToken ||
        user?.token ||
        user?.accessToken ||
        "";

      const sellerId =
        user?.sellerId ??
        data?.sellerId ??
        "";

      const customerId =
        user?.customerId ??
        data?.customerId ??
        "";

      // ========================================================
      // TOKEN VALIDATION
      // ========================================================

      if (!token) {
        setError(
          "Login succeeded, but authentication token was not returned."
        );

        return;
      }

      // ========================================================
      // SAVE AUTHENTICATION
      // ========================================================

      localStorage.setItem(
        "authResponse",
        JSON.stringify(data)
      );

      localStorage.setItem(
        "isAuthenticated",
        "true"
      );

      localStorage.setItem(
        "token",
        token
      );

      // Keep accessToken too if other modules use it.
      localStorage.setItem(
        "accessToken",
        token
      );

      // ========================================================
      // SAVE SELLER / CUSTOMER INFORMATION
      // ========================================================

      if (sellerId !== "" && sellerId !== null) {
        localStorage.setItem(
          "sellerId",
          String(sellerId)
        );
      }

      if (
        customerId !== "" &&
        customerId !== null
      ) {
        localStorage.setItem(
          "customerId",
          String(customerId)
        );
      }

      // ========================================================
      // SAVE USER INFORMATION
      // ========================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // ========================================================
      // REDIRECT
      // ========================================================

      navigate("/marketplaces", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "Login Error:",
        err
      );

      const serverMessage =
        err?.response?.data?.message;

      const serverError =
        err?.response?.data?.error;

      const statusMessage =
        err?.response?.status === 401
          ? "Invalid username or password."
          : err?.response?.status === 403
          ? "You are not authorized to login."
          : err?.response?.status === 404
          ? "Login API was not found."
          : "";

      setError(
        serverMessage ||
          serverError ||
          statusMessage ||
          err?.message ||
          "Authentication failed."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div style={styles.page}>

      <div style={styles.loginCard}>

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div style={styles.header}>

          <div style={styles.logo}>
            SP-API
          </div>

          <h1 style={styles.title}>
            Seller Portal
          </h1>

          <p style={styles.subtitle}>
            Sign in to manage your marketplace integrations
          </p>

        </div>

        {/* ======================================================
            LOGIN FORM
        ======================================================= */}

        <form onSubmit={handleLogin}>

          {/* USERNAME */}

          <div style={styles.formGroup}>

            <label
              htmlFor="userName"
              style={styles.label}
            >
              User Name
            </label>

            <input
              id="userName"
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter User Name"
              autoComplete="username"
              disabled={loading}
              required
              style={{
                ...styles.input,
                ...(loading
                  ? styles.inputDisabled
                  : {}),
              }}
            />

          </div>

          {/* PASSWORD */}

          <div style={styles.formGroup}>

            <label
              htmlFor="password"
              style={styles.label}
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              autoComplete="current-password"
              disabled={loading}
              required
              style={{
                ...styles.input,
                ...(loading
                  ? styles.inputDisabled
                  : {}),
              }}
            />

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Authenticating..."
              : "Login"}
          </button>

        </form>

        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div
            role="alert"
            style={styles.error}
          >
            {error}
          </div>
        )}

        {/* ======================================================
            FOOTER
        ======================================================= */}

        <div style={styles.footer}>
          Marketplace Seller Portal
        </div>

      </div>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #eef4ff 0%, #f7f9fc 50%, #eef2f7 100%)",
  },

  loginCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "35px",
    boxSizing: "border-box",
    borderRadius: "12px",
    boxShadow:
      "0 8px 30px rgba(0, 0, 0, 0.10)",
    border: "1px solid #e5e7eb",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  logo: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "90px",
    height: "42px",
    padding: "0 16px",
    boxSizing: "border-box",
    background: "#1976d2",
    color: "#ffffff",
    borderRadius: "8px",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    marginBottom: "14px",
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: "25px",
    fontWeight: "700",
  },

  subtitle: {
    margin:
      "8px 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    height: "46px",
    boxSizing: "border-box",
    padding: "0 13px",
    border:
      "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    fontSize: "15px",
    color: "#111827",
    background: "#ffffff",
  },

  inputDisabled: {
    background: "#f3f4f6",
    cursor: "not-allowed",
  },

  loginButton: {
    width: "100%",
    height: "46px",
    marginTop: "5px",
    padding: "0 15px",
    background: "#1976d2",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    transition: "opacity 0.2s ease",
  },

  error: {
    marginTop: "18px",
    padding: "12px 14px",
    background: "#fef2f2",
    color: "#b91c1c",
    border:
      "1px solid #fecaca",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "14px",
    lineHeight: 1.4,
  },

  footer: {
    marginTop: "25px",
    paddingTop: "18px",
    borderTop:
      "1px solid #e5e7eb",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "12px",
  },
};

export default LandingPage;