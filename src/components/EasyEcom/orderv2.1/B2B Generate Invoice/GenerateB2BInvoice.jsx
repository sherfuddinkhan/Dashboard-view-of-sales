import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GenerateB2BInvoice = () => {
  const [invoiceId, setInvoiceId] = useState("112117459");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateInvoice = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/orders/generate-b2b-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoiceId: Number(invoiceId),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to generate B2B invoice"
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
      <h2>Generate B2B Invoice</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Invoice ID</label>
        <br />

        <input
          type="number"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          placeholder="112117459"
          style={{
            width: "300px",
            padding: "8px",
          }}
        />
      </div>

      <button
        onClick={generateInvoice}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate B2B Invoice"}
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

export default GenerateB2BInvoice;

