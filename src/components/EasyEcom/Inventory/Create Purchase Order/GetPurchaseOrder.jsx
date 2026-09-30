import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetPurchaseOrder = () => {
  const [purchaseOrderData, setPurchaseOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getPurchaseOrderDetails = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    setPurchaseOrderData(null);

    try {
      const response = await fetch(
        `${SERVER_URL}/api/wms/v2/getPurchaseOrderDetails`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get purchase order details"
        );
      }

      setPurchaseOrderData(data);

      setMessage(
        data.message ||
          "Purchase order details retrieved successfully"
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to get purchase order details"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setPurchaseOrderData(null);
    setMessage("");
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Purchase Order Details</h2>

      <p>
        <strong>EasyEcom API:</strong>{" "}
        GET /wms/V2/getPurchaseOrderDetails
      </p>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={getPurchaseOrderDetails}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Loading..."
            : "Get Purchase Order Details"}
        </button>

        <button
          onClick={clearData}
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "4px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {purchaseOrderData && (
        <div>
          <h3>Purchase Order Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(purchaseOrderData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetPurchaseOrder;