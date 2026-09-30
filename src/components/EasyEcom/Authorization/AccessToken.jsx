import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const AccessToken = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    location_key: "",
  });

  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateToken = async () => {
    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      if (!form.email.trim()) {
        throw new Error("Email is required");
      }

      if (!form.password.trim()) {
        throw new Error("Password is required");
      }

      if (!form.location_key.trim()) {
        throw new Error("Location Key is required");
      }

      const response = await fetch(
        `${SERVER_URL}/api/access/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
            location_key: form.location_key.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to generate access token"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm({
      email: "",
      password: "",
      location_key: "",
    });

    setResponseData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>EasyEcom Authorization</h2>

      {/* Email */}

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Email
        </label>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="demo@example.com"
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Password */}

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Password
        </label>

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Location Key */}

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Location Key
        </label>

        <input
          type="text"
          name="location_key"
          value={form.location_key}
          onChange={handleChange}
          placeholder="ht3485485444"
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Buttons */}

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={generateToken}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Generating..."
            : "Generate Access Token"}
        </button>

        <button
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#777",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            border: "1px solid #ef9a9a",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Response */}

      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              border: "1px solid #ddd",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            {JSON.stringify(
              responseData,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AccessToken;