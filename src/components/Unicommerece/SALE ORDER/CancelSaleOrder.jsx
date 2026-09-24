import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CancelSaleOrder() {
  const [saleOrderCode, setSaleOrderCode] = useState("");

  const [cancelType, setCancelType] = useState("FULL");

  const [itemCodes, setItemCodes] = useState([""]);

  const [cancelOnChannel, setCancelOnChannel] =
    useState(true);

  const [cancelledBySeller, setCancelledBySeller] =
    useState(false);

  const [cancellationReason, setCancellationReason] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const addItemCode = () => {
    setItemCodes((prev) => [...prev, ""]);
  };

  const removeItemCode = (index) => {
    setItemCodes((prev) => {
      if (prev.length === 1) {
        return [""];
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const updateItemCode = (index, value) => {
    setItemCodes((prev) =>
      prev.map((item, i) =>
        i === index ? value : item
      )
    );
  };

  const handleCancelTypeChange = (value) => {
    setCancelType(value);

    if (value === "FULL") {
      setItemCodes([""]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedSaleOrderCode =
      saleOrderCode.trim();

    if (!trimmedSaleOrderCode) {
      setError("Sale order code is required.");
      return;
    }

    const trimmedReason =
      cancellationReason.trim();

    if (trimmedReason.length > 100) {
      setError(
        "Cancellation reason cannot exceed 100 characters."
      );
      return;
    }

    const cleanedItemCodes = itemCodes
      .map((code) => code.trim())
      .filter(Boolean);

    if (
      cancelType === "PARTIAL" &&
      cleanedItemCodes.length === 0
    ) {
      setError(
        "Enter at least one sale order item code for partial cancellation."
      );
      return;
    }

    if (
      cancelOnChannel &&
      cancelledBySeller
    ) {
      setError(
        "Select either Cancel on Channel or Cancelled by Seller, not both."
      );
      return;
    }

    const payload = {
      saleOrderCode: trimmedSaleOrderCode,
      cancelPartially:
        cancelType === "PARTIAL",
      cancelOnChannel,
      cancelledBySeller,
    };

    if (cancelType === "PARTIAL") {
      payload.saleOrderItemCodes =
        cleanedItemCodes;
    }

    if (trimmedReason) {
      payload.cancellationReason =
        trimmedReason;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/cancel`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResult(
        apiError || {
          successful: false,
          message:
            err.message ||
            "Failed to cancel sale order.",
          errors: [],
          warnings: [],
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSaleOrderCode("");
    setCancelType("FULL");
    setItemCodes([""]);
    setCancelOnChannel(true);
    setCancelledBySeller(false);
    setCancellationReason("");
    setResult(null);
    setError("");
  };

  const errors = result?.errors || [];
  const warnings = result?.warnings || [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Cancel Sale Order
            </h1>

            <p style={styles.subtitle}>
              Cancel an entire sale order or selected
              sale order items in Uniware.
            </p>
          </div>

          <div style={styles.badge}>
            Tenant Level
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Sale Order */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Sale Order
            </h2>

            <label style={styles.label}>
              Sale Order Code
              <span style={styles.required}> *</span>
            </label>

            <input
              type="text"
              value={saleOrderCode}
              onChange={(e) =>
                setSaleOrderCode(e.target.value)
              }
              placeholder="Example: SO1231100023"
              style={styles.input}
            />
          </div>

          {/* Cancellation Type */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Cancellation Type
            </h2>

            <div style={styles.radioContainer}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="cancelType"
                  value="FULL"
                  checked={
                    cancelType === "FULL"
                  }
                  onChange={(e) =>
                    handleCancelTypeChange(
                      e.target.value
                    )
                  }
                />

                <span>
                  Full Sale Order
                </span>
              </label>

              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="cancelType"
                  value="PARTIAL"
                  checked={
                    cancelType === "PARTIAL"
                  }
                  onChange={(e) =>
                    handleCancelTypeChange(
                      e.target.value
                    )
                  }
                />

                <span>
                  Partial — Selected Items
                </span>
              </label>
            </div>
          </div>

          {/* Item Codes */}
          {cancelType === "PARTIAL" && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    Sale Order Items
                  </h2>

                  <p style={styles.helperText}>
                    Enter the item codes to cancel.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItemCode}
                  style={styles.addButton}
                >
                  + Add Item
                </button>
              </div>

              {itemCodes.map(
                (itemCode, index) => (
                  <div
                    key={index}
                    style={styles.itemRow}
                  >
                    <div
                      style={
                        styles.itemNumber
                      }
                    >
                      {index + 1}
                    </div>

                    <input
                      type="text"
                      value={itemCode}
                      onChange={(e) =>
                        updateItemCode(
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Sale order item code ${
                        index + 1
                      }`}
                      style={styles.itemInput}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeItemCode(
                          index
                        )
                      }
                      style={
                        styles.removeButton
                      }
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* Cancellation Source */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Cancellation Source
            </h2>

            <p style={styles.helperText}>
              Uniware documents these options as
              mutually exclusive.
            </p>

            <div
              style={styles.checkboxContainer}
            >
              <label
                style={styles.checkboxLabel}
              >
                <input
                  type="checkbox"
                  checked={cancelOnChannel}
                  onChange={(e) => {
                    const checked =
                      e.target.checked;

                    setCancelOnChannel(
                      checked
                    );

                    if (checked) {
                      setCancelledBySeller(
                        false
                      );
                    }
                  }}
                />

                <span>
                  Cancel on Channel
                </span>
              </label>

              <label
                style={styles.checkboxLabel}
              >
                <input
                  type="checkbox"
                  checked={cancelledBySeller}
                  onChange={(e) => {
                    const checked =
                      e.target.checked;

                    setCancelledBySeller(
                      checked
                    );

                    if (checked) {
                      setCancelOnChannel(
                        false
                      );
                    }
                  }}
                />

                <span>
                  Cancelled by Seller
                </span>
              </label>
            </div>
          </div>

          {/* Reason */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Cancellation Reason
            </h2>

            <label style={styles.label}>
              Reason
              <span style={styles.optional}>
                {" "}
                (optional)
              </span>
            </label>

            <textarea
              value={cancellationReason}
              onChange={(e) =>
                setCancellationReason(
                  e.target.value
                )
              }
              placeholder="Enter cancellation reason"
              maxLength={100}
              rows={4}
              style={styles.textarea}
            />

            <div style={styles.characterCount}>
              {cancellationReason.length}/100
            </div>
          </div>

          {/* Validation */}
          {error && (
            <div style={styles.errorBox}>
              <strong>
                Validation Error
              </strong>

              <div>{error}</div>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={handleReset}
              style={styles.resetButton}
              disabled={loading}
            >
              Reset
            </button>

            <button
              type="submit"
              style={styles.cancelButton}
              disabled={loading}
            >
              {loading
                ? "Cancelling..."
                : "Cancel Sale Order"}
            </button>
          </div>
        </form>

        {/* Response */}
        {result && (
          <div style={styles.resultSection}>
            <h2 style={styles.sectionTitle}>
              Response
            </h2>

            <div
              style={{
                ...styles.statusBox,
                ...(result.successful
                  ? styles.successBox
                  : styles.failureBox),
              }}
            >
              <strong>
                {result.successful
                  ? "✓ Successful"
                  : "✕ Failed"}
              </strong>

              {result.message && (
                <div style={styles.message}>
                  {result.message}
                </div>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div style={styles.errorList}>
                <h3 style={styles.resultTitle}>
                  Errors
                </h3>

                {errors.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={
                        styles.errorItem
                      }
                    >
                      <strong>
                        {item.fieldName ||
                          "Error"}
                      </strong>

                      <div>
                        {item.message ||
                          item.description ||
                          "Unknown error"}
                      </div>

                      {item.code !==
                        undefined && (
                        <small>
                          Code:{" "}
                          {item.code}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div
                style={
                  styles.warningList
                }
              >
                <h3
                  style={
                    styles.resultTitle
                  }
                >
                  Warnings
                </h3>

                {warnings.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={
                        styles.warningItem
                      }
                    >
                      <strong>
                        Warning{" "}
                        {index + 1}
                      </strong>

                      <div>
                        {item.message ||
                          item.description ||
                          "Warning"}
                      </div>

                      {item.code !==
                        undefined && (
                        <small>
                          Code:{" "}
                          {item.code}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Raw Response */}
            <details
              style={styles.details}
            >
              <summary
                style={styles.summary}
              >
                View Raw Response
              </summary>

              <pre
                style={styles.pre}
              >
                {JSON.stringify(
                  result,
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

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
    maxWidth: "950px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 3px 15px rgba(0, 0, 0, 0.08)",
    padding: "30px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px",
    borderBottom:
      "1px solid #e5e7eb",
    paddingBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  badge: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  section: {
    marginBottom: "28px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "15px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },

  helperText: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#6b7280",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
  },

  required: {
    color: "#dc2626",
  },

  optional: {
    color: "#9ca3af",
    fontWeight: 400,
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "12px 14px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  characterCount: {
    textAlign: "right",
    color: "#6b7280",
    fontSize: "12px",
    marginTop: "5px",
  },

  radioContainer: {
    display: "flex",
    gap: "25px",
    marginTop: "15px",
    flexWrap: "wrap",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },

  checkboxContainer: {
    display: "flex",
    gap: "25px",
    marginTop: "15px",
    flexWrap: "wrap",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },

  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },

  itemNumber: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#4b5563",
    flexShrink: 0,
  },

  itemInput: {
    flex: 1,
    padding: "11px 13px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  addButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "9px 14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  removeButton: {
    width: "34px",
    height: "34px",
    border:
      "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "20px",
    lineHeight: 1,
  },

  errorBox: {
    background: "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#991b1b",
    padding: "13px 15px",
    borderRadius: "7px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    borderTop:
      "1px solid #e5e7eb",
    paddingTop: "20px",
  },

  resetButton: {
    padding: "11px 18px",
    border:
      "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  cancelButton: {
    padding: "11px 20px",
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  resultSection: {
    marginTop: "30px",
    borderTop:
      "1px solid #e5e7eb",
    paddingTop: "25px",
  },

  statusBox: {
    padding: "15px",
    borderRadius: "8px",
    marginTop: "15px",
    fontSize: "14px",
  },

  successBox: {
    background: "#ecfdf5",
    border:
      "1px solid #a7f3d0",
    color: "#065f46",
  },

  failureBox: {
    background: "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#991b1b",
  },

  message: {
    marginTop: "5px",
  },

  errorList: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "8px",
    background: "#fff7f7",
    border:
      "1px solid #fecaca",
  },

  warningList: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "8px",
    background: "#fffbeb",
    border:
      "1px solid #fde68a",
  },

  resultTitle: {
    margin: "0 0 10px",
    fontSize: "15px",
  },

  errorItem: {
    padding: "9px 0",
    borderBottom:
      "1px solid #fee2e2",
    fontSize: "13px",
    color: "#991b1b",
  },

  warningItem: {
    padding: "9px 0",
    borderBottom:
      "1px solid #fef3c7",
    fontSize: "13px",
    color: "#92400e",
  },

  details: {
    marginTop: "20px",
  },

  summary: {
    cursor: "pointer",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "10px",
  },

  pre: {
    background: "#111827",
    color: "#e5e7eb",
    padding: "15px",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default CancelSaleOrder;