import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const ValidateMarketplaceCredentials = () => {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateCredentials = async () => {
    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      const response = await fetch(
        `${SERVER_URL}/api/current-channel-status`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to validate marketplace credentials"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponseData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Validate Marketplace Credentials</h2>

      <p style={{ color: "#555" }}>
        Check the credential status of integrated EasyEcom marketplaces.
      </p>

      <div style={{ marginTop: "25px" }}>
        <button
          onClick={validateCredentials}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            marginRight: "10px",
          }}
        >
          {loading ? "Checking..." : "Validate Credentials"}
        </button>

        <button
          onClick={clearResponse}
          style={{
            padding: "10px 20px",
            backgroundColor: "#777",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: "20px", color: "#1976d2" }}>
          Validating marketplace credentials...
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "20px",
              borderRadius: "5px",
              overflowX: "auto",
              border: "1px solid #ddd",
            }}
          >
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ValidateMarketplaceCredentials;