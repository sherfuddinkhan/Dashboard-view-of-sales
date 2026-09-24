import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateShippingPackage() {
  const [facility, setFacility] =
    useState("MAIN");

  const [saleOrderCode, setSaleOrderCode] =
    useState("");

  const [saleOrderItemCodes, setSaleOrderItemCodes] =
    useState([""]);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // --------------------------------
  // Add SOI
  // --------------------------------

  const addItemCode = () => {
    setSaleOrderItemCodes((prev) => [
      ...prev,
      "",
    ]);
  };

  // --------------------------------
  // Remove SOI
  // --------------------------------

  const removeItemCode = (index) => {
    setSaleOrderItemCodes((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  // --------------------------------
  // Update SOI
  // --------------------------------

  const updateItemCode = (
    index,
    value
  ) => {
    setSaleOrderItemCodes((prev) =>
      prev.map((code, i) =>
        i === index
          ? value
          : code
      )
    );
  };

  // --------------------------------
  // Submit
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedFacility =
      facility.trim();

    const trimmedSaleOrderCode =
      saleOrderCode.trim();

    if (!trimmedFacility) {
      setError(
        "Facility is required."
      );
      return;
    }

    if (!trimmedSaleOrderCode) {
      setError(
        "Sale order code is required."
      );
      return;
    }

    const cleanedItemCodes =
      saleOrderItemCodes
        .map((code) =>
          code.trim()
        )
        .filter(Boolean);

    if (
      cleanedItemCodes.length === 0
    ) {
      setError(
        "At least one sale order item code is required."
      );
      return;
    }

    // Detect duplicate SOI codes
    const duplicateCodes =
      cleanedItemCodes.filter(
        (code, index) =>
          cleanedItemCodes.indexOf(
            code
          ) !== index
      );

    if (
      duplicateCodes.length > 0
    ) {
      setError(
        `Duplicate sale order item code: ${[
          ...new Set(
            duplicateCodes
          ),
        ].join(", ")}`
      );
      return;
    }

    const payload = {
      facility:
        trimmedFacility,

      saleOrderCode:
        trimmedSaleOrderCode,

      saleOrderItemCodes:
        cleanedItemCodes,
    };

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/shipping-packages/create`,
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
            "Failed to create shipping package.",
          errors: [],
          warnings: [],
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Reset
  // --------------------------------

  const handleReset = () => {
    setFacility("MAIN");
    setSaleOrderCode("");
    setSaleOrderItemCodes([
      "",
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
              Create Shipping Package
            </h1>

            <p style={styles.subtitle}>
              Create a shipping package for
              one sale order and its selected
              sale order items.
            </p>
          </div>

          <div style={styles.badge}>
            Facility Level
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Facility */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Facility
            </h2>

            <label style={styles.label}>
              Facility Code
              <span style={styles.required}>
                {" "}
                *
              </span>
            </label>

            <input
              type="text"
              value={facility}
              onChange={(e) =>
                setFacility(
                  e.target.value
                )
              }
              placeholder="Example: MAIN"
              style={styles.input}
            />

            <div style={styles.helperText}>
              This value is sent as the
              Uniware <strong>Facility</strong>{" "}
              request header.
            </div>
          </div>

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
              placeholder="Example: SO1231100023"
              style={styles.input}
            />
          </div>

          {/* SOI */}
          <div style={styles.section}>
            <div
              style={styles.sectionHeader}
            >
              <div>
                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Sale Order Items
                </h2>

                <p
                  style={
                    styles.helperText
                  }
                >
                  Select the SOIs that should
                  belong to the shipping package.
                </p>
              </div>

              <button
                type="button"
                onClick={addItemCode}
                style={styles.addButton}
              >
                + Add SOI
              </button>
            </div>

            {saleOrderItemCodes.map(
              (code, index) => (
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

                  <div
                    style={
                      styles.itemInputWrapper
                    }
                  >
                    <label
                      style={styles.label}
                    >
                      Sale Order Item Code
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
                      value={code}
                      onChange={(e) =>
                        updateItemCode(
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Example: SO1231100023-1"
                      style={styles.input}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItemCode(
                        index
                      )
                    }
                    disabled={
                      saleOrderItemCodes.length ===
                      1
                    }
                    style={{
                      ...styles.removeButton,
                      opacity:
                        saleOrderItemCodes.length ===
                        1
                          ? 0.5
                          : 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            )}
          </div>

          {/* Example */}
          <div
            style={
              styles.exampleBox
            }
          >
            <strong>
              Example
            </strong>

            <pre
              style={
                styles.examplePre
              }
            >
{`Facility: MAIN

Sale Order: SO1231100023

SOIs:
  SO1231100023-1
  SO1231100023-2`}
            </pre>
          </div>

          {/* Validation error */}
          {error && (
            <div
              style={styles.errorBox}
            >
              <strong>
                Validation Error
              </strong>

              <div>{error}</div>
            </div>
          )}

          {/* Actions */}
          <div
            style={styles.actions}
          >
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              style={
                styles.resetButton
              }
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              style={
                styles.submitButton
              }
            >
              {loading
                ? "Creating Package..."
                : "Create Shipping Package"}
            </button>
          </div>
        </form>

        {/* Response */}
        {result && (
          <div
            style={
              styles.resultSection
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Response
            </h2>

            {/* Status */}
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
                  ? "✓ Shipping Package Created"
                  : "✕ Shipping Package Creation Failed"}
              </strong>

              {result.message && (
                <div
                  style={
                    styles.message
                  }
                >
                  {result.message}
                </div>
              )}

              {result.shippingPackageCode && (
                <div
                  style={
                    styles.packageCode
                  }
                >
                  Shipping Package Code:
                  <strong>
                    {" "}
                    {
                      result.shippingPackageCode
                    }
                  </strong>
                </div>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div
                style={
                  styles.errorList
                }
              >
                <h3
                  style={
                    styles.resultTitle
                  }
                >
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
                    </div>
                  )
                )}
              </div>
            )}

            {/* Raw response */}
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
    maxWidth: "1000px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 3px 15px rgba(0,0,0,0.08)",
    padding: "30px",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
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
    background: "#fff7ed",
    color: "#c2410c",
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
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "15px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  },

  required: {
    color: "#dc2626",
  },

  input: {
    width: "100%",
    padding: "11px 13px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },

  helperText: {
    marginTop: "7px",
    fontSize: "12px",
    color: "#6b7280",
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

  itemRow: {
    display: "grid",
    gridTemplateColumns:
      "38px minmax(0, 1fr) 40px",
    gap: "12px",
    alignItems: "end",
    padding: "14px",
    marginBottom: "10px",
    border:
      "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "#fafafa",
  },

  itemNumber: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e5e7eb",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "12px",
    marginBottom: "2px",
  },

  itemInputWrapper: {
    minWidth: 0,
  },

  removeButton: {
    width: "34px",
    height: "34px",
    border:
      "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "20px",
  },

  exampleBox: {
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    color: "#475569",
    fontSize: "13px",
  },

  examplePre: {
    margin:
      "10px 0 0",
    background: "#111827",
    color: "#e5e7eb",
    padding: "14px",
    borderRadius: "7px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.6,
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
    padding: "16px",
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
    marginTop: "6px",
  },

  packageCode: {
    marginTop: "8px",
    fontSize: "14px",
  },

  resultTitle: {
    margin: "0 0 10px",
    fontSize: "15px",
    color: "#111827",
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

export default CreateShippingPackage;