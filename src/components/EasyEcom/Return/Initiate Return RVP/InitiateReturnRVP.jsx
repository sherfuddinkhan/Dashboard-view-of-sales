import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const InitiateReturnRVP = () => {
  const [referenceCode, setReferenceCode] = useState(
    "OD30714296878GFYT_74"
  );
  const [returnReason, setReturnReason] = useState("Damaged");

  const [items, setItems] = useState([
    {
      parent_sku: "Bcombo123",
      child_sku: "MONI32",
      return_quantity: 1,
    },
    {
      parent_sku: "Bcombo123",
      child_sku: "CCSKU23",
      return_quantity: 1,
    },
  ]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "return_quantity" ? Number(value) : value,
    };

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        parent_sku: "",
        child_sku: "",
        return_quantity: 1,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setResponse(null);

    try {
      const payload = {
        reference_code: referenceCode,
        return_reason: returnReason,
        items,
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/create-initiate-return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to initiate return RVP"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h2>Initiate Return RVP</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Reference Code</label>
        <input
          type="text"
          value={referenceCode}
          onChange={(e) => setReferenceCode(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "5px",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Return Reason</label>
        <input
          type="text"
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "5px",
          }}
        />
      </div>

      <h3>Items</h3>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <label>Parent SKU</label>
            <input
              type="text"
              value={item.parent_sku}
              onChange={(e) =>
                handleItemChange(
                  index,
                  "parent_sku",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Child SKU</label>
            <input
              type="text"
              value={item.child_sku}
              onChange={(e) =>
                handleItemChange(
                  index,
                  "child_sku",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Return Quantity</label>
            <input
              type="number"
              min="1"
              value={item.return_quantity}
              onChange={(e) =>
                handleItemChange(
                  index,
                  "return_quantity",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(index)}
            >
              Remove Item
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        style={{ marginRight: "10px" }}
      >
        Add Item
      </button>

      <button type="button" onClick={handleSubmit}>
        Initiate Return
      </button>

      {error && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#ffe6e6",
            color: "red",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default InitiateReturnRVP;

