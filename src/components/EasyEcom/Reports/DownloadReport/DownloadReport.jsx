
import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const DownloadReport = () => {
  const [reportId, setReportId] = useState("7568****");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/download?reportId=${encodeURIComponent(
          reportId
        )}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to download report"
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
      <h2>Download Report</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Report ID:
          <input
            type="text"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            placeholder="Enter report ID"
            style={{
              marginLeft: "10px",
              padding: "8px",
              width: "250px",
            }}
          />
        </label>
      </div>

      <button onClick={downloadReport} disabled={loading}>
        {loading ? "Downloading..." : "Download Report"}
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

export default DownloadReport;

