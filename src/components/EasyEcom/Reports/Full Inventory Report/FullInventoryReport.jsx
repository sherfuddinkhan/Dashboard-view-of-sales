import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const FullInventoryReport = () => {
  const [skus, setSkus] = useState("");
  const [bins, setBins] = useState("");
  const [inventoryStatuses, setInventoryStatuses] = useState("Available");
  const [selectedLocations, setSelectedLocations] = useState("wo9775672384");
  const [uomDetails, setUomDetails] = useState(1);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      reportType: "FULL_INVENTORY_REPORT",
      params: {
        skus,
        bins,
        inventoryStatuses,
        selectedLocations,
        uomDetails: Number(uomDetails),
      },
    };

    try {
      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/full-inventory`,
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
            "Failed to generate Full Inventory Report"
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
      <h2>Full Inventory Report</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>
          SKUs:
          <input
            type="text"
            value={skus}
            onChange={(e) => setSkus(e.target.value)}
            placeholder="Enter SKUs"
            style={{
              marginLeft: "10px",
              padding: "8px",
              width: "300px",
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Bins:
          <input
            type="text"
            value={bins}
            onChange={(e) => setBins(e.target.value)}
            placeholder="Enter bins"
            style={{
              marginLeft: "10px",
              padding: "8px",
              width: "300px",
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Inventory Status:
          <input
            type="text"
            value={inventoryStatuses}
            onChange={(e) => setInventoryStatuses(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "8px",
              width: "300px",
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Selected Locations:
          <input
            type="text"
            value={selectedLocations}
            onChange={(e) => setSelectedLocations(e.target.value)}
            placeholder="Enter location"
            style={{
              marginLeft: "10px",
              padding: "8px",
              width: "300px",
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          UOM Details:
          <select
            value={uomDetails}
            onChange={(e) => setUomDetails(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "8px",
            }}
          >
            <option value={1}>1</option>
            <option value={0}>0</option>
          </select>
        </label>
      </div>

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

export default FullInventoryReport;

