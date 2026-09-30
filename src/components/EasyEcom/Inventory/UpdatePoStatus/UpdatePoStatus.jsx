import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const UpdatePoStatus = () => {
  const [poId, setPoId] = useState("1024799");
  const [poStatus, setPoStatus] = useState("3");
  const [markPoComplete, setMarkPoComplete] = useState("0");

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResponse(null);

    if (!poId.trim()) {
      setError("PO ID is required");
      return;
    }

    if (!Number.isInteger(Number(poId))) {
      setError("PO ID must be an integer");
      return;
    }

    if (!poStatus.trim()) {
      setError("PO Status is required");
      return;
    }

    if (!Number.isInteger(Number(poStatus))) {
      setError("PO Status must be an integer");
      return;
    }

    if (
      markPoComplete !== "0" &&
      markPoComplete !== "1"
    ) {
      setError("Mark PO Complete must be 0 or 1");
      return;
    }

    const payload = {
      po_id: Number(poId),
      po_status: Number(poStatus),
      markPoComplete: Number(markPoComplete),
    };

    setLoading(true);

    try {
      const res = await fetch(
        `${SERVER_URL}/api/wms/updatePoStatus`,
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
            "Failed to update PO status"
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
    setPoId("");
    setPoStatus("");
    setMarkPoComplete("0");
    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Update PO Status</h2>

      {/* PO ID */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          <strong>PO ID</strong>
        </label>

        <input
          type="number"
          value={poId}
          onChange={(e) => setPoId(e.target.value)}
          placeholder="1024799"
          style={inputStyle}
        />
      </div>

      {/* PO Status */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          <strong>PO Status</strong>
        </label>

        <input
          type="number"
          value={poStatus}
          onChange={(e) =>
            setPoStatus(e.target.value)
          }
          placeholder="3"
          style={inputStyle}
        />
      </div>

      {/* Mark PO Complete */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Mark PO Complete</strong>
        </label>

        <select
          value={markPoComplete}
          onChange={(e) =>
            setMarkPoComplete(e.target.value)
          }
          style={inputStyle}
        >
          <option value="0">0 - No</option>
          <option value="1">1 - Yes</option>
        </select>
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
          onClick={handleSubmit}
          disabled={loading}
          style={buttonStyle}
        >
          {loading
            ? "Updating..."
            : "Update PO Status"}
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

export default UpdatePoStatus;