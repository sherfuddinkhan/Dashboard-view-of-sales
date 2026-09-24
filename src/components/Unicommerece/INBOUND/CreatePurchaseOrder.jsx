import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const CreatePurchaseOrder = () => {
  const [form, setForm] = useState({
    purchaseOrderCode: "",
    vendorCode: "",
    vendorAgreementName: "",
    currencyCode: "INR",
    expiryDate: "",
    deliveryDate: "",
    logisticChargesDivisionMethod: "",
    logisticCharges: 0,
  });

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

  const [warnings, setWarnings] = useState([]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const discount = Number(item.discount || 0);

      return (
        total +
        quantity * unitPrice -
        discount
      );
    }, 0);
  }, [items]);

  const logisticCharges = Number(
    form.logisticCharges || 0
  );

  const grandTotal = subtotal + logisticCharges;

  // ---------------------------------------------------------
  // Form handlers
  // ---------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // Item handlers
  // ---------------------------------------------------------

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
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
    setItems((current) => [
      ...current,
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

    setItems((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // ---------------------------------------------------------
  // Custom fields
  // ---------------------------------------------------------

  const addCustomField = () => {
    setCustomFields((current) => [
      ...current,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const updateCustomField = (
    index,
    field,
    value
  ) => {
    setCustomFields((current) =>
      current.map((item, itemIndex) =>
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
    setCustomFields((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------

  const validate = () => {
    if (!form.vendorCode.trim()) {
      return "Vendor code is required.";
    }

    if (!items.length) {
      return "At least one purchase order item is required.";
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.itemSKU.trim()) {
        return `Item ${i + 1}: SKU is required.`;
      }

      if (Number(item.quantity) <= 0) {
        return `Item ${i + 1}: Quantity must be greater than 0.`;
      }

      if (Number(item.unitPrice) < 0) {
        return `Item ${i + 1}: Unit price cannot be negative.`;
      }
    }

    return null;
  };

  // ---------------------------------------------------------
  // Create PO
  // ---------------------------------------------------------

  const createPurchaseOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);
      setWarnings([]);

      const validationError = validate();

      if (validationError) {
        setError(validationError);
        return;
      }

      const payload = {
        purchaseOrderCode:
          form.purchaseOrderCode.trim() || undefined,

        type: "MANUAL",

        vendorCode: form.vendorCode.trim(),

        vendorAgreementName:
          form.vendorAgreementName.trim() ||
          undefined,

        currencyCode:
          form.currencyCode.trim() || "INR",

        expiryDate:
          form.expiryDate || undefined,

        deliveryDate:
          form.deliveryDate || undefined,

        logisticChargesDivisionMethod:
          form.logisticChargesDivisionMethod ||
          undefined,

        logisticCharges:
          Number(form.logisticCharges || 0),

        purchaseOrderItems: items.map((item) => ({
          itemSKU: item.itemSKU.trim(),

          quantity: Number(item.quantity),

          unitPrice: Number(item.unitPrice),

          maxRetailPrice:
            Number(item.maxRetailPrice || 0),

          discount:
            Number(item.discount || 0),

          discountPercentage:
            Number(item.discountPercentage || 0),

          taxTypeCode:
            item.taxTypeCode.trim() ||
            undefined,
        })),

        customFieldValues: customFields
          .filter(
            (field) =>
              field.name &&
              field.name.trim()
          )
          .map((field) => ({
            name: field.name.trim(),
            value: field.value || "",
          })),
      };

      console.log(
        "Create Purchase Order Payload:",
        payload
      );

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders`,
        payload
      );

      const data = result.data;

      if (data.successful === false) {
        setError(
          data.message ||
            "Purchase order creation failed."
        );

        setWarnings(
          Array.isArray(data.warnings)
            ? data.warnings
            : []
        );

        return;
      }

      setResponse(data);

      setWarnings(
        Array.isArray(data.warnings)
          ? data.warnings
          : []
      );
    } catch (err) {
      console.error(
        "Create Purchase Order Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create purchase order."
      );

      setWarnings(
        err.response?.data?.warnings || []
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Reset
  // ---------------------------------------------------------

  const resetForm = () => {
    setForm({
      purchaseOrderCode: "",
      vendorCode: "",
      vendorAgreementName: "",
      currencyCode: "INR",
      expiryDate: "",
      deliveryDate: "",
      logisticChargesDivisionMethod: "",
      logisticCharges: 0,
    });

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

    setError("");
    setResponse(null);
    setWarnings([]);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}

        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              Create Purchase Order
            </h2>

            <div style={styles.subtitle}>
              Uniware Purchase Order
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={resetForm}
              style={styles.secondaryButton}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={createPurchaseOrder}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? "Creating..."
                : "Create Purchase Order"}
            </button>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Success */}

        {response && (
          <div style={styles.success}>
            <div>
              <strong>
                Purchase order created successfully.
              </strong>
            </div>

            <div style={{ marginTop: 5 }}>
              Vendor:{" "}
              {response.vendorName || "N/A"}
            </div>

            <div>
              Purchase Order Code:{" "}
              {response.purchaseOrderCode || "N/A"}
            </div>

            {response.message && (
              <div>{response.message}</div>
            )}
          </div>
        )}

        {/* Warnings */}

        {warnings.length > 0 && (
          <div style={styles.warning}>
            <strong>Warnings</strong>

            {warnings.map((warning, index) => (
              <div key={index}>
                {warning.message ||
                  warning.description ||
                  "Warning"}
              </div>
            ))}
          </div>
        )}

        {/* Basic Information */}

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>
            Purchase Order Information
          </h3>

          <div style={styles.grid}>
            <Input
              label="Purchase Order Code"
              name="purchaseOrderCode"
              value={form.purchaseOrderCode}
              onChange={handleChange}
              placeholder="Optional"
            />

            <Input
              label="Vendor Code *"
              name="vendorCode"
              value={form.vendorCode}
              onChange={handleChange}
              placeholder="Enter vendor code"
            />

            <Input
              label="Vendor Agreement Name"
              name="vendorAgreementName"
              value={form.vendorAgreementName}
              onChange={handleChange}
              placeholder="Optional"
            />

            <div>
              <label style={styles.label}>
                Type
              </label>

              <input
                value="MANUAL"
                disabled
                style={{
                  ...styles.input,
                  background: "#f5f5f5",
                }}
              />
            </div>

            <div>
              <label style={styles.label}>
                Currency
              </label>

              <select
                name="currencyCode"
                value={form.currencyCode}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>
                Expiry Date
              </label>

              <input
                type="datetime-local"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Delivery Date
              </label>

              <input
                type="datetime-local"
                name="deliveryDate"
                value={form.deliveryDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Logistic Charges Division
              </label>

              <select
                name="logisticChargesDivisionMethod"
                value={
                  form.logisticChargesDivisionMethod
                }
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">
                  Select
                </option>
                <option value="EQUALLY">
                  Equally
                </option>
                <option value="BY_QUANTITY">
                  By Quantity
                </option>
                <option value="BY_VALUE">
                  By Value
                </option>
              </select>
            </div>

            <Input
              label="Logistic Charges"
              type="number"
              name="logisticCharges"
              value={form.logisticCharges}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Items */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              Purchase Order Items
            </h3>

            <button
              type="button"
              onClick={addItem}
              style={styles.addButton}
            >
              + Add Item
            </button>
          </div>

          <div style={styles.itemsContainer}>
            {items.map((item, index) => (
              <div
                key={index}
                style={styles.itemCard}
              >
                <div style={styles.itemHeader}>
                  <strong>
                    Item #{index + 1}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>

                <div style={styles.grid}>
                  <Input
                    label="Item SKU *"
                    value={item.itemSKU}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "itemSKU",
                        e.target.value
                      )
                    }
                    placeholder="SKU"
                  />

                  <Input
                    label="Quantity *"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    label="Unit Price *"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "unitPrice",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    label="Max Retail Price"
                    type="number"
                    value={item.maxRetailPrice}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "maxRetailPrice",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    label="Discount Amount"
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "discount",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    label="Discount %"
                    type="number"
                    value={item.discountPercentage}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "discountPercentage",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    label="Tax Type Code"
                    value={item.taxTypeCode}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "taxTypeCode",
                        e.target.value
                      )
                    }
                    placeholder="Example: GST_18"
                  />
                </div>

                <div style={styles.itemTotal}>
                  Item Total:{" "}
                  <strong>
                    ₹
                    {(
                      Number(item.quantity || 0) *
                        Number(item.unitPrice || 0) -
                      Number(item.discount || 0)
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Custom fields */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              Custom Fields
            </h3>

            <button
              type="button"
              onClick={addCustomField}
              style={styles.addButton}
            >
              + Add Custom Field
            </button>
          </div>

          {customFields.length === 0 ? (
            <div style={styles.empty}>
              No custom fields added.
            </div>
          ) : (
            customFields.map((field, index) => (
              <div
                key={index}
                style={styles.customFieldRow}
              >
                <Input
                  label="Name"
                  value={field.name}
                  onChange={(e) =>
                    updateCustomField(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Value"
                  value={field.value}
                  onChange={(e) =>
                    updateCustomField(
                      index,
                      "value",
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    removeCustomField(index)
                  }
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </section>

        {/* Summary */}

        <section style={styles.summary}>
          <div>
            <span>Items:</span>

            <strong>
              {items.length}
            </strong>
          </div>

          <div>
            <span>Subtotal:</span>

            <strong>
              ₹
              {subtotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>

          <div>
            <span>Logistic Charges:</span>

            <strong>
              ₹
              {logisticCharges.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div style={styles.grandTotal}>
            <span>Grand Total:</span>

            <strong>
              ₹
              {grandTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>
        </section>

        {/* Bottom Action */}

        <div style={styles.bottomActions}>
          <button
            type="button"
            onClick={resetForm}
            style={styles.secondaryButton}
          >
            Cancel / Reset
          </button>

          <button
            type="button"
            onClick={createPurchaseOrder}
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading
              ? "Creating Purchase Order..."
              : "Create Purchase Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Reusable Input
|--------------------------------------------------------------------------
*/

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>
      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    padding: "24px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    background: "#fff",
    borderRadius: "10px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    borderBottom: "1px solid #eee",
    paddingBottom: "18px",
  },

  title: {
    margin: 0,
    fontSize: "26px",
  },

  subtitle: {
    color: "#777",
    marginTop: "5px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
  },

  section: {
    border: "1px solid #e2e2e2",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 11px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
  },

  itemCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "18px",
    marginBottom: "15px",
    background: "#fafafa",
  },

  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  itemTotal: {
    marginTop: "15px",
    textAlign: "right",
    fontSize: "14px",
  },

  customFieldRow: {
    display: "grid",
    gridTemplateColumns:
      "minmax(200px, 1fr) minmax(200px, 1fr) auto",
    gap: "12px",
    alignItems: "end",
    marginBottom: "12px",
  },

  summary: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "30px",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "20px",
    background: "#f7f8fa",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  grandTotal: {
    fontSize: "18px",
    paddingLeft: "20px",
    borderLeft: "1px solid #ccc",
  },

  primaryButton: {
    border: "none",
    borderRadius: "5px",
    padding: "10px 18px",
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  secondaryButton: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px 18px",
    background: "#fff",
    cursor: "pointer",
  },

  addButton: {
    border: "none",
    borderRadius: "5px",
    padding: "8px 14px",
    background: "#2e7d32",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  removeButton: {
    border: "none",
    borderRadius: "5px",
    padding: "7px 12px",
    background: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
  },

  bottomActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  error: {
    padding: "13px",
    marginBottom: "18px",
    borderRadius: "6px",
    background: "#ffebee",
    color: "#c62828",
  },

  success: {
    padding: "13px",
    marginBottom: "18px",
    borderRadius: "6px",
    background: "#e8f5e9",
    color: "#2e7d32",
  },

  warning: {
    padding: "13px",
    marginBottom: "18px",
    borderRadius: "6px",
    background: "#fff8e1",
    color: "#8d6e00",
  },

  empty: {
    padding: "20px",
    textAlign: "center",
    color: "#777",
    background: "#fafafa",
    borderRadius: "6px",
  },
};

export default CreatePurchaseOrder;