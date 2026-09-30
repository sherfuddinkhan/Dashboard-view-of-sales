import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetInventorySnapshot = () => {
  const [startDate, setStartDate] = useState(
    "2022-03-15 00:00:00"
  );

  const [endDate, setEndDate] = useState(
    "2022-03-21 23:59:59"
  );

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const getInventorySnapshot = async () => {
    setError("");
    setResponse(null);

    if (!startDate.trim()) {
      setError("Start date is required");
      return;
    }

    if (!endDate.trim()) {
      setError("End date is required");
      return;
    }

    const params = new URLSearchParams({
      start_date: startDate.trim(),
      end_date: endDate.trim(),
    });

    setLoading(true);

    try {
      const res = await fetch(
        `${SERVER_URL}/api/inventory/getInventorySnapshotApi?${params.toString()}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get inventory snapshot"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setStartDate("");
    setEndDate("");
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
      <h2>Get Inventory Snapshot</h2>

      {/* Start Date */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          <strong>Start Date</strong>
        </label>

        <input
          type="text"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
          placeholder="2022-03-15 00:00:00"
          style={inputStyle}
        />
      </div>

      {/* End Date */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>End Date</strong>
        </label>

        <input
          type="text"
          value={endDate}
          onChange={(e) =>
            setEndDate(e.target.value)
          }
          placeholder="2022-03-21 23:59:59"
          style={inputStyle}
        />
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={getInventorySnapshot}
          disabled={loading}
          style={buttonStyle}
        >
          {loading
            ? "Loading..."
            : "Get Inventory Snapshot"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          disabled={loading}
          style={buttonStyle}
        >
          Clear
        </button>
      </div>

      {/* Error */}
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

      {/* Response */}
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

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 20px",
};

export default GetInventorySnapshot;