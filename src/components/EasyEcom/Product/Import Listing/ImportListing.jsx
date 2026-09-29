import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const ImportListing = () => {
  const [marketplaceId, setMarketplaceId] = useState("26");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const importListing = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const params = new URLSearchParams({
        marketplaceId,
      });

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/fetch-listing-generic-priority?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to import listing"
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
    <div style={{ padding: "20px" }}>
      <h2>Import Listing</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Marketplace ID</label>
        <br />

        <input
          type="number"
          value={marketplaceId}
          onChange={(e) => setMarketplaceId(e.target.value)}
          placeholder="26"
          style={{
            width: "300px",
            padding: "8px",
          }}
        />
      </div>

      <button
        onClick={importListing}
        disabled={loading}
        style={{
          padding: "10px 20px",
        }}
      >
        {loading ? "Loading..." : "Import Listing"}
      </button>

      {error && (
        <div
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          {error}
        </div>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflow: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ImportListing;

