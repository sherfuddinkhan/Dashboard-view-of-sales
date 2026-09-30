import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetCountries = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const res = await fetch(`${SERVER_URL}/api/getCountries`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to get countries"
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
    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Countries</h2>

      <p style={{ color: "#666" }}>
        Get country details from EasyEcom.
      </p>

      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={loading}
          style={styles.primaryButton}
        >
          {loading ? "Loading..." : "Get Countries"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={styles.secondaryButton}
        >
          Clear
        </button>
      </form>

      {error && (
        <div style={styles.error}>
          <strong>Error:</strong>
          <div>{error}</div>
        </div>
      )}

      {response && (
        <div style={styles.success}>
          <h3>Countries Response</h3>

          <pre style={styles.pre}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const styles = {
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

export default GetCountries;