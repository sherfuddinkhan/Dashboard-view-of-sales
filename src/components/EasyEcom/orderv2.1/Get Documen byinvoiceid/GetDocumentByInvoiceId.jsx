import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetDocumentByInvoiceId = () => {
  const [invoiceId, setInvoiceId] = useState("80272440");
  const [isApi, setIsApi] = useState("1");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getDocument = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const params = new URLSearchParams({
        invoice_id: invoiceId,
        is_api: isApi,
      });

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/orders/documents?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to get document"
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
      <h2>Get Document By Invoice ID</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Invoice ID</label>
        <br />
        <input
          type="text"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          placeholder="80272440"
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Is API</label>
        <br />
        <input
          type="text"
          value={isApi}
          onChange={(e) => setIsApi(e.target.value)}
          placeholder="1"
        />
      </div>

      <button onClick={getDocument} disabled={loading}>
        {loading ? "Loading..." : "Get Document"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
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

export default GetDocumentByInvoiceId;

