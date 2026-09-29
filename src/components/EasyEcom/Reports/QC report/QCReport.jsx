import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const QCReport = () => {
  const [startDate, setStartDate] = useState("2025-05-22");
  const [endDate, setEndDate] = useState("2025-05-22");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      reportType: "QC_REPORT",
      params: {
        startDate,
        endDate,
      },
    };

    try {
      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/qc`,
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
            "Failed to generate QC Report"
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
      <h2>QC Report</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
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

export default QCReport;

