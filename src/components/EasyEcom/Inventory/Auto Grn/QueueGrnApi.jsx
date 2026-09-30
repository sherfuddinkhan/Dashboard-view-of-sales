import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const QueueGrnApi = () => {
  const [vendorId, setVendorId] = useState("26564");

  const [items, setItems] = useState([
    {
      sku: "test_expiry_1",
      quantity: 600,
      shelf: "A001",
      cost: 550,
      batch_code: "8TRY005",
      mrp: 450,
      ean: 23589,
      expiry_date: "2023-07-01",
      mfg_date: "2022-06-01",
      days_to_expire: "",
    },
    {
      sku: "test_expiry_3",
      quantity: 600,
      shelf: "A001",
      cost: 550,
      batch_code: "8TRY005",
      mrp: 450,
      ean: 23589,
      expiry_date: "",
      mfg_date: "2022-06-01",
      days_to_expire: "365",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);

  // =====================================================
  // Item field change
  // =====================================================
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;

    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [name]: value,
            }
          : item
      )
    );
  };

  // =====================================================
  // Add item
  // =====================================================
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        sku: "",
        quantity: 0,
        shelf: "",
        cost: 0,
        batch_code: "",
        mrp: 0,
        ean: "",
        expiry_date: "",
        mfg_date: "",
        days_to_expire: "",
      },
    ]);
  };

  // =====================================================
  // Remove item
  // =====================================================
  const removeItem = (index) => {
    setItems((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // =====================================================
  // Submit
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");
    setResponseData(null);

    try {
      const payload = {
        vendor_id: Number(vendorId),

        items: items.map((item) => ({
          sku: item.sku,
          quantity: Number(item.quantity),
          shelf: item.shelf,
          cost: Number(item.cost),
          batch_code: item.batch_code,
          mrp: Number(item.mrp),
          ean: item.ean === "" ? "" : Number(item.ean),
          expiry_date: item.expiry_date,
          mfg_date: item.mfg_date,
          days_to_expire: item.days_to_expire,
        })),
      };

      const response = await fetch(
        `${SERVER_URL}/api/wms/QueueGrnApi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to queue GRN"
        );
      }

      setMessage(
        data.message || "GRN queued successfully"
      );

      setResponseData(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to queue GRN"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Clear
  // =====================================================
  const handleClear = () => {
    setVendorId("");

    setItems([
      {
        sku: "",
        quantity: 0,
        shelf: "",
        cost: 0,
        batch_code: "",
        mrp: 0,
        ean: "",
        expiry_date: "",
        mfg_date: "",
        days_to_expire: "",
      },
    ]);

    setMessage("");
    setError("");
    setResponseData(null);
  };

  return (
    <div
      style={{
        maxWidth: "1150px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Queue GRN API</h2>

      <p>
        <strong>EasyEcom API:</strong>{" "}
        POST /wms/QueueGrnApi
      </p>

      <form onSubmit={handleSubmit}>
        {/* =================================================
            Vendor
        ================================================= */}

        <div
          style={{
            maxWidth: "350px",
            marginBottom: "30px",
          }}
        >
          <label>
            <strong>Vendor ID *</strong>
          </label>

          <input
            type="number"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* =================================================
            Items Header
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3>GRN Items</h3>

          <button
            type="button"
            onClick={addItem}
            style={buttonStyle}
          >
            + Add Item
          </button>
        </div>

        {/* =================================================
            Items
        ================================================= */}

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h4>Item {index + 1}</h4>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#d32f2f",
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
              }}
            >
              <InputField
                label="SKU"
                name="sku"
                value={item.sku}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
                required
              />

              <InputField
                label="Quantity"
                name="quantity"
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
                min="0"
                required
              />

              <InputField
                label="Shelf"
                name="shelf"
                value={item.shelf}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />

              <InputField
                label="Cost"
                name="cost"
                type="number"
                value={item.cost}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
                min="0"
                step="0.01"
              />

              <InputField
                label="Batch Code"
                name="batch_code"
                value={item.batch_code}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />

              <InputField
                label="MRP"
                name="mrp"
                type="number"
                value={item.mrp}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
                min="0"
                step="0.01"
              />

              <InputField
                label="EAN"
                name="ean"
                type="number"
                value={item.ean}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />

              <InputField
                label="Expiry Date"
                name="expiry_date"
                type="date"
                value={item.expiry_date}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />

              <InputField
                label="Manufacturing Date"
                name="mfg_date"
                type="date"
                value={item.mfg_date}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />

              <InputField
                label="Days to Expire"
                name="days_to_expire"
                type="text"
                value={item.days_to_expire}
                onChange={(e) =>
                  handleItemChange(index, e)
                }
              />
            </div>
          </div>
        ))}

        {/* =================================================
            Actions
        ================================================= */}

        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              marginRight: "10px",
            }}
          >
            {loading ? "Queuing..." : "Queue GRN"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: "#757575",
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* =================================================
          Success
      ================================================= */}

      {message && (
        <div
          style={{
            padding: "12px",
            marginTop: "20px",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "4px",
          }}
        >
          {message}
        </div>
      )}

      {/* =================================================
          Error
      ================================================= */}

      {error && (
        <div
          style={{
            padding: "12px",
            marginTop: "20px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {/* =================================================
          Response
      ================================================= */}

      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>API Response</h3>

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
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// =====================================================
// Reusable Input
// =====================================================

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  min,
  step,
}) => {
  return (
    <div>
      <label>
        {label}
        {required && " *"}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        style={inputStyle}
      />
    </div>
  );
};

// =====================================================
// Styles
// =====================================================

const inputStyle = {
  width: "100%",
  padding: "9px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#1976d2",
  color: "#fff",
  cursor: "pointer",
};

export default QueueGrnApi;