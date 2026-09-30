import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const SwitchSyncStatus = () => {
  const [formData, setFormData] = useState({
    m_id: "10",
    syncStatus: "1",
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
        syncStatus: Number(formData.syncStatus),
      };

      const res = await fetch(
        `${SERVER_URL}/api/Maintenance/switchSyncStatus`,
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
          data?.message || "Failed to switch marketplace sync status"
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
      syncStatus: "1",
    });

    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Switch Marketplace Sync Status</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Marketplace ID (m_id)</label>

          <input
            type="number"
            min="1"
            name="m_id"
            value={formData.m_id}
            onChange={handleChange}
            placeholder="Enter Marketplace ID"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Sync Status</label>

          <select
            name="syncStatus"
            value={formData.syncStatus}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="1">1 - Activate Marketplace</option>
            <option value="0">0 - Deactivate Marketplace</option>
          </select>
        </div>

        <div style={{ marginTop: "25px" }}>
          <button
            type="submit"
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? "Updating..." : "Switch Sync Status"}
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

export default SwitchSyncStatus;