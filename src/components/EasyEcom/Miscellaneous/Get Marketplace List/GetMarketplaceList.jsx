import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetMarketplaceList = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleGetMarketplaceList = async () => {
    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const res = await fetch(
        `${SERVER_URL}/api/marketplaces/list`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get marketplace list."
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Marketplace List</h2>

      <p>
        Retrieve all marketplaces configured in EasyEcom.
      </p>

      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          onClick={handleGetMarketplaceList}
          disabled={loading}
          style={{
            padding: "10px 18px",
            marginRight: "10px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Get Marketplace List"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
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
            background: "#ffe5e5",
            border: "1px solid #ff9999",
            borderRadius: "5px",
            color: "#b00000",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "25px" }}>
          <h3>Marketplace List Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetMarketplaceList;