import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const B2BOrderApproval = () => {
  const [referenceCode, setReferenceCode] =
    useState("206938289");

  const [approveAll, setApproveAll] =
    useState(false);

  const [items, setItems] = useState([
    {
      sku: "TESTSKU1",
      confirmedQuantity: 8,
    },
    {
      sku: "TESTSKU2",
      confirmedQuantity: 5,
    },
  ]);

  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "confirmedQuantity"
          ? Number(value)
          : value,
    };

    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setResponseData(null);

      const requestBody = {
        reference_code: Number(referenceCode),
        approve_all: approveAll,
        items: items,
      };

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/b2b/orders/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "B2B Order Approval failed"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>B2B Order Approval</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Reference Code</label>
        <br />

        <input
          type="number"
          value={referenceCode}
          onChange={(e) =>
            setReferenceCode(e.target.value)
          }
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <input
            type="checkbox"
            checked={approveAll}
            onChange={(e) =>
              setApproveAll(e.target.checked)
            }
          />

          {" "}Approve All
        </label>
      </div>

      <h3>Items</h3>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <input
            type="text"
            value={item.sku}
            onChange={(e) =>
              handleItemChange(
                index,
                "sku",
                e.target.value
              )
            }
            placeholder="SKU"
          />

          <input
            type="number"
            value={item.confirmedQuantity}
            onChange={(e) =>
              handleItemChange(
                index,
                "confirmedQuantity",
                e.target.value
              )
            }
            placeholder="Confirmed Quantity"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? "Approving..."
          : "Approve B2B Order"}
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
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            responseData,
            null,
            2
          )}
        </pre>
      )}
    </div>
  );
};

export default B2BOrderApproval;

