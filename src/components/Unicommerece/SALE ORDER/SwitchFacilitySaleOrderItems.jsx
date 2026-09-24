import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function SwitchFacilitySaleOrderItems() {
  const [facility, setFacility] =
    useState("MAIN");

  const [facilityCode, setFacilityCode] =
    useState("");

  const [saleOrderCode, setSaleOrderCode] =
    useState("");

  const [itemCodes, setItemCodes] =
    useState([""]);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const addItemCode = () => {
    setItemCodes((prev) => [
      ...prev,
      "",
    ]);
  };

  const removeItemCode = (index) => {
    setItemCodes((prev) => {
      if (prev.length === 1) {
        return [""];
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  const updateItemCode = (
    index,
    value
  ) => {
    setItemCodes((prev) =>
      prev.map((item, i) =>
        i === index
          ? value
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedFacility =
      facility.trim();

    const trimmedFacilityCode =
      facilityCode.trim();

    const trimmedSaleOrderCode =
      saleOrderCode.trim();

    const cleanedItemCodes =
      itemCodes
        .map((code) =>
          code.trim()
        )
        .filter(Boolean);

    if (!trimmedFacility) {
      setError(
        "Facility header value is required."
      );
      return;
    }

    if (!trimmedFacilityCode) {
      setError(
        "Destination facility code is required."
      );
      return;
    }

    if (!trimmedSaleOrderCode) {
      setError(
        "Sale order code is required."
      );
      return;
    }

    if (
      cleanedItemCodes.length === 0
    ) {
      setError(
        "Enter at least one sale order item code."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/sale-orders/switch-facility`,
          {
            facility:
              trimmedFacility,

            facilityCode:
              trimmedFacilityCode,

            saleOrderCode:
              trimmedSaleOrderCode,

            saleOrderItemCodes:
              cleanedItemCodes,
          }
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
            "Failed to switch sale order item facility.",
          errors: [],
          warnings: [],
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFacility("MAIN");
    setFacilityCode("");
    setSaleOrderCode("");
    setItemCodes([""]);
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
              Switch Facility
              Sale Order Items
            </h1>

            <p style={styles.subtitle}>
              Switch selected sale order
              items to another facility or
              warehouse in Uniware.
            </p>
          </div>

          <div style={styles.badge}>
            Tenant + Facility Header
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          {/* Facility Header */}
          <div
            style={styles.section}
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Facility Header
            </h2>

            <p
              style={
                styles.helperText
              }
            >
              This value is sent as the
              Uniware <strong>Facility</strong>{" "}
              request header.
            </p>

            <label
              style={styles.label}
            >
              Facility
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
              value={facility}
              onChange={(e) =>
                setFacility(
                  e.target.value
                )
              }
              placeholder="Example: MAIN"
              style={styles.input}
            />
          </div>

          {/* Destination Facility */}
          <div
            style={styles.section}
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Destination Facility
            </h2>

            <p
              style={
                styles.helperText
              }
            >
              This value is sent as{" "}
              <strong>
                facilityCode
              </strong>{" "}
              in the request body.
            </p>

            <label
              style={styles.label}
            >
              Facility Code
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
              value={facilityCode}
              onChange={(e) =>
                setFacilityCode(
                  e.target.value
                )
              }
              placeholder="Example: BLR_WAREHOUSE"
              style={styles.input}
            />
          </div>

          {/* Sale Order */}
          <div
            style={styles.section}
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Sale Order
            </h2>

            <label
              style={styles.label}
            >
              Sale Order Code
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

          {/* Item Codes */}
          <div
            style={styles.section}
          >
            <div
              style={
                styles.sectionHeader
              }
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
                  Select the item codes
                  whose facility should
                  be switched.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  addItemCode
                }
                style={
                  styles.addButton
                }
              >
                + Add Item
              </button>
            </div>

            {itemCodes.map(
              (
                itemCode,
                index
              ) => (
                <div
                  key={index}
                  style={
                    styles.itemRow
                  }
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
                    onChange={(
                      e
                    ) =>
                      updateItemCode(
                        index,
                        e.target
                          .value
                      )
                    }
                    placeholder={`Sale order item code ${
                      index + 1
                    }`}
                    style={
                      styles.itemInput
                    }
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

          {/* Error */}
          {error && (
            <div
              style={
                styles.errorBox
              }
            >
              <strong>
                Validation Error
              </strong>

              <div>
                {error}
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            style={styles.actions}
          >
            <button
              type="button"
              onClick={
                handleReset
              }
              style={
                styles.resetButton
              }
              disabled={loading}
            >
              Reset
            </button>

            <button
              type="submit"
              style={
                styles.submitButton
              }
              disabled={loading}
            >
              {loading
                ? "Switching Facility..."
                : "Switch Facility"}
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
                <div
                  style={
                    styles.message
                  }
                >
                  {result.message}
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
                  (
                    item,
                    index
                  ) => (
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
            {warnings.length >
              0 && (
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
                  (
                    item,
                    index
                  ) => (
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
              style={
                styles.details
              }
            >
              <summary
                style={
                  styles.summary
                }
              >
                View Raw Response
              </summary>

              <pre
                style={
                  styles.pre
                }
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
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
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
    padding:
      "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace:
      "nowrap",
  },

  section: {
    marginBottom: "28px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap: "20px",
    marginBottom:
      "15px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },

  helperText: {
    margin:
      "5px 0 0",
    fontSize: "13px",
    color: "#6b7280",
  },

  label: {
    display: "block",
    marginBottom:
      "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
  },

  required: {
    color: "#dc2626",
  },

  input: {
    width: "100%",
    padding:
      "12px 14px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing:
      "border-box",
    outline: "none",
  },

  itemRow: {
    display: "flex",
    alignItems:
      "center",
    gap: "10px",
    marginBottom:
      "10px",
  },

  itemNumber: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    background:
      "#f3f4f6",
    borderRadius:
      "6px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#4b5563",
    flexShrink: 0,
  },

  itemInput: {
    flex: 1,
    padding:
      "11px 13px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing:
      "border-box",
  },

  addButton: {
    border: "none",
    background:
      "#2563eb",
    color: "#ffffff",
    padding:
      "9px 14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace:
      "nowrap",
  },

  removeButton: {
    width: "34px",
    height: "34px",
    border:
      "1px solid #fecaca",
    background:
      "#fef2f2",
    color: "#dc2626",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "20px",
    lineHeight: 1,
  },

  errorBox: {
    background:
      "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#991b1b",
    padding:
      "13px 15px",
    borderRadius: "7px",
    marginBottom:
      "20px",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: "12px",
    borderTop:
      "1px solid #e5e7eb",
    paddingTop:
      "20px",
  },

  resetButton: {
    padding:
      "11px 18px",
    border:
      "1px solid #d1d5db",
    background:
      "#ffffff",
    color: "#374151",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  submitButton: {
    padding:
      "11px 20px",
    border: "none",
    background:
      "#111827",
    color: "#ffffff",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  resultSection: {
    marginTop: "30px",
    borderTop:
      "1px solid #e5e7eb",
    paddingTop:
      "25px",
  },

  statusBox: {
    padding: "15px",
    borderRadius: "8px",
    marginTop: "15px",
    fontSize: "14px",
  },

  successBox: {
    background:
      "#ecfdf5",
    border:
      "1px solid #a7f3d0",
    color: "#065f46",
  },

  failureBox: {
    background:
      "#fef2f2",
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
    background:
      "#fff7f7",
    border:
      "1px solid #fecaca",
  },

  warningList: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "8px",
    background:
      "#fffbeb",
    border:
      "1px solid #fde68a",
  },

  resultTitle: {
    margin:
      "0 0 10px",
    fontSize: "15px",
  },

  errorItem: {
    padding:
      "9px 0",
    borderBottom:
      "1px solid #fee2e2",
    fontSize: "13px",
    color: "#991b1b",
  },

  warningItem: {
    padding:
      "9px 0",
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
    marginBottom:
      "10px",
  },

  pre: {
    background:
      "#111827",
    color: "#e5e7eb",
    padding: "15px",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default SwitchFacilitySaleOrderItems;