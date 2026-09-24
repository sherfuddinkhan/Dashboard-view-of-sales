import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function AddSaleOrderItemDetails() {
  const [saleOrderCode, setSaleOrderCode] =
    useState("");

  const [saleOrderItemCode, setSaleOrderItemCode] =
    useState("");

  const [itemDetails, setItemDetails] =
    useState([
      {
        name: "",
        value: "",
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const addItemDetail = () => {
    setItemDetails((prev) => [
      ...prev,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const removeItemDetail = (index) => {
    setItemDetails((prev) => {
      if (prev.length === 1) {
        return [
          {
            name: "",
            value: "",
          },
        ];
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  const updateItemDetail = (
    index,
    field,
    value
  ) => {
    setItemDetails((prev) =>
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedSaleOrderCode =
      saleOrderCode.trim();

    const trimmedSaleOrderItemCode =
      saleOrderItemCode.trim();

    if (!trimmedSaleOrderCode) {
      setError(
        "Sale order code is required."
      );
      return;
    }

    if (!trimmedSaleOrderItemCode) {
      setError(
        "Sale order item code is required."
      );
      return;
    }

    const cleanedDetails =
      itemDetails.map((detail) => ({
        name: detail.name.trim(),
        value: detail.value.trim(),
      }));

    if (cleanedDetails.length === 0) {
      setError(
        "At least one item detail is required."
      );
      return;
    }

    const invalidDetail =
      cleanedDetails.find(
        (detail) =>
          !detail.name ||
          !detail.value
      );

    if (invalidDetail) {
      setError(
        "Every item detail must have both a name and value."
      );
      return;
    }

    const payload = {
      saleOrderCode:
        trimmedSaleOrderCode,

      saleOrderItemCode:
        trimmedSaleOrderItemCode,

      itemDetails:
        cleanedDetails,
    };

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/sale-orders/item-details/add`,
          payload
        );

      setResult(response.data);
    } catch (err) {
      const apiError =
        err.response?.data;

      setResult(
        apiError || {
          successful: false,
          message:
            err.message ||
            "Failed to add sale order item details.",
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
    setSaleOrderItemCode("");

    setItemDetails([
      {
        name: "",
        value: "",
      },
    ]);

    setResult(null);
    setError("");
  };

  const errors =
    result?.errors || [];

  const warnings =
    result?.warnings || [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Add Sale Order Item Details
            </h1>

            <p style={styles.subtitle}>
              Add item-level details such as
              IMEI, serial number, item seal ID,
              or other Uniware item details.
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
              <span style={styles.required}>
                {" "}
                *
              </span>
            </label>

            <input
              type="text"
              value={saleOrderCode}
              onChange={(e) =>
                setSaleOrderCode(
                  e.target.value
                )
              }
              placeholder="Example: SO266"
              style={styles.input}
            />
          </div>

          {/* SOI */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Sale Order Item
            </h2>

            <label style={styles.label}>
              Sale Order Item Code
              <span style={styles.required}>
                {" "}
                *
              </span>
            </label>

            <input
              type="text"
              value={saleOrderItemCode}
              onChange={(e) =>
                setSaleOrderItemCode(
                  e.target.value
                )
              }
              placeholder="Example: TESTB-0"
              style={styles.input}
            />
          </div>

          {/* Item Details */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Item Details
                </h2>

                <p style={styles.helperText}>
                  Add one or more name/value
                  pairs for this sale order item.
                </p>
              </div>

              <button
                type="button"
                onClick={addItemDetail}
                style={styles.addButton}
              >
                + Add Detail
              </button>
            </div>

            {itemDetails.map(
              (detail, index) => (
                <div
                  key={index}
                  style={styles.detailCard}
                >
                  <div style={styles.detailHeader}>
                    <div style={styles.detailNumber}>
                      {index + 1}
                    </div>

                    <strong>
                      Item Detail
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeItemDetail(
                          index
                        )
                      }
                      style={
                        styles.removeButton
                      }
                      title="Remove detail"
                    >
                      ×
                    </button>
                  </div>

                  <div style={styles.detailGrid}>
                    <div>
                      <label
                        style={styles.label}
                      >
                        Name
                        <span
                          style={
                            styles.required
                          }
                        >
                          {" "}
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={detail.name}
                        onChange={(e) =>
                          updateItemDetail(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Example: IMEI"
                        style={styles.input}
                      />
                    </div>

                    <div>
                      <label
                        style={styles.label}
                      >
                        Value
                        <span
                          style={
                            styles.required
                          }
                        >
                          {" "}
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={detail.value}
                        onChange={(e) =>
                          updateItemDetail(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Example: 123456789012345"
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Examples */}
          <div style={styles.exampleBox}>
            <strong>
              Example item details
            </strong>

            <div style={styles.exampleList}>
              <span>IMEI → 123456789012345</span>
              <span>
                SerialNumber → SN-10001
              </span>
              <span>
                itemSealId → 12
              </span>
            </div>
          </div>

          {/* Validation Error */}
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
              style={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? "Adding Details..."
                : "Add Item Details"}
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

              {result.saleOrderItemCode && (
                <div style={styles.message}>
                  Sale Order Item Code:{" "}
                  <strong>
                    {result.saleOrderItemCode}
                  </strong>
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
                      style={styles.errorItem}
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
            <details style={styles.details}>
              <summary
                style={styles.summary}
              >
                View Raw Response
              </summary>

              <pre style={styles.pre}>
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
    background: "#eef2ff",
    color: "#4338ca",
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

  detailCard: {
    border:
      "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "18px",
    marginBottom: "12px",
    background: "#fafafa",
  },

  detailHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
    color: "#374151",
  },

  detailNumber: {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e5e7eb",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 700,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "15px",
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
    marginLeft: "auto",
    width: "32px",
    height: "32px",
    border:
      "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "20px",
    lineHeight: 1,
  },

  exampleBox: {
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "#475569",
  },

  exampleList: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginTop: "8px",
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

  submitButton: {
    padding: "11px 20px",
    border: "none",
    background: "#111827",
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

export default AddSaleOrderItemDetails;