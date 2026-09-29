import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const QcConfirmOrder = () => {
  const [invoiceId, setInvoiceId] =
    useState("59738205");

  const [responseData, setResponseData] =
    useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const qcConfirmOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setResponseData(null);

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/orders/qc-confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_id: Number(invoiceId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "QC Confirm Order failed"
        );
      }

      setResponseData(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>QC Confirm Order</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Invoice ID</label>
        <br />

        <input
          type="number"
          value={invoiceId}
          onChange={(e) =>
            setInvoiceId(e.target.value)
          }
          style={{
            width: "300px",
            padding: "8px",
          }}
        />
      </div>

      <button
        onClick={qcConfirmOrder}
        disabled={loading || !invoiceId}
        style={{
          padding: "10px 20px",
        }}
      >
        {loading
          ? "Confirming..."
          : "QC Confirm Order"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      {responseData && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(
              responseData,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default QcConfirmOrder;

