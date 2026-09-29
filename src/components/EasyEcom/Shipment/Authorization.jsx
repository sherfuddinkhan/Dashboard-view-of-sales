import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const AccessToken = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    location_key: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/access-token`,
        form
      );

      setResponse(result.data);

      // If EasyEcom returns the token in one of these common fields
      const token =
        result.data?.data?.access_token ||
        result.data?.data?.token ||
        result.data?.access_token ||
        result.data?.token;

      if (token) {
        sessionStorage.setItem("easyecom_jwt_token", token);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Authorization failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "25px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>EasyEcom Authorization</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Location Key</label>

          <input
            type="text"
            name="location_key"
            value={form.location_key}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
          }}
        >
          {loading ? "Authenticating..." : "Get Access Token"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#ffe5e5",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#e8f5e9",
          }}
        >
          <h3>EasyEcom Response</h3>

          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  boxSizing: "border-box",
};

export default AccessToken;