import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const UnassignCarrier = () => {
  const [invoiceId, setInvoiceId] = useState("76658392");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const payload = {
        invoice_id: Number(invoiceId),
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/orders/unassign-courier`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : err.message
      );
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Unassign Carrier</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Invoice ID</label>

          <input
            type="number"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit">
          Unassign Carrier
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h3>Error</h3>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UnassignCarrier;

