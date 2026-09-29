import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function FetchOrderV1() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchOrder = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/fetch-order-v1`,
        {},
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error("Fetch Order V1 Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Fetch Order V1 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Fetch Order V1</h2>

      <p>
        Fetch Order V1 uses:
        <strong> POST /api/easyecom/webhook/fetch-order-v1</strong>
      </p>

      <button
        type="button"
        onClick={handleFetchOrder}
        disabled={loading}
      >
        {loading ? "Fetching..." : "Fetch Orders V1"}
      </button>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <strong>Error:</strong>

          <pre>
            {error}
          </pre>
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
}

export default FetchOrderV1;