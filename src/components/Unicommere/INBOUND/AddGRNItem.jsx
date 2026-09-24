import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const AddGRNItem = () => {
  const [facility, setFacility] = useState("");
  const [inflowReceiptCode, setInflowReceiptCode] =
    useState("");
  const [itemCode, setItemCode] = useState("");
  const [manufacturingDate, setManufacturingDate] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  // ------------------------------------------
  // Submit
  // ------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!facility.trim()) {
      setError("Please enter Facility Code.");
      return;
    }

    if (!inflowReceiptCode.trim()) {
      setError(
        "Please enter Inflow Receipt / GRN Code."
      );
      return;
    }

    if (!itemCode.trim()) {
      setError("Please enter Item Code.");
      return;
    }

    // Uniware itemCode pattern
    const itemCodePattern =
      /^[a-zA-Z0-9_-]+$/;

    if (!itemCodePattern.test(itemCode.trim())) {
      setError(
        "Invalid Item Code. Only letters, numbers, hyphen and underscore are allowed."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        facility: facility.trim(),

        inflowReceiptCode:
          inflowReceiptCode.trim(),

        itemCode: itemCode.trim(),
      };

      // Manufacturing date is optional
      if (manufacturingDate) {
        payload.manufacturingDate =
          manufacturingDate;
      }

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders/grn/add-item`,
        payload
      );

      const data = result.data;

      setResponse(data);

      if (!data.successful) {
        setError(
          data.message ||
            "Uniware could not add the item to the GRN."
        );
      }
    } catch (err) {
      console.error(err);

      const apiData = err.response?.data;

      setError(
        apiData?.message ||
          err.message ||
          "Failed to add item to GRN."
      );

      setResponse(apiData || null);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // Clear
  // ------------------------------------------
  const handleClear = () => {
    setFacility("");
    setInflowReceiptCode("");
    setItemCode("");
    setManufacturingDate("");
    setError("");
    setResponse(null);
  };

  const item = response?.inflowReceiptItemDTO;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Add Item in GRN
          </h1>

          <p style={styles.subtitle}>
            Add an item to an existing Uniware Goods
            Receipt Note.
          </p>
        </div>

        {/* Form */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>

            <div style={styles.sectionHeader}>
              GRN Item Details
            </div>

            <div style={styles.formGrid}>

              {/* Facility */}
              <div>
                <label style={styles.label}>
                  Facility Code *
                </label>

                <input
                  type="text"
                  value={facility}
                  onChange={(e) =>
                    setFacility(e.target.value)
                  }
                  placeholder="Example: MAIN"
                  style={styles.input}
                />
              </div>

              {/* GRN Code */}
              <div>
                <label style={styles.label}>
                  Inflow Receipt / GRN Code *
                </label>

                <input
                  type="text"
                  value={inflowReceiptCode}
                  onChange={(e) =>
                    setInflowReceiptCode(
                      e.target.value
                    )
                  }
                  placeholder="Example: IR-000123"
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  Enter the GRN code returned by
                  Create GRN.
                </div>
              </div>

              {/* Item Code */}
              <div>
                <label style={styles.label}>
                  Item Code *
                </label>

                <input
                  type="text"
                  value={itemCode}
                  onChange={(e) =>
                    setItemCode(e.target.value)
                  }
                  placeholder="Example: ITEM-001"
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  Only letters, numbers, hyphen and
                  underscore are allowed.
                </div>
              </div>

              {/* Manufacturing Date */}
              <div>
                <label style={styles.label}>
                  Manufacturing Date
                </label>

                <input
                  type="datetime-local"
                  value={manufacturingDate}
                  onChange={(e) =>
                    setManufacturingDate(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  Optional. Sent to Uniware in UTC
                  format.
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.primaryButton,
                  ...(loading
                    ? styles.disabledButton
                    : {}),
                }}
              >
                {loading
                  ? "Adding Item..."
                  : "Add Item to GRN"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                style={styles.secondaryButton}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <div style={styles.errorTitle}>
              Error
            </div>

            <div>{error}</div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div>

            {/* Message */}
            <div
              style={{
                ...styles.messageBox,
                ...(response.successful
                  ? styles.successBox
                  : styles.errorMessageBox),
              }}
            >
              <div style={styles.responseTitle}>
                {response.successful
                  ? "Item Added Successfully"
                  : "Add Item Failed"}
              </div>

              {response.message && (
                <div style={{ marginTop: 6 }}>
                  {response.message}
                </div>
              )}
            </div>

            {/* Item Information */}
            {item && (
              <div style={styles.card}>

                <div style={styles.sectionHeader}>
                  GRN Item Information
                </div>

                <div style={styles.detailsGrid}>

                  <Detail
                    label="GRN Item ID"
                    value={item.id}
                  />

                  <Detail
                    label="Purchase Order Item ID"
                    value={item.purchaseOrderItemId}
                  />

                  <Detail
                    label="Item SKU"
                    value={item.itemSKU}
                  />

                  <Detail
                    label="Item Type"
                    value={item.itemTypeName}
                  />

                  <Detail
                    label="Vendor SKU"
                    value={item.vendorSkuCode}
                  />

                  <Detail
                    label="Quantity"
                    value={item.quantity}
                  />

                  <Detail
                    label="Pending Quantity"
                    value={item.pendingQuantity}
                  />

                  <Detail
                    label="Rejected Quantity"
                    value={item.rejectedQuantity}
                  />

                  <Detail
                    label="Detailed Quantity"
                    value={item.detailedQuantity}
                  />

                  <Detail
                    label="Items Labelled"
                    value={
                      item.itemsLabelled
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Detail
                    label="Status"
                    value={item.status}
                  />

                  <Detail
                    label="Unit Price"
                    value={formatCurrency(
                      item.unitPrice
                    )}
                  />

                  <Detail
                    label="MRP"
                    value={formatCurrency(
                      item.maxRetailPrice
                    )}
                  />

                  <Detail
                    label="Additional Cost"
                    value={formatCurrency(
                      item.additionalCost
                    )}
                  />

                  <Detail
                    label="Discount"
                    value={formatCurrency(
                      item.discount
                    )}
                  />

                  <Detail
                    label="Discount %"
                    value={
                      item.discountPercentage !==
                      null &&
                      item.discountPercentage !==
                        undefined
                        ? `${item.discountPercentage}%`
                        : "N/A"
                    }
                  />

                  <Detail
                    label="Batch Code"
                    value={item.batchCode}
                  />

                  <Detail
                    label="Manufacturing Date"
                    value={formatDate(
                      item.manufacturingDate
                    )}
                  />

                  <Detail
                    label="Expiry"
                    value={formatDate(
                      item.expiry
                    )}
                  />

                  <Detail
                    label="Expirable"
                    value={
                      item.expirable
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Detail
                    label="Shelf Life"
                    value={item.shelfLife}
                  />

                  <Detail
                    label="GRN Expiry Tolerance"
                    value={
                      item.grnExpiryTolerance
                    }
                  />

                  <Detail
                    label="Rejection Comments"
                    value={
                      item.rejectionComments
                    }
                  />
                </div>
              </div>
            )}

            {/* Image */}
            {item?.itemTypeImageUrl && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Item Image
                </div>

                <img
                  src={item.itemTypeImageUrl}
                  alt={
                    item.itemTypeName ||
                    item.itemSKU ||
                    "GRN Item"
                  }
                  style={styles.itemImage}
                />
              </div>
            )}

            {/* Item Page */}
            {item?.itemTypePageUrl && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Item Page
                </div>

                <a
                  href={item.itemTypePageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  Open Item Page
                </a>
              </div>
            )}

            {/* Errors */}
            {response.errors?.length > 0 && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Uniware Errors
                </div>

                {response.errors.map(
                  (errorItem, index) => (
                    <div
                      key={index}
                      style={styles.errorItem}
                    >
                      <strong>
                        {errorItem.message ||
                          errorItem.description ||
                          "Error"}
                      </strong>

                      {errorItem.fieldName && (
                        <div>
                          Field:{" "}
                          {errorItem.fieldName}
                        </div>
                      )}

                      {errorItem.code !==
                        undefined && (
                        <div>
                          Code:{" "}
                          {errorItem.code}
                        </div>
                      )}

                      {errorItem.description && (
                        <div>
                          Description:{" "}
                          {errorItem.description}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Warnings */}
            {response.warnings?.length > 0 && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Uniware Warnings
                </div>

                {response.warnings.map(
                  (warning, index) => (
                    <div
                      key={index}
                      style={styles.warningItem}
                    >
                      <strong>
                        {warning.message ||
                          warning.description ||
                          "Warning"}
                      </strong>

                      {warning.code !==
                        undefined && (
                        <div>
                          Code:{" "}
                          {warning.code}
                        </div>
                      )}

                      {warning.description && (
                        <div>
                          Description:{" "}
                          {warning.description}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Raw Response */}
            <div style={styles.card}>
              <details>
                <summary style={styles.rawSummary}>
                  View Raw API Response
                </summary>

                <pre style={styles.rawResponse}>
                  {JSON.stringify(
                    response,
                    null,
                    2
                  )}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------
// Detail component
// ------------------------------------------
const Detail = ({ label, value }) => (
  <div style={styles.detailItem}>
    <div style={styles.detailLabel}>
      {label}
    </div>

    <div style={styles.detailValue}>
      {value === null ||
      value === undefined ||
      value === ""
        ? "N/A"
        : value}
    </div>
  </div>
);

// ------------------------------------------
// Helpers
// ------------------------------------------
const formatCurrency = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "₹ 0.00";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `₹ ${number.toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN");
};

// ------------------------------------------
// Styles
// ------------------------------------------
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1300px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "14px",
  },

  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },

  sectionHeader: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "18px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "14px",
    outline: "none",
  },

  helpText: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "5px",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },

  primaryButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 600,
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  secondaryButton: {
    background: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 600,
  },

  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
  },

  errorTitle: {
    fontWeight: 700,
    marginBottom: "5px",
  },

  messageBox: {
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
  },

  successBox: {
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
  },

  errorMessageBox: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  responseTitle: {
    fontWeight: 700,
    fontSize: "16px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
  },

  detailItem: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
    padding: "12px",
  },

  detailLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: "5px",
    fontWeight: 600,
  },

  detailValue: {
    fontSize: "14px",
    color: "#111827",
    wordBreak: "break-word",
  },

  itemImage: {
    maxWidth: "250px",
    maxHeight: "250px",
    objectFit: "contain",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "10px",
    background: "#fff",
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },

  errorItem: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "8px",
    color: "#991b1b",
    lineHeight: 1.6,
  },

  warningItem: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "8px",
    color: "#92400e",
    lineHeight: 1.6,
  },

  rawSummary: {
    cursor: "pointer",
    fontWeight: 700,
    color: "#374151",
  },

  rawResponse: {
    background: "#111827",
    color: "#e5e7eb",
    padding: "18px",
    borderRadius: "8px",
    marginTop: "15px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default AddGRNItem;