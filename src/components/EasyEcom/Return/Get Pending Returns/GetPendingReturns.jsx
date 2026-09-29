import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GetPendingReturns = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetPendingReturns = async () => {
    setResponse(null);
    setError("");
    setLoading(true);

    try {
      const result = await axios.get(
        `${SERVER_URL}/api/easyecom/pending-returns`
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "auto",
      }}
    >
      <h2>Get Pending Returns</h2>

      <button
        onClick={handleGetPendingReturns}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Pending Returns"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <h3>Error</h3>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetPendingReturns;

