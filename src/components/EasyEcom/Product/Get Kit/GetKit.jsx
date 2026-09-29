
import React, { useState } from "react";

const GetKit = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetKits = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        "http://localhost:5000/api/easyecom/products/kits"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Get Kit failed"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto" }}>
      <h2>Get Kit</h2>

      <button
        onClick={handleGetKits}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Kits"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetKit;

