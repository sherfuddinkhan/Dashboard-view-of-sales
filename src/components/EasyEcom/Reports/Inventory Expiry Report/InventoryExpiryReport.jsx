import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const InventoryExpiryReport = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      reportType: "INVENTORY_EXPIRY_REPORT",
    };

    try {
      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/inventory-expiry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to generate Inventory Expiry Report"
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
      <h2>Inventory Expiry Report</h2>

      <button onClick={generateReport} disabled={loading}>
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          {error}
        </div>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default InventoryExpiryReport;

