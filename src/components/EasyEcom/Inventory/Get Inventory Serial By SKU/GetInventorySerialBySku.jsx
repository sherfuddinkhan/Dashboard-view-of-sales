import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetInventorySerialBySku = () => {
  const [sku, setSku] = useState("cello01");
  const [status, setStatus] = useState("1");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const getInventorySerials = async () => {
    if (!sku.trim()) {
      setError("SKU is required");
      return;
    }

    if (!status.trim()) {
      setError("Status is required");
      return;
    }

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const params = new URLSearchParams({
        sku: sku.trim(),
        status: status.trim(),
      });

      const res = await fetch(
        `${SERVER_URL}/api/inventory/getInventorySerialsBySku?${params.toString()}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get inventory serials"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setSku("cello01");
    setStatus("1");
    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Inventory Serial By SKU</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label>SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="cello01"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label>Status</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="1"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={getInventorySerials}
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Get Inventory Serials"}
        </button>

        <button
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 20px",
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
            background: "#ffe6e6",
            color: "#b00020",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

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

export default GetInventorySerialBySku;