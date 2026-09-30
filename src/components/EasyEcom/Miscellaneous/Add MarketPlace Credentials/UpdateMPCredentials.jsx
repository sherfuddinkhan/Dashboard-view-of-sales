import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const UpdateMPCredentials = () => {
  const [formData, setFormData] = useState({
    app_id: "",
    app_secret: "",
    m_id: "",
    seller_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const payload = {
        app_id: formData.app_id,
        app_secret: formData.app_secret,
        m_id: formData.m_id,
        seller_id: formData.seller_id,
      };

      const res = await fetch(
        `${SERVER_URL}/api/Credentials/updateMPCredentials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to update marketplace credentials"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      app_id: "",
      app_secret: "",
      m_id: "",
      seller_id: "",
    });

    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Update Marketplace Credentials</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>App ID</label>
          <input
            type="text"
            name="app_id"
            value={formData.app_id}
            onChange={handleChange}
            placeholder="Enter App ID"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>App Secret</label>
          <input
            type="password"
            name="app_secret"
            value={formData.app_secret}
            onChange={handleChange}
            placeholder="Enter App Secret"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Marketplace ID (m_id)</label>
          <input
            type="text"
            name="m_id"
            value={formData.m_id}
            onChange={handleChange}
            placeholder="Enter Marketplace ID"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Seller ID</label>
          <input
            type="text"
            name="seller_id"
            value={formData.seller_id}
            onChange={handleChange}
            placeholder="Enter Seller ID"
            required
            style={styles.input}
          />
        </div>

        <div style={{ marginTop: "25px" }}>
          <button
            type="submit"
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? "Updating..." : "Update MP Credentials"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            style={styles.secondaryButton}
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div style={styles.error}>
          <strong>Error:</strong>
          <div>{error}</div>
        </div>
      )}

      {response && (
        <div style={styles.success}>
          <h3>Response</h3>

          <pre style={styles.pre}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const styles = {
  field: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box",
    fontSize: "14px",
  },

  primaryButton: {
    padding: "11px 20px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },

  secondaryButton: {
    padding: "11px 20px",
    background: "#777",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  error: {
    marginTop: "20px",
    padding: "15px",
    background: "#ffebee",
    color: "#c62828",
    borderRadius: "5px",
  },

  success: {
    marginTop: "20px",
    padding: "15px",
    background: "#e8f5e9",
    borderRadius: "5px",
  },

  pre: {
    background: "#f5f5f5",
    padding: "15px",
    overflowX: "auto",
    borderRadius: "5px",
  },
};

export default UpdateMPCredentials;