
import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CancelAndRenameOrder = () => {
  const [invoice, setInvoice] = useState("60437");
  const [rename, setRename] = useState("0");

  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cancelAndRenameOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setResponseData(null);

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/orders/cancel-rename`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice,
            rename,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Cancel and Rename Order failed"
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
      <h2>Cancel and Rename Order</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Invoice</label>
        <br />

        <input
          type="text"
          value={invoice}
          onChange={(e) =>
            setInvoice(e.target.value)
          }
          style={{
            width: "300px",
            padding: "8px",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Rename</label>
        <br />

        <select
          value={rename}
          onChange={(e) =>
            setRename(e.target.value)
          }
          style={{
            width: "320px",
            padding: "8px",
          }}
        >
          <option value="0">0 - No Rename</option>
          <option value="1">1 - Rename</option>
        </select>
      </div>

      <button
        onClick={cancelAndRenameOrder}
        disabled={loading || !invoice}
        style={{
          padding: "10px 20px",
        }}
      >
        {loading
          ? "Processing..."
          : "Cancel and Rename Order"}
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

export default CancelAndRenameOrder;

