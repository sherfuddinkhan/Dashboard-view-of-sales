import React, { useState } from "react";

const GetProductMastersCount = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetCount = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        "http://localhost:5000/api/easyecom/products/masters-count"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Get Product Masters Count failed"
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
    <div style={{ maxWidth: "700px", margin: "30px auto" }}>
      <h2>Get Product Masters Count</h2>

      <button onClick={handleGetCount} disabled={loading}>
        {loading ? "Loading..." : "Get Product Masters Count"}
      </button>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
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

export default GetProductMastersCount;

