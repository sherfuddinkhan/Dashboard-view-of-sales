import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const ListReports = () => {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getReports = async () => {
    setLoading(true);
    setError("");
    setReports(null);

    try {
      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/list`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get reports list"
        );
      }

      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>List Reports</h2>

      <button onClick={getReports} disabled={loading}>
        {loading ? "Loading..." : "Get Reports"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          {error}
        </div>
      )}

      {reports && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(reports, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ListReports;

