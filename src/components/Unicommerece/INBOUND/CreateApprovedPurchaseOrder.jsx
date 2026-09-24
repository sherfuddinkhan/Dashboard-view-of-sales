import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const CreateApprovedPurchaseOrder = () => {
  const [facility, setFacility] = useState("");
  const [purchaseOrderCode, setPurchaseOrderCode] = useState("");
  const [userId, setUserId] = useState("");

  const [vendorCode, setVendorCode] = useState("");
  const [vendorAgreementName, setVendorAgreementName] =
    useState("");

  const [currencyCode, setCurrencyCode] = useState("INR");

  const [expiryDate, setExpiryDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const [
    logisticChargesDivisionMethod,
    setLogisticChargesDivisionMethod,
  ] = useState("");

  const [logisticCharges, setLogisticCharges] = useState("0");

  const [items, setItems] = useState([
    {
      itemSKU: "",
      quantity: 1,
      unitPrice: 0,
      maxRetailPrice: 0,
      discount: 0,
      discountPercentage: 0,
      taxTypeCode: "",
    },
  ]);

  const [customFields, setCustomFields] = useState([]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  // ==========================================================
  // Items
  // ==========================================================

  const handleItemChange = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      {
        itemSKU: "",
        quantity: 1,
        unitPrice: 0,
        maxRetailPrice: 0,
        discount: 0,
        discountPercentage: 0,
        taxTypeCode: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // ==========================================================
  // Custom fields
  // ==========================================================

  const addCustomField = () => {
    setCustomFields((previous) => [
      ...previous,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const handleCustomFieldChange = (
    index,
    field,
    value
  ) => {
    setCustomFields((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeCustomField = (index) => {
    setCustomFields((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // ==========================================================
  // Submit
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!facility.trim()) {
      setError("Facility code is required.");
      return;
    }

    if (!vendorCode.trim()) {
      setError("Vendor code is required.");
      return;
    }

    if (!items.length) {
      setError("At least one purchase order item is required.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].itemSKU.trim()) {
        setError(
          `Item ${i + 1}: SKU is required.`
        );
        return;
      }

      if (Number(items[i].quantity) <= 0) {
        setError(
          `Item ${i + 1}: Quantity must be greater than zero.`
        );
        return;
      }

      if (Number(items[i].unitPrice) < 0) {
        setError(
          `Item ${i + 1}: Unit price cannot be negative.`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        facility: facility.trim(),

        purchaseOrderCode:
          purchaseOrderCode.trim() || undefined,

        userId: userId.trim() || undefined,

        vendorCode: vendorCode.trim(),

        vendorAgreementName:
          vendorAgreementName.trim() || undefined,

        currencyCode:
          currencyCode.trim() || "INR",

        expiryDate: expiryDate || undefined,

        deliveryDate: deliveryDate || undefined,

        logisticChargesDivisionMethod:
          logisticChargesDivisionMethod.trim() || undefined,

        logisticCharges:
          Number(logisticCharges) || 0,

        purchaseOrderItems: items.map((item) => ({
          itemSKU: item.itemSKU.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          maxRetailPrice:
            Number(item.maxRetailPrice) || 0,
          discount:
            Number(item.discount) || 0,
          discountPercentage:
            Number(item.discountPercentage) || 0,
          taxTypeCode:
            item.taxTypeCode.trim() || undefined,
        })),

        customFieldValues:
          customFields.length > 0
            ? customFields.map((field) => ({
                name: field.name.trim(),
                value: field.value,
              }))
            : undefined,
      };

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders/create-approved`,
        payload
      );

      setResponse(result.data);

      if (!result.data.successful) {
        setError(
          result.data.message ||
            "Purchase order creation failed."
        );
      }
    } catch (err) {
      console.error(
        "Create Approved PO Error:",
        err
      );

      const apiError = err.response?.data;

      setResponse(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to create and approve purchase order."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Clear
  // ==========================================================

  const handleClear = () => {
    setFacility("");
    setPurchaseOrderCode("");
    setUserId("");
    setVendorCode("");
    setVendorAgreementName("");
    setCurrencyCode("INR");
    setExpiryDate("");
    setDeliveryDate("");
    setLogisticChargesDivisionMethod("");
    setLogisticCharges("0");

    setItems([
      {
        itemSKU: "",
        quantity: 1,
        unitPrice: 0,
        maxRetailPrice: 0,
        discount: 0,
        discountPercentage: 0,
        taxTypeCode: "",
      },
    ]);

    setCustomFields([]);

    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "25px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h2>Create & Approve Purchase Order</h2>

      <p style={{ color: "#666" }}>
        Creates the purchase order directly in Approved
        status in Uniware.
      </p>

      <form onSubmit={handleSubmit}>
        {/* ================================================= */}
        {/* Basic Information */}
        {/* ================================================= */}

        <h3>Basic Information</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "15px",
          }}
        >
          <Input
            label="Facility Code *"
            value={facility}
            onChange={setFacility}
            placeholder="MAIN"
          />

          <Input
            label="Purchase Order Code"
            value={purchaseOrderCode}
            onChange={setPurchaseOrderCode}
            placeholder="Optional"
          />

          <Input
            label="User ID"
            value={userId}
            onChange={setUserId}
            placeholder="Optional"
          />

          <Input
            label="Vendor Code *"
            value={vendorCode}
            onChange={setVendorCode}
            placeholder="VENDOR001"
          />

          <Input
            label="Vendor Agreement"
            value={vendorAgreementName}
            onChange={setVendorAgreementName}
            placeholder="Optional"
          />

          <Input
            label="Currency"
            value={currencyCode}
            onChange={setCurrencyCode}
            placeholder="INR"
          />

          <Input
            label="Expiry Date"
            type="datetime-local"
            value={expiryDate}
            onChange={setExpiryDate}
          />

          <Input
            label="Delivery Date"
            type="datetime-local"
            value={deliveryDate}
            onChange={setDeliveryDate}
          />

          <Input
            label="Logistic Division Method"
            value={logisticChargesDivisionMethod}
            onChange={setLogisticChargesDivisionMethod}
            placeholder="Optional"
          />

          <Input
            label="Logistic Charges"
            type="number"
            value={logisticCharges}
            onChange={setLogisticCharges}
          />
        </div>

        {/* ================================================= */}
        {/* Purchase Order Items */}
        {/* ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "30px",
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
              padding: "15px",
              marginBottom: "15px",
              background: "#fafafa",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, 1fr)",
                gap: "12px",
              }}
            >
              <Input
                label="Item SKU *"
                value={item.itemSKU}
                onChange={(value) =>
                  handleItemChange(
                    index,
                    "itemSKU",
                    value
                  )
                }
              />

              <Input
                label="Quantity *"
                type="number"
                value={item.quantity}
                onChange={(value) =>
                  handleItemChange(
                    index,
                    "quantity",
                    value
                  )
                }
              />

              <Input
                label="Unit Price *"
                type="number"
                value={item.unitPrice}
                onChange={(value) =>
                  handleItemChange(
                    index,
                    "unitPrice",
                    value
                  )
                }
              />

              <Input
                label="Max Retail Price"
                type="number"
                value={item.maxRetailPrice}
                onChange={(value) =>
                  handleItemChange(
                    index,
                    "maxRetailPrice",
                    value
                  )
                }
              />

              <Input
                label="Discount"
                type="number"
                value={item.discount}
                onChange={(value) =>
                  handleItemChange(
                    index,
                    "discount",
                    value
                  )
                }
              />

              <Input
                label="Discount %"
                type="number"
                value={item.discountPercentage}
                onChange={(value) =>
                  handleItemChange(
                    index,
                    "discountPercentage",
                    value
                  )
                }
              />

              <Input
                label="Tax Type Code"
                value={item.taxTypeCode}
                onChange={(value) =>
                  handleItemChange(
                    index,
                    "taxTypeCode",
                    value
                  )
                }
                placeholder="GST_18"
              />
            </div>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{
                  ...dangerButtonStyle,
                  marginTop: "12px",
                }}
              >
                Remove Item
              </button>
            )}
          </div>
        ))}

        {/* ================================================= */}
        {/* Custom Fields */}
        {/* ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "30px",
          }}
        >
          <h3>Custom Fields</h3>

          <button
            type="button"
            onClick={addCustomField}
            style={buttonStyle}
          >
            + Add Custom Field
          </button>
        </div>

        {customFields.map((field, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr auto",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Input
              label="Name"
              value={field.name}
              onChange={(value) =>
                handleCustomFieldChange(
                  index,
                  "name",
                  value
                )
              }
            />

            <Input
              label="Value"
              value={field.value}
              onChange={(value) =>
                handleCustomFieldChange(
                  index,
                  "value",
                  value
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                removeCustomField(index)
              }
              style={dangerButtonStyle}
            >
              Remove
            </button>
          </div>
        ))}

        {/* ================================================= */}
        {/* Error */}
        {/* ================================================= */}

        {error && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#ffebee",
              color: "#c62828",
              border: "1px solid #ef9a9a",
              borderRadius: "6px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* ================================================= */}
        {/* Actions */}
        {/* ================================================= */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "25px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Creating & Approving..."
              : "Create & Approve PO"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={secondaryButtonStyle}
          >
            Clear
          </button>
        </div>
      </form>

      {/* ================================================= */}
      {/* Response */}
      {/* ================================================= */}

      {response && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            borderRadius: "8px",
            background: response.successful
              ? "#e8f5e9"
              : "#ffebee",
            border: response.successful
              ? "1px solid #a5d6a7"
              : "1px solid #ef9a9a",
          }}
        >
          <h3>
            {response.successful
              ? "Purchase Order Approved"
              : "Purchase Order Failed"}
          </h3>

          <p>
            <strong>Message:</strong>{" "}
            {response.message || "No message"}
          </p>

          {response.purchaseOrderCode && (
            <p>
              <strong>Approved PO Code:</strong>{" "}
              {response.purchaseOrderCode}
            </p>
          )}

          {response.errors?.length > 0 && (
            <div>
              <strong>Errors</strong>

              <ul>
                {response.errors.map(
                  (item, index) => (
                    <li key={index}>
                      {item.message ||
                        item.description ||
                        "Unknown error"}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {response.warnings?.length > 0 && (
            <div>
              <strong>Warnings</strong>

              <ul>
                {response.warnings.map(
                  (item, index) => (
                    <li key={index}>
                      {item.message ||
                        item.description ||
                        "Unknown warning"}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Reusable Input
// ============================================================

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontWeight: 600,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px",
          boxSizing: "border-box",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
    </div>
  );
};

const buttonStyle = {
  padding: "11px 20px",
  border: "none",
  borderRadius: "6px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  padding: "11px 20px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
};

const dangerButtonStyle = {
  padding: "9px 15px",
  border: "none",
  borderRadius: "5px",
  background: "#d32f2f",
  color: "#fff",
  cursor: "pointer",
};

export default CreateApprovedPurchaseOrder;