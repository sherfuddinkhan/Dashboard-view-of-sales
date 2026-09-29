import React, { useState } from "react";

const MapListing = () => {
  const [channelId, setChannelId] = useState("26");
  const [identifier, setIdentifier] = useState("33659590180923");
  const [masterSku, setMasterSku] = useState("ak1");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        "http://localhost:5000/api/easyecom/products/map-listing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channelId: Number(channelId),
            identifier,
            masterSku,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Map Listing failed"
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
      <h2>Map Listing</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Channel ID</label>
          <input
            type="number"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Identifier</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Master SKU</label>
          <input
            type="text"
            value={masterSku}
            onChange={(e) => setMasterSku(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Mapping..." : "Map Listing"}
        </button>
      </form>

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

export default MapListing;

