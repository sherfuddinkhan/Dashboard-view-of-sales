
import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const B2BSaveInvoiceDetails = () => {
  const [form, setForm] = useState({
    invoice_id: "INV12345",
    invoicePdf: "https://example.com/invoice.pdf",
    invoicePrefix: "FY26",
    invoiceNumber: "100245",
    irn: "a7d9f4b2c8e6d1234567890abcdef1234567890abcdef1234567890abcd",
    message: "Invoice generated successfully",
    ackNumber: "112345678901234",
    ackDate: "2026-05-27 14:30:00",
    base64url: "JVBERi0xLjQKJcfs...",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveInvoiceDetails = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/oms/b2b/save-invoice-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to save B2B invoice details"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>B2B - Save Invoice Details</h2>

      {Object.entries(form).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "12px" }}>
          <label>{key}</label>
          <br />

          <input
            type="text"
            name={key}
            value={value}
            onChange={handleChange}
            style={{
              width: "500px",
              padding: "8px",
            }}
          />
        </div>
      ))}

      <button
        onClick={saveInvoiceDetails}
        disabled={loading}
        style={{
          padding: "10px 20px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Saving..." : "Save Invoice Details"}
      </button>

      {error && (
        <div
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          {error}
        </div>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflow: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default B2BSaveInvoiceDetails;

