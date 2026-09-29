import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const ConfirmOrder = () => {
  const [orderId, setOrderId] = useState("109822130");
  const [height, setHeight] = useState("3");
  const [width, setWidth] = useState("3");
  const [length, setLength] = useState("3");
  const [weight, setWeight] = useState("3");
  const [invoiceId, setInvoiceId] = useState("149487536");

  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setResponseData(null);

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/orders/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderId,
            height: height,
            width: width,
            length: length,
            weight: weight,
            invoice_id: invoiceId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to confirm order"
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
      <h2>Confirm Order</h2>

      <div>
        <label>Order ID</label>
        <br />
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Height</label>
        <br />
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Width</label>
        <br />
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Length</label>
        <br />
        <input
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Weight</label>
        <br />
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Invoice ID</label>
        <br />
        <input
          type="text"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
        />
      </div>

      <br />

      <button
        onClick={confirmOrder}
        disabled={loading}
      >
        {loading ? "Confirming..." : "Confirm Order"}
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

export default ConfirmOrder;

