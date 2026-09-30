import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const UnifiedBulkInventoryUpdateStarter = () => {
  const [items, setItems] = useState([
    {
      sku: "test_expiry_1",
      quantity: "600",
    },
    {
      sku: "test_expiry_2",
      quantity: "600",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        sku: "",
        quantity: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setResponse(null);

    if (items.length === 0) {
      setError("At least one item is required");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.sku.trim()) {
        setError(`SKU is required for item ${i + 1}`);
        return;
      }

      if (
        item.quantity === "" ||
        !Number.isInteger(Number(item.quantity))
      ) {
        setError(
          `Quantity must be a valid integer for item ${i + 1}`
        );
        return;
      }

      if (Number(item.quantity) < 0) {
        setError(
          `Quantity cannot be negative for item ${i + 1}`
        );
        return;
      }
    }

    const payload = {
      items: items.map((item) => ({
        sku: item.sku.trim(),
        quantity: Number(item.quantity),
      })),
    };

    setLoading(true);

    try {
      const res = await fetch(
        `${SERVER_URL}/api/inventory/unified-bulk-inventory-update-starter`,
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
            "Failed to update inventory"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setItems([
      {
        sku: "",
        quantity: "",
      },
    ]);

    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Unified Bulk Inventory Update - Starter Plan</h2>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px auto",
            gap: "12px",
            marginBottom: "15px",
            alignItems: "end",
          }}
        >
          {/* SKU */}
          <div>
            <label>SKU</label>

            <input
              type="text"
              value={item.sku}
              onChange={(e) =>
                handleChange(
                  index,
                  "sku",
                  e.target.value
                )
              }
              placeholder="test_expiry_1"
              style={inputStyle}
            />
          </div>

          {/* Quantity */}
          <div>
            <label>Quantity</label>

            <input
              type="number"
              min="0"
              step="1"
              value={item.quantity}
              onChange={(e) =>
                handleChange(
                  index,
                  "quantity",
                  e.target.value
                )
              }
              placeholder="600"
              style={inputStyle}
            />
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeItem(index)}
            disabled={
              items.length === 1 || loading
            }
            style={buttonStyle}
          >
            Remove
          </button>
        </div>
      ))}

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          type="button"
          onClick={addItem}
          disabled={loading}
          style={buttonStyle}
        >
          + Add Item
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Updating..." : "Update Inventory"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          disabled={loading}
          style={buttonStyle}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#ffe6e6",
            color: "#b00020",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Response */}
      {response && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 20px",
};

export default UnifiedBulkInventoryUpdateStarter;