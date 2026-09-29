import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const MarkReturn = () => {
  const [invoiceId, setInvoiceId] = useState("75905242");
  const [returnDate, setReturnDate] = useState("2022-03-22");

  const [sku, setSku] = useState("DBONA0002DR");
  const [quantity, setQuantity] = useState("1");
  const [qcPass, setQcPass] = useState("0");
  const [inventoryStatus, setInventoryStatus] = useState("13");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const payload = {
        invoice_id: Number(invoiceId),
        return_date: returnDate,
        items: [
          {
            sku,
            quantity: Number(quantity),
            qc_pass: Number(qcPass),
            inventory_status: Number(inventoryStatus),
          },
        ],
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/orders/mark-return`,
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
    <div
      style={{
        padding: "20px",
        maxWidth: "700px",
        margin: "auto",
      }}
    >
      <h2>Mark Return</h2>

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

        <div style={{ marginBottom: "15px" }}>
          <label>Return Date</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <h3>Return Item</h3>

        <div style={{ marginBottom: "15px" }}>
          <label>SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>QC Pass</label>
          <select
            value={qcPass}
            onChange={(e) => setQcPass(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          >
            <option value="0">0 - Failed</option>
            <option value="1">1 - Passed</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Inventory Status</label>
          <input
            type="number"
            value={inventoryStatus}
            onChange={(e) => setInventoryStatus(e.target.value)}
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
          Mark Return
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <h3>Error</h3>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MarkReturn;

