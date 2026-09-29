import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const InventoryViewByBin = () => {
  const [inventoryType, setInventoryType] = useState(
    "AVAILABLE_AND_RESERVED"
  );

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setResponse(null);
    setError("");
    setLoading(true);

    try {
      const payload = {
        reportType: "INVENTORY_VIEW_BY_BIN_REPORT",
        params: {
          inventoryType,
        },
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/inventory-view-by-bin`,
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
            "Failed to generate Inventory View By Bin Report"
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
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h2>Inventory View By Bin</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Inventory Type</label>

        <select
          value={inventoryType}
          onChange={(e) => setInventoryType(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "5px",
          }}
        >
          <option value="AVAILABLE_AND_RESERVED">
            AVAILABLE_AND_RESERVED
          </option>

          <option value="REPAIR">
            REPAIR
          </option>

          <option value="DAMAGED">
            DAMAGED
          </option>
        </select>
      </div>

      <button
        type="button"
        onClick={handleGenerateReport}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {error && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#ffe6e6",
            color: "red",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
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

export default InventoryViewByBin;

