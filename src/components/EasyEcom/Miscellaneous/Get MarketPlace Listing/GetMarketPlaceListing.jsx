import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetMarketPlaceListing = () => {
  const [marketPlaceID, setMarketPlaceID] = useState("26");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!marketPlaceID.trim()) {
      setError("marketPlaceID is required");
      return;
    }

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const res = await fetch(
        `${SERVER_URL}/api/Listings/getMarketPlaceListing?marketPlaceID=${encodeURIComponent(
          marketPlaceID
        )}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to get marketplace listing"
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
    setMarketPlaceID("");
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
      <h2>Get Marketplace Listing</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Marketplace ID</label>

          <input
            type="number"
            min="1"
            value={marketPlaceID}
            onChange={(e) => setMarketPlaceID(e.target.value)}
            placeholder="Enter Marketplace ID"
            required
            style={styles.input}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? "Loading..." : "Get Marketplace Listing"}
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
          <h3>Marketplace Listing Response</h3>

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
    marginBottom: "15px",
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

export default GetMarketPlaceListing;