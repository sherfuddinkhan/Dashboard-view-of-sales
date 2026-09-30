import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CreatePurchaseOrder = () => {
  const [formData, setFormData] = useState({
    vendorId: 100176,
    referenceCode: "TestPo123",
    address: "Mumbai",
    expDeliveryDate: "2022-07-20",
    shippingCost: 0,
    createOrUpdate: "I",
    isCancel: 0,
    docNumber: "12",
    updateTaxRate: 1,
  });

  const [items, setItems] = useState([
    {
      lineItemNumber: "12",
      sku: "A101",
      quantity: "3",
      unitPrice: 5,
      taxRate: "18",
      taxValue: 3.8,
      taxType: 1,
      batch_code: "secfgv453456",
      batch_mrp: "342",
      expiry_date: "2036-01-12",
      serials: ["UK07812", "UK08912", "UK09012"],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);

  // =====================================================
  // Main form change
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
  // Serial number change
  // =====================================================
  const handleSerialChange = (itemIndex, serialIndex, value) => {
    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) {
          return item;
        }

        const updatedSerials = [...item.serials];
        updatedSerials[serialIndex] = value;

        return {
          ...item,
          serials: updatedSerials,
        };
      })
    );
  };

  // =====================================================
  // Add serial
  // =====================================================
  const addSerial = (itemIndex) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              serials: [...item.serials, ""],
            }
          : item
      )
    );
  };

  // =====================================================
  // Remove serial
  // =====================================================
  const removeSerial = (itemIndex, serialIndex) => {
    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) {
          return item;
        }

        return {
          ...item,
          serials: item.serials.filter(
            (_, serialIndexValue) =>
              serialIndexValue !== serialIndex
          ),
        };
      })
    );
  };

  // =====================================================
  // Add item
  // =====================================================
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        lineItemNumber: "",
        sku: "",
        quantity: "",
        unitPrice: 0,
        taxRate: "",
        taxValue: 0,
        taxType: 1,
        batch_code: "",
        batch_mrp: "",
        expiry_date: "",
        serials: [],
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
        vendorId: Number(formData.vendorId),
        referenceCode: formData.referenceCode,
        address: formData.address,
        expDeliveryDate: formData.expDeliveryDate,
        shippingCost: Number(formData.shippingCost),
        createOrUpdate: formData.createOrUpdate,
        isCancel: Number(formData.isCancel),
        docNumber: formData.docNumber,
        updateTaxRate: Number(formData.updateTaxRate),
        items: items.map((item) => ({
          lineItemNumber: item.lineItemNumber,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          taxRate: item.taxRate,
          taxValue: Number(item.taxValue),
          taxType: Number(item.taxType),
          batch_code: item.batch_code,
          batch_mrp: item.batch_mrp,
          expiry_date: item.expiry_date,
          serials: item.serials,
        })),
      };

      const response = await fetch(
        `${SERVER_URL}/api/wms/cart/createPurchaseOrder`,
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
            "Failed to create purchase order"
        );
      }

      setMessage(
        data.message ||
          "Purchase order created successfully"
      );

      setResponseData(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to create purchase order"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Reset
  // =====================================================
  const handleClear = () => {
    setFormData({
      vendorId: "",
      referenceCode: "",
      address: "",
      expDeliveryDate: "",
      shippingCost: 0,
      createOrUpdate: "I",
      isCancel: 0,
      docNumber: "",
      updateTaxRate: 1,
    });

    setItems([
      {
        lineItemNumber: "",
        sku: "",
        quantity: "",
        unitPrice: 0,
        taxRate: "",
        taxValue: 0,
        taxType: 1,
        batch_code: "",
        batch_mrp: "",
        expiry_date: "",
        serials: [],
      },
    ]);

    setMessage("");
    setError("");
    setResponseData(null);
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Create Purchase Order</h2>

      <p>
        <strong>EasyEcom API:</strong>{" "}
        POST /WMS/Cart/CreatePurchaseOrder
      </p>

      <form onSubmit={handleSubmit}>
        {/* =====================================================
            Purchase Order Details
        ===================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div>
            <label>Vendor ID</label>
            <input
              type="number"
              name="vendorId"
              value={formData.vendorId}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label>Reference Code</label>
            <input
              type="text"
              name="referenceCode"
              value={formData.referenceCode}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Expected Delivery Date</label>
            <input
              type="date"
              name="expDeliveryDate"
              value={formData.expDeliveryDate}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Shipping Cost</label>
            <input
              type="number"
              name="shippingCost"
              value={formData.shippingCost}
              onChange={handleChange}
              min="0"
              step="0.01"
              style={inputStyle}
            />
          </div>

          <div>
            <label>Create / Update</label>
            <select
              name="createOrUpdate"
              value={formData.createOrUpdate}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="I">I - Insert</option>
              <option value="U">U - Update</option>
            </select>
          </div>

          <div>
            <label>Is Cancel</label>
            <select
              name="isCancel"
              value={formData.isCancel}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="0">0 - No</option>
              <option value="1">1 - Yes</option>
            </select>
          </div>

          <div>
            <label>Document Number</label>
            <input
              type="text"
              name="docNumber"
              value={formData.docNumber}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Update Tax Rate</label>
            <select
              name="updateTaxRate"
              value={formData.updateTaxRate}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="1">1 - Yes</option>
              <option value="0">0 - No</option>
            </select>
          </div>
        </div>

        {/* =====================================================
            Items
        ===================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3>Purchase Order Items</h3>

          <button
            type="button"
            onClick={addItem}
            style={buttonStyle}
          >
            + Add Item
          </button>
        </div>

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
                  Remove Item
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
              <div>
                <label>Line Item Number</label>
                <input
                  type="text"
                  name="lineItemNumber"
                  value={item.lineItemNumber}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={item.sku}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  min="1"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Unit Price</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  min="0"
                  step="0.01"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Tax Rate</label>
                <input
                  type="text"
                  name="taxRate"
                  value={item.taxRate}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Tax Value</label>
                <input
                  type="number"
                  name="taxValue"
                  value={item.taxValue}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  min="0"
                  step="0.01"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Tax Type</label>
                <input
                  type="number"
                  name="taxType"
                  value={item.taxType}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Batch Code</label>
                <input
                  type="text"
                  name="batch_code"
                  value={item.batch_code}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Batch MRP</label>
                <input
                  type="text"
                  name="batch_mrp"
                  value={item.batch_mrp}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={item.expiry_date}
                  onChange={(e) =>
                    handleItemChange(index, e)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            {/* =================================================
                Serials
            ================================================= */}

            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <strong>Serial Numbers</strong>

                <button
                  type="button"
                  onClick={() => addSerial(index)}
                  style={buttonStyle}
                >
                  + Add Serial
                </button>
              </div>

              {item.serials.map(
                (serial, serialIndex) => (
                  <div
                    key={serialIndex}
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <input
                      type="text"
                      value={serial}
                      onChange={(e) =>
                        handleSerialChange(
                          index,
                          serialIndex,
                          e.target.value
                        )
                      }
                      placeholder={`Serial ${
                        serialIndex + 1
                      }`}
                      style={{
                        ...inputStyle,
                        flex: 1,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeSerial(
                          index,
                          serialIndex
                        )
                      }
                      style={{
                        ...buttonStyle,
                        backgroundColor: "#d32f2f",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        {/* =====================================================
            Actions
        ===================================================== */}

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
              ? "Creating..."
              : "Create Purchase Order"}
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

      {/* =====================================================
          Messages
      ===================================================== */}

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

      {/* =====================================================
          API Response
      ===================================================== */}

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

export default CreatePurchaseOrder;