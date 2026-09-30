import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const BulkHoldInventoryUpdate = () => {
  const [holdInventory, setHoldInventory] = useState([
    {
      sku: "testnewsku01",
      hold_qty: 3,
      location_key: "ht10859307264",
    },
    {
      sku: "testkit01",
      hold_qty: 2,
      location_key: "ht10859307264",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);

  // =====================================================
  // Field Change
  // =====================================================
  const handleChange = (index, e) => {
    const { name, value } = e.target;

    setHoldInventory((prev) =>
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
  // Add Row
  // =====================================================
  const addRow = () => {
    setHoldInventory((prev) => [
      ...prev,
      {
        sku: "",
        hold_qty: 0,
        location_key: "",
      },
    ]);
  };

  // =====================================================
  // Remove Row
  // =====================================================
  const removeRow = (index) => {
    setHoldInventory((prev) =>
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
      // Validate
      for (const item of holdInventory) {
        if (!item.sku.trim()) {
          throw new Error("SKU is required for every item");
        }

        if (
          item.hold_qty === "" ||
          Number(item.hold_qty) < 0
        ) {
          throw new Error(
            "Hold quantity must be 0 or greater"
          );
        }

        if (!item.location_key.trim()) {
          throw new Error(
            "Location key is required for every item"
          );
        }
      }

      const payload = {
        hold_inventory: holdInventory.map((item) => ({
          sku: item.sku.trim(),
          hold_qty: Number(item.hold_qty),
          location_key: item.location_key.trim(),
        })),
      };

      const response = await fetch(
        `${SERVER_URL}/api/holdUnHoldInventory`,
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
            "Failed to update hold inventory"
        );
      }

      setMessage(
        data.message ||
          "Hold inventory updated successfully"
      );

      setResponseData(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to update hold inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Clear
  // =====================================================
  const handleClear = () => {
    setHoldInventory([
      {
        sku: "",
        hold_qty: 0,
        location_key: "",
      },
    ]);

    setMessage("");
    setError("");
    setResponseData(null);
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
      <h2>Bulk Hold Inventory Update</h2>

      <p>
        <strong>EasyEcom API:</strong>{" "}
        POST /holdUnHoldInventory
      </p>

      <form onSubmit={handleSubmit}>
        {/* =================================================
            Hold Inventory Items
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3>Hold Inventory</h3>

          <button
            type="button"
            onClick={addRow}
            style={buttonStyle}
          >
            + Add Item
          </button>
        </div>

        {holdInventory.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "15px",
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

              {holdInventory.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
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
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
              }}
            >
              {/* SKU */}

              <div>
                <label>
                  <strong>SKU *</strong>
                </label>

                <input
                  type="text"
                  name="sku"
                  value={item.sku}
                  onChange={(e) =>
                    handleChange(index, e)
                  }
                  required
                  style={inputStyle}
                />
              </div>

              {/* Hold Quantity */}

              <div>
                <label>
                  <strong>Hold Quantity *</strong>
                </label>

                <input
                  type="number"
                  name="hold_qty"
                  value={item.hold_qty}
                  onChange={(e) =>
                    handleChange(index, e)
                  }
                  min="0"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Location Key */}

              <div>
                <label>
                  <strong>Location Key *</strong>
                </label>

                <input
                  type="text"
                  name="location_key"
                  value={item.location_key}
                  onChange={(e) =>
                    handleChange(index, e)
                  }
                  required
                  style={inputStyle}
                />
              </div>
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
            {loading
              ? "Updating..."
              : "Update Hold Inventory"}
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
          API Response
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

export default BulkHoldInventoryUpdate;