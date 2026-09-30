import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetChildLocations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getChildLocations = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(
        `${SERVER_URL}/api/account/v1/api/locations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to retrieve child locations"
        );
      }

      setData(result);
    } catch (err) {
      console.error("Get Child Locations Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Child Locations</h2>

      <p style={{ color: "#666" }}>
        Fetch physical locations where stock is stored to fulfill orders.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={getChildLocations}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "5px",
            background: "#1976d2",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Get Child Locations"}
        </button>

        <button
          onClick={clearData}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            background: "#fdecea",
            color: "#b71c1c",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetChildLocations;