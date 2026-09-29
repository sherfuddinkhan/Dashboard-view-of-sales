import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CancelOrder = () => {
  const [referenceCode, setReferenceCode] =
    useState("DBM4227");

  const [responseData, setResponseData] =
    useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cancelOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setResponseData(null);

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/orders/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference_code: referenceCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Cancel Order failed"
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
      <h2>Cancel Order</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Reference Code</label>
        <br />

        <input
          type="text"
          value={referenceCode}
          onChange={(e) =>
            setReferenceCode(e.target.value)
          }
          style={{
            width: "300px",
            padding: "8px",
          }}
        />
      </div>

      <button
        onClick={cancelOrder}
        disabled={loading || !referenceCode}
        style={{
          padding: "10px 20px",
        }}
      >
        {loading
          ? "Cancelling..."
          : "Cancel Order"}
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

export default CancelOrder;

