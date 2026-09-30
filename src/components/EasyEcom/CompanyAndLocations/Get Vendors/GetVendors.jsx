import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetVendors = () => {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getVendors = async () => {
    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      const response = await fetch(
        `${SERVER_URL}/api/wms/v2/getVendors`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to retrieve vendors"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message);
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
      <h2>Get Vendors</h2>

      <p
        style={{
          color: "#555",
          marginBottom: "20px",
        }}
      >
        Retrieve all vendors from EasyEcom.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={getVendors}
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
          {loading ? "Loading..." : "Get Vendors"}
        </button>

        <button
          onClick={clearResponse}
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
              maxHeight: "600px",
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

export default GetVendors;