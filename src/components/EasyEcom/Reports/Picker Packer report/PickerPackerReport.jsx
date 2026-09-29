import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const PickerPackerReport = () => {
  const [startDate, setStartDate] = useState("2025-05-17");
  const [endDate, setEndDate] = useState("2025-05-23");
  const [dateType, setDateType] = useState("PackingDate");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      reportType: "PICKER_PACKER_REPORT",
      params: {
        startDate,
        endDate,
        dateType,
      },
    };

    try {
      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/picker-packer`,
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
            "Failed to generate Picker Packer Report"
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
      <h2>Picker Packer Report</h2>

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

      <div style={{ marginBottom: "15px" }}>
        <label>
          Date Type:
          <select
            value={dateType}
            onChange={(e) => setDateType(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="PackingDate">PackingDate</option>
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

export default PickerPackerReport;

