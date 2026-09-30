import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function FetchOrderV2() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchOrder = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/fetch-order-v2`,
        {},
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error("Fetch Order V2 Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Fetch Order V2 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Fetch Order V2</h2>

      <p>
        Fetch Order V2 uses:
        <strong> POST /api/easyecom/webhook/fetch-order-v2</strong>
      </p>

      <button
        type="button"
        onClick={handleFetchOrder}
        disabled={loading}
      >
        {loading ? "Fetching..." : "Fetch Orders V2"}
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

export default FetchOrderV2;