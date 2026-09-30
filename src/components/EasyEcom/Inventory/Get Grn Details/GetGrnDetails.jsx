import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetGrnDetails = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [grnData, setGrnData] = useState(null);

  const getGrnDetails = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    setGrnData(null);

    try {
      const response = await fetch(
        `${SERVER_URL}/api/grn/v2/getGrnDetails`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get GRN details"
        );
      }

      setMessage(
        data.message ||
          "GRN details retrieved successfully"
      );

      setGrnData(data);
    } catch (err) {
      console.error(
        "Get GRN details error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessage("");
    setError("");
    setGrnData(null);
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>Get GRN Details</h2>

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={getGrnDetails}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Get GRN Details"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          style={{
            marginLeft: "10px",
          }}
        >
          Clear
        </button>
      </div>

      {/* Success */}
      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
          }}
        >
          <strong>{message}</strong>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
          }}
        >
          <strong>{error}</strong>
        </div>
      )}

      {/* GRN Response */}
      {grnData && (
        <div style={{ marginTop: "20px" }}>
          <h3>GRN Details</h3>

          <pre
            style={{
              padding: "15px",
              overflowX: "auto",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            {JSON.stringify(
              grnData,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetGrnDetails;