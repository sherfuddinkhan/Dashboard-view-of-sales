import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const CreateGRN = () => {
  const [facility, setFacility] = useState("");
  const [purchaseOrderCode, setPurchaseOrderCode] =
    useState("");

  const [vendorInvoiceNumber, setVendorInvoiceNumber] =
    useState("");

  const [vendorInvoiceDate, setVendorInvoiceDate] =
    useState("");

  const [currencyCode, setCurrencyCode] =
    useState("INR");

  const [
    vendorInvoiceDateCheckDisable,
    setVendorInvoiceDateCheckDisable,
  ] = useState(false);

  const [customFields, setCustomFields] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  // ------------------------------------------
  // Add custom field
  // ------------------------------------------
  const addCustomField = () => {
    setCustomFields((prev) => [
      ...prev,
      {
        name: "",
        value: "",
      },
    ]);
  };

  // ------------------------------------------
  // Update custom field
  // ------------------------------------------
  const updateCustomField = (
    index,
    field,
    value
  ) => {
    setCustomFields((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ------------------------------------------
  // Remove custom field
  // ------------------------------------------
  const removeCustomField = (index) => {
    setCustomFields((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

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

    if (!purchaseOrderCode.trim()) {
      setError("Please enter Purchase Order Code.");
      return;
    }

    if (!vendorInvoiceNumber.trim()) {
      setError(
        "Please enter Vendor Invoice Number."
      );
      return;
    }

    if (!vendorInvoiceDate) {
      setError(
        "Please select Vendor Invoice Date."
      );
      return;
    }

    // Check custom fields
    const invalidCustomField =
      customFields.find(
        (field) => !field.name.trim()
      );

    if (invalidCustomField) {
      setError(
        "Every custom field must have a name."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders/create-grn`,
        {
          facility: facility.trim(),

          purchaseOrderCode:
            purchaseOrderCode.trim(),

          vendorInvoiceNumber:
            vendorInvoiceNumber.trim(),

          vendorInvoiceDate,

          currencyCode:
            currencyCode.trim() || "INR",

          vendorInvoiceDateCheckDisable,

          customFieldValues: customFields,
        }
      );

      const data = result.data;

      setResponse(data);

      if (!data.successful) {
        setError(
          data.message ||
            "Uniware could not create the GRN."
        );
      }
    } catch (err) {
      console.error(err);

      const apiData = err.response?.data;

      setError(
        apiData?.message ||
          err.message ||
          "Failed to create GRN."
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
    setPurchaseOrderCode("");
    setVendorInvoiceNumber("");
    setVendorInvoiceDate("");
    setCurrencyCode("INR");
    setVendorInvoiceDateCheckDisable(false);
    setCustomFields([]);
    setError("");
    setResponse(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Create GRN
          </h1>

          <p style={styles.subtitle}>
            Create a Goods Receipt Note against a
            Uniware Purchase Order.
          </p>
        </div>

        {/* Form */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>

            <div style={styles.sectionHeader}>
              GRN Details
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

              {/* PO Code */}
              <div>
                <label style={styles.label}>
                  Purchase Order Code *
                </label>

                <input
                  type="text"
                  value={purchaseOrderCode}
                  onChange={(e) =>
                    setPurchaseOrderCode(
                      e.target.value
                    )
                  }
                  placeholder="Example: PO0194"
                  style={styles.input}
                />
              </div>

              {/* Invoice Number */}
              <div>
                <label style={styles.label}>
                  Vendor Invoice Number *
                </label>

                <input
                  type="text"
                  value={vendorInvoiceNumber}
                  onChange={(e) =>
                    setVendorInvoiceNumber(
                      e.target.value
                    )
                  }
                  placeholder="Example: INV-1001"
                  style={styles.input}
                />
              </div>

              {/* Invoice Date */}
              <div>
                <label style={styles.label}>
                  Vendor Invoice Date *
                </label>

                <input
                  type="datetime-local"
                  value={vendorInvoiceDate}
                  onChange={(e) =>
                    setVendorInvoiceDate(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  Date will be converted to UTC before
                  sending to Uniware.
                </div>
              </div>

              {/* Currency */}
              <div>
                <label style={styles.label}>
                  Currency Code
                </label>

                <input
                  type="text"
                  value={currencyCode}
                  onChange={(e) =>
                    setCurrencyCode(
                      e.target.value
                    )
                  }
                  maxLength={3}
                  placeholder="INR"
                  style={styles.input}
                />
              </div>

            </div>

            {/* Date Check */}
            <div style={styles.checkboxContainer}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={
                    vendorInvoiceDateCheckDisable
                  }
                  onChange={(e) =>
                    setVendorInvoiceDateCheckDisable(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Disable Vendor Invoice Date Check
                </span>
              </label>

              <div style={styles.helpText}>
                Enable this only when Uniware should
                skip the vendor invoice date validation.
              </div>
            </div>

            {/* Custom Fields */}
            <div style={styles.customFieldHeader}>
              <div>
                <div style={styles.sectionHeader}>
                  Custom Fields
                </div>

                <div style={styles.helpText}>
                  Optional GRN custom field values.
                </div>
              </div>

              <button
                type="button"
                onClick={addCustomField}
                style={styles.addButton}
              >
                + Add Custom Field
              </button>
            </div>

            {customFields.length === 0 && (
              <div style={styles.emptyCustomFields}>
                No custom fields added.
              </div>
            )}

            {customFields.map(
              (field, index) => (
                <div
                  key={index}
                  style={styles.customFieldRow}
                >
                  <div style={{ flex: 1 }}>
                    <label style={styles.smallLabel}>
                      Field Name *
                    </label>

                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) =>
                        updateCustomField(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Example: Currency"
                      style={styles.input}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={styles.smallLabel}>
                      Value
                    </label>

                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) =>
                        updateCustomField(
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      placeholder="Example: INR"
                      style={styles.input}
                    />
                  </div>

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
              )
            )}

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
                  ? "Creating GRN..."
                  : "Create GRN"}
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

            {/* Response Message */}
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
                  ? "GRN Created Successfully"
                  : "GRN Creation Failed"}
              </div>

              {response.message && (
                <div style={{ marginTop: 6 }}>
                  {response.message}
                </div>
              )}
            </div>

            {/* GRN Code */}
            {response.successful &&
              response.inflowReceiptCode && (
                <div style={styles.grnCard}>

                  <div style={styles.grnLabel}>
                    Inflow Receipt / GRN Code
                  </div>

                  <div style={styles.grnCode}>
                    {response.inflowReceiptCode}
                  </div>

                  <div style={styles.grnHelp}>
                    This is the GRN code returned by
                    Uniware.
                  </div>
                </div>
              )}

            {/* Errors */}
            {response.errors?.length > 0 && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Uniware Errors
                </div>

                {response.errors.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={styles.errorItem}
                    >
                      <div>
                        <strong>
                          {item.message ||
                            item.description ||
                            "Error"}
                        </strong>
                      </div>

                      {item.fieldName && (
                        <div>
                          Field:{" "}
                          {item.fieldName}
                        </div>
                      )}

                      {item.code !== undefined && (
                        <div>
                          Code: {item.code}
                        </div>
                      )}

                      {item.description && (
                        <div>
                          Description:{" "}
                          {item.description}
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
                  (item, index) => (
                    <div
                      key={index}
                      style={styles.warningItem}
                    >
                      <div>
                        <strong>
                          {item.message ||
                            item.description ||
                            "Warning"}
                        </strong>
                      </div>

                      {item.code !== undefined && (
                        <div>
                          Code: {item.code}
                        </div>
                      )}

                      {item.description && (
                        <div>
                          Description:{" "}
                          {item.description}
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
    maxWidth: "1200px",
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

  smallLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
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

  checkboxContainer: {
    marginTop: "20px",
    marginBottom: "25px",
    padding: "15px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
  },

  customFieldHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginTop: "10px",
    marginBottom: "15px",
  },

  addButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  customFieldRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    padding: "15px",
    marginBottom: "10px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  removeButton: {
    background: "#fff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "11px 14px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  emptyCustomFields: {
    padding: "15px",
    textAlign: "center",
    color: "#6b7280",
    background: "#f9fafb",
    border: "1px dashed #d1d5db",
    borderRadius: "7px",
    marginBottom: "20px",
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

  grnCard: {
    background: "#eff6ff",
    border: "2px solid #2563eb",
    borderRadius: "10px",
    padding: "25px",
    marginBottom: "20px",
    textAlign: "center",
  },

  grnLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "8px",
  },

  grnCode: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1d4ed8",
    letterSpacing: "1px",
  },

  grnHelp: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#6b7280",
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

export default CreateGRN;