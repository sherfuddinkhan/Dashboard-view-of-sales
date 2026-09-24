import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ApprovePurchaseOrder = () => {
  const [purchaseOrderCode, setPurchaseOrderCode] = useState("");
  const [facility, setFacility] = useState("");

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleApprove = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!purchaseOrderCode.trim()) {
      setError("Please enter a purchase order code.");
      return;
    }

    if (!facility.trim()) {
      setError("Please enter the Uniware facility code.");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders/approve`,
        {
          purchaseOrderCode: purchaseOrderCode.trim(),
          facility: facility.trim(),
        }
      );

      setResponse(result.data);

      if (!result.data.successful) {
        setError(
          result.data.message || "Purchase order approval failed."
        );
      }
    } catch (err) {
      console.error("Approve Purchase Order Error:", err);

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          err.message ||
          "Failed to approve purchase order."
      );

      setResponse(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPurchaseOrderCode("");
    setFacility("");
    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "24px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>
        Approve Purchase Order
      </h2>

      <p
        style={{
          marginTop: 0,
          color: "#666",
          marginBottom: "25px",
        }}
      >
        Approve a Uniware purchase order using its purchase order
        code.
      </p>

      <form onSubmit={handleApprove}>
        {/* Purchase Order Code */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Purchase Order Code
          </label>

          <input
            type="text"
            value={purchaseOrderCode}
            onChange={(e) => setPurchaseOrderCode(e.target.value)}
            placeholder="Example: PO0838"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Facility */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Facility Code
          </label>

          <input
            type="text"
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            placeholder="Example: MAIN"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />

          <small
            style={{
              display: "block",
              marginTop: "6px",
              color: "#777",
            }}
          >
            Enter the facility code configured in Uniware.
          </small>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: "#ffebee",
              border: "1px solid #ef9a9a",
              color: "#c62828",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px",
              border: "none",
              borderRadius: "6px",
              background: loading ? "#999" : "#1976d2",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Approving..." : "Approve Purchase Order"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={{
              padding: "12px 24px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Response */}
      {response && (
        <div
          style={{
            marginTop: "30px",
            padding: "18px",
            borderRadius: "8px",
            background: response.successful
              ? "#e8f5e9"
              : "#ffebee",
            border: response.successful
              ? "1px solid #a5d6a7"
              : "1px solid #ef9a9a",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {response.successful ? "Approval Successful" : "Approval Failed"}
          </h3>

          <p>
            <strong>Message:</strong>{" "}
            {response.message || "No message returned"}
          </p>

          {/* Errors */}
          {response.errors?.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <strong>Errors</strong>

              <ul>
                {response.errors.map((item, index) => (
                  <li key={index}>
                    {item.message ||
                      item.description ||
                      "Unknown error"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {response.warnings?.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <strong>Warnings</strong>

              <ul>
                {response.warnings.map((item, index) => (
                  <li key={index}>
                    {item.message ||
                      item.description ||
                      "Unknown warning"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovePurchaseOrder;