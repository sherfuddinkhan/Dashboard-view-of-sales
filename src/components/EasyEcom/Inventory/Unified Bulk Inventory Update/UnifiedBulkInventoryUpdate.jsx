import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const UnifiedBulkInventoryUpdate = () => {
  const [vendorId, setVendorId] = useState("26564");

  const [items, setItems] = useState([
    {
      sku: "test_expiry_1",
      quantity: "600",
      shelf: "A001",
      cost: "550",
      batch_code: "8TRY005",
      mrp: "450",
      ean: "23589",
      expiry_date: "2023-07-01",
      mfg_date: "2022-06-01",
      days_to_expire: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleItemChange = (index, field, value) => {
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
        shelf: "",
        cost: "",
        batch_code: "",
        mrp: "",
        ean: "",
        expiry_date: "",
        mfg_date: "",
        days_to_expire: "",
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

    if (!vendorId.trim()) {
      setError("Vendor ID is required");
      return;
    }

    if (!Number.isInteger(Number(vendorId))) {
      setError("Vendor ID must be an integer");
      return;
    }

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

      if (item.shelf === undefined || item.shelf === null) {
        setError(`Shelf is required for item ${i + 1}`);
        return;
      }

      if (
        item.cost === "" ||
        Number.isNaN(Number(item.cost))
      ) {
        setError(`Cost must be valid for item ${i + 1}`);
        return;
      }

      if (
        item.mrp === "" ||
        Number.isNaN(Number(item.mrp))
      ) {
        setError(`MRP must be valid for item ${i + 1}`);
        return;
      }

      if (
        item.ean === "" ||
        !Number.isInteger(Number(item.ean))
      ) {
        setError(`EAN must be a valid integer for item ${i + 1}`);
        return;
      }
    }

    const payload = {
      vendor_id: Number(vendorId),
      items: items.map((item) => ({
        sku: item.sku.trim(),
        quantity: Number(item.quantity),
        shelf: item.shelf.trim(),
        cost: Number(item.cost),
        batch_code: item.batch_code.trim(),
        mrp: Number(item.mrp),
        ean: Number(item.ean),
        expiry_date: item.expiry_date,
        mfg_date: item.mfg_date,
        days_to_expire: item.days_to_expire,
      })),
    };

    setLoading(true);

    try {
      const res = await fetch(
        `${SERVER_URL}/api/inventory/unified-bulk-inventory-update`,
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
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setVendorId("");

    setItems([
      {
        sku: "",
        quantity: "",
        shelf: "",
        cost: "",
        batch_code: "",
        mrp: "",
        ean: "",
        expiry_date: "",
        mfg_date: "",
        days_to_expire: "",
      },
    ]);

    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Unified Bulk Inventory Update</h2>

      {/* Vendor ID */}
      <div style={{ marginBottom: "25px" }}>
        <label>
          <strong>Vendor ID</strong>
        </label>

        <input
          type="number"
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          placeholder="26564"
          style={{
            display: "block",
            width: "300px",
            padding: "10px",
            marginTop: "5px",
          }}
        />
      </div>

      <h3>Inventory Items</h3>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h4>Item {index + 1}</h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {/* SKU */}
            <div>
              <label>SKU</label>
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
                placeholder="test_expiry_1"
                style={inputStyle}
              />
            </div>

            {/* Quantity */}
            <div>
              <label>Quantity</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "quantity",
                    e.target.value
                  )
                }
                placeholder="600"
                style={inputStyle}
              />
            </div>

            {/* Shelf */}
            <div>
              <label>Shelf</label>
              <input
                type="text"
                value={item.shelf}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "shelf",
                    e.target.value
                  )
                }
                placeholder="A001"
                style={inputStyle}
              />
            </div>

            {/* Cost */}
            <div>
              <label>Cost</label>
              <input
                type="number"
                value={item.cost}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "cost",
                    e.target.value
                  )
                }
                placeholder="550"
                style={inputStyle}
              />
            </div>

            {/* Batch Code */}
            <div>
              <label>Batch Code</label>
              <input
                type="text"
                value={item.batch_code}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "batch_code",
                    e.target.value
                  )
                }
                placeholder="8TRY005"
                style={inputStyle}
              />
            </div>

            {/* MRP */}
            <div>
              <label>MRP</label>
              <input
                type="number"
                value={item.mrp}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "mrp",
                    e.target.value
                  )
                }
                placeholder="450"
                style={inputStyle}
              />
            </div>

            {/* EAN */}
            <div>
              <label>EAN</label>
              <input
                type="number"
                value={item.ean}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "ean",
                    e.target.value
                  )
                }
                placeholder="23589"
                style={inputStyle}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label>Expiry Date</label>
              <input
                type="date"
                value={item.expiry_date}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "expiry_date",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            {/* Manufacturing Date */}
            <div>
              <label>MFG Date</label>
              <input
                type="date"
                value={item.mfg_date}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "mfg_date",
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            {/* Days To Expire */}
            <div>
              <label>Days To Expire</label>
              <input
                type="text"
                value={item.days_to_expire}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "days_to_expire",
                    e.target.value
                  )
                }
                placeholder="365"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeItem(index)}
            disabled={
              items.length === 1 || loading
            }
            style={{
              marginTop: "15px",
              padding: "8px 15px",
            }}
          >
            Remove Item
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
          {loading
            ? "Updating..."
            : "Update Inventory"}
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

export default UnifiedBulkInventoryUpdate;