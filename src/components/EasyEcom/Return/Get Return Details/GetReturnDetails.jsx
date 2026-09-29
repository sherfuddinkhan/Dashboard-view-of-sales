import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetReturnDetails = () => {
  const [invoiceId, setInvoiceId] = useState("149456297");
  const [orderId, setOrderId] = useState("119119260");
  const [referenceCode, setReferenceCode] = useState("2775");
  const [creditNoteId, setCreditNoteId] = useState("20300783");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleGetReturnDetails = async () => {
    setError("");
    setResponse(null);

    try {
      const params = new URLSearchParams({
        invoice_id: invoiceId,
        order_id: orderId,
        reference_code: referenceCode,
        credit_note_id: creditNoteId,
      });

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/orders/return-details?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get return details"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", padding: "20px" }}>
      <h2>Get Return Details</h2>

      <div style={{ marginBottom: "12px" }}>
        <label>Invoice ID</label>
        <input
          type="text"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>Order ID</label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>Reference Code</label>
        <input
          type="text"
          value={referenceCode}
          onChange={(e) => setReferenceCode(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>Credit Note ID</label>
        <input
          type="text"
          value={creditNoteId}
          onChange={(e) => setCreditNoteId(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <button onClick={handleGetReturnDetails}>
        Get Return Details
      </button>

      {error && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#ffe6e6",
            color: "red",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
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

export default GetReturnDetails;

