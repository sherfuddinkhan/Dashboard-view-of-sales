import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetPaymentData = () => {
  const [paymentStartDate, setPaymentStartDate] = useState(
    "2021-01-01 00:00:00"
  );

  const [paymentEndDate, setPaymentEndDate] = useState(
    "2021-04-18 23:59:59"
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPaymentData = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      if (!paymentStartDate.trim()) {
        throw new Error(
          "Payment start date is required"
        );
      }

      if (!paymentEndDate.trim()) {
        throw new Error(
          "Payment end date is required"
        );
      }

      const params = new URLSearchParams({
        payment_start_date: paymentStartDate,
        payment_end_date: paymentEndDate,
      });

      const response = await fetch(
        `${SERVER_URL}/api/getPaymentsData?${params.toString()}`,
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
            "Failed to retrieve payment data"
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Get Payment Data Error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while retrieving payment data"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setPaymentStartDate("");
    setPaymentEndDate("");
    setData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Payment Data</h2>

      <p style={{ color: "#666" }}>
        Retrieve payment data for a specified date range.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label>
            Payment Start Date
          </label>

          <input
            type="text"
            value={paymentStartDate}
            onChange={(e) =>
              setPaymentStartDate(e.target.value)
            }
            placeholder="2021-01-01 00:00:00"
            style={inputStyle}
          />

          <small
            style={{
              display: "block",
              marginTop: "5px",
              color: "#777",
            }}
          >
            Format: YYYY-MM-DD HH:mm:ss
          </small>
        </div>

        <div>
          <label>
            Payment End Date
          </label>

          <input
            type="text"
            value={paymentEndDate}
            onChange={(e) =>
              setPaymentEndDate(e.target.value)
            }
            placeholder="2021-04-18 23:59:59"
            style={inputStyle}
          />

          <small
            style={{
              display: "block",
              marginTop: "5px",
              color: "#777",
            }}
          >
            Format: YYYY-MM-DD HH:mm:ss
          </small>
        </div>
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
          onClick={getPaymentData}
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
            : "Get Payment Data"}
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

export default GetPaymentData;