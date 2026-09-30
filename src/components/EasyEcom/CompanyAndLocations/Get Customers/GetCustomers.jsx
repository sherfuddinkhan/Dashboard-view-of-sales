import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetCustomers = () => {
  const [type, setType] = useState("stn");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCustomers = async () => {
    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      if (!type.trim()) {
        throw new Error("Type is required");
      }

      const params = new URLSearchParams({
        type: type.trim(),
      });

      const response = await fetch(
        `${SERVER_URL}/api/Wholesale/v2/UserManagement?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to retrieve customers"
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
    setType("stn");
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
      <h2>Get Customers</h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Type
        </label>

        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="stn"
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={getCustomers}
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
          {loading ? "Loading..." : "Get Customers"}
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
              maxHeight: "600px",
              overflowY: "auto",
              border: "1px solid #ddd",
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

export default GetCustomers;