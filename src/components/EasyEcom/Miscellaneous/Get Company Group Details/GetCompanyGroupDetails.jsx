import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetCompanyGroupDetails = () => {
  const [type, setType] = useState("pricing");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetCompanyGroupDetails = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      if (!type.trim()) {
        setError("Type is required.");
        setLoading(false);
        return;
      }

      const query = new URLSearchParams({
        type: type.trim(),
      });

      const res = await fetch(
        `${SERVER_URL}/api/Maintenance/getCompanyGroupDetails?${query.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to get company group details."
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setType("pricing");
    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Company Group Details</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
          }}
        >
          Type
        </label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <option value="pricing">pricing</option>
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleGetCompanyGroupDetails}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: "#1976d2",
              color: "#fff",
            }}
          >
            {loading
              ? "Loading..."
              : "Get Company Group Details"}
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "1px solid #999",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: "#fff",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#fdecea",
            color: "#b71c1c",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
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

export default GetCompanyGroupDetails;