import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const TaxReport = () => {
  const [taxReportType, setTaxReportType] = useState("RETURN");
  const [warehouseIds, setWarehouseIds] = useState(
    "en284227****,ne286963****"
  );
  const [startDate, setStartDate] = useState("2013-01-01");
  const [endDate, setEndDate] = useState("2013-02-01");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");
    setLoading(true);

    try {
      const payload = {
        reportType: "TAX_REPORT",
        params: {
          taxReportType,
          warehouseIds,
          startDate,
          endDate,
        },
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/tax`,
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
            "Failed to generate Tax Report"
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
      <h2>Tax Report</h2>

      <form onSubmit={handleGenerateReport}>
        <div style={{ marginBottom: "15px" }}>
          <label>Tax Report Type</label>

          <select
            value={taxReportType}
            onChange={(e) => setTaxReportType(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          >
            <option value="RETURN">RETURN</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Warehouse IDs</label>

          <input
            type="text"
            value={warehouseIds}
            onChange={(e) => setWarehouseIds(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Start Date</label>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>End Date</label>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Tax Report"}
        </button>
      </form>

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

export default TaxReport;

