import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CheckCompany = () => {
  const [brandingUserId, setBrandingUserId] = useState(
    "testapicompany@gmail.com"
  );
  const [clientId, setClientId] = useState("abcdTest1234");

  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkCompany = async () => {
    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      if (!brandingUserId.trim()) {
        throw new Error("Branding User ID is required");
      }

      if (!clientId.trim()) {
        throw new Error("Client ID is required");
      }

      const params = new URLSearchParams({
        branding_user_id: brandingUserId.trim(),
        client_id: clientId.trim(),
      });

      const response = await fetch(
        `${SERVER_URL}/api/company/checkCompany?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to check company"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setBrandingUserId("");
    setClientId("");
    setResponseData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Check Company</h2>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Branding User ID
        </label>

        <input
          type="email"
          value={brandingUserId}
          onChange={(e) => setBrandingUserId(e.target.value)}
          placeholder="testapicompany@gmail.com"
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Client ID
        </label>

        <input
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="abcdTest1234"
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={checkCompany}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Checking..." : "Check Company"}
        </button>

        <button
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#777",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            border: "1px solid #ef9a9a",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              border: "1px solid #ddd",
            }}
          >
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CheckCompany;