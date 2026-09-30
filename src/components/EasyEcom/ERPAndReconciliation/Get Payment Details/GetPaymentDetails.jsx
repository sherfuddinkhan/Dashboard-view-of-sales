import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetPaymentDetails = () => {
  const [paymentId, setPaymentId] = useState("975117");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPaymentDetails = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      if (!paymentId.trim()) {
        throw new Error("payment_id is required");
      }

      const params = new URLSearchParams({
        payment_id: paymentId,
      });

      const response = await fetch(
        `${SERVER_URL}/api/getDetailedPaymentsData?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to retrieve payment details"
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Get Payment Details Error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while retrieving payment details"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setPaymentId("");
    setData(null);
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
      <h2>Get Payment Details</h2>

      <p style={{ color: "#666" }}>
        Retrieve detailed information for a specific payment.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <label>Payment ID</label>

        <input
          type="number"
          value={paymentId}
          onChange={(e) =>
            setPaymentId(e.target.value)
          }
          placeholder="975117"
          style={inputStyle}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={getPaymentDetails}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "5px",
            background: "#1976d2",
            color: "#fff",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Loading..."
            : "Get Payment Details"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            background: "#fdecea",
            color: "#b71c1c",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  marginTop: "6px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
};

export default GetPaymentDetails;