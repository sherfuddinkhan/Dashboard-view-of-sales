import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const AddMPCredentials = () => {
  const [formData, setFormData] = useState({
    m_id: "10",
    seller_id: "easyecomtest",
    seller_user_id: "256",
    app_id: "876543sdfghjk",
    ref_key: "2546",
    app_secret: "123456",
    cp_auto_create: "1",
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
        m_id: Number(formData.m_id),
        seller_id: formData.seller_id,
        seller_user_id: Number(formData.seller_user_id),
        app_id: formData.app_id,
        ref_key: formData.ref_key,
        app_secret: formData.app_secret,
        cp_auto_create: Number(formData.cp_auto_create),
      };

      const res = await fetch(
        `${SERVER_URL}/api/Credentials/addMPCredentials`,
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
          data?.message || "Failed to add marketplace credentials"
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
      m_id: "",
      seller_id: "",
      seller_user_id: "",
      app_id: "",
      ref_key: "",
      app_secret: "",
      cp_auto_create: "1",
    });

    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Add Marketplace Credentials</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Marketplace ID (m_id)</label>
            <input
              type="number"
              name="m_id"
              value={formData.m_id}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Seller ID</label>
            <input
              type="text"
              name="seller_id"
              value={formData.seller_id}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Seller User ID</label>
            <input
              type="number"
              name="seller_user_id"
              value={formData.seller_user_id}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>App ID</label>
            <input
              type="text"
              name="app_id"
              value={formData.app_id}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Ref Key</label>
            <input
              type="text"
              name="ref_key"
              value={formData.ref_key}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>App Secret</label>
            <input
              type="text"
              name="app_secret"
              value={formData.app_secret}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>CP Auto Create</label>
            <select
              name="cp_auto_create"
              value={formData.cp_auto_create}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="1">1 - Yes</option>
              <option value="0">0 - No</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "25px" }}>
          <button
            type="submit"
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? "Adding..." : "Add MP Credentials"}
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
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "10px",
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

export default AddMPCredentials;