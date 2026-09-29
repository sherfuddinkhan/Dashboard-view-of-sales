import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const PendingReturnReport = () => {
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-03-30");

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
        reportType: "PENDING_RETURN_REPORT",
        params: {
          startDate,
          endDate,
        },
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/pending-return`,
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
            "Failed to generate Pending Return Report"
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
      <h2>Pending Return Report</h2>

      <p>
        <strong>Note:</strong> When start and end dates are used,
        EasyEcom allows a maximum 90-day report period.
      </p>

      <form onSubmit={handleGenerateReport}>
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
          {loading ? "Generating..." : "Generate Pending Return Report"}
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

export default PendingReturnReport;

