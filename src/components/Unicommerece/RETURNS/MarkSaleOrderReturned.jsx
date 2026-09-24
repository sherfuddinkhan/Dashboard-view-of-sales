import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const createItem = () => ({
  code: "",
  status: "",
  shelfCode: "",
  reason: "",
});

function MarkSaleOrderReturned() {
  const [facility, setFacility] = useState("MAIN");
  const [saleOrderCode, setSaleOrderCode] = useState("");

  const [saleOrderItems, setSaleOrderItems] = useState([
    createItem(),
  ]);

  const [returnReason, setReturnReason] = useState("");
  const [returnCode, setReturnCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Add item
  // --------------------------------------------------
  const addItem = () => {
    setSaleOrderItems((prev) => [...prev, createItem()]);
  };

  // --------------------------------------------------
  // Remove item
  // --------------------------------------------------
  const removeItem = (index) => {
    setSaleOrderItems((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  // --------------------------------------------------
  // Update item
  // --------------------------------------------------
  const updateItem = (index, field, value) => {
    setSaleOrderItems((prev) =>
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

  // --------------------------------------------------
  // Request preview
  // --------------------------------------------------
  const requestPreview = useMemo(() => {
    const payload = {
      facility,
      saleOrderCode,
      saleOrderItems,
      returnReason,
    };

    if (returnCode.trim()) {
      payload.returnCode = returnCode;
    }

    return payload;
  }, [
    facility,
    saleOrderCode,
    saleOrderItems,
    returnReason,
    returnCode,
  ]);

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!facility.trim()) {
      setError("Facility is required.");
      return;
    }

    if (!saleOrderCode.trim()) {
      setError("Sale order code is required.");
      return;
    }

    if (!returnReason.trim()) {
      setError("Return reason is required.");
      return;
    }

    if (!saleOrderItems.length) {
      setError("At least one sale order item is required.");
      return;
    }

    const invalidItem = saleOrderItems.find(
      (item) => !item.code.trim()
    );

    if (invalidItem) {
      setError("Every sale order item must have an item code.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/mark-returned`,
        requestPreview,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          err.message ||
          "Failed to mark sale order as returned."
      );

      setResult(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Styles
  // --------------------------------------------------
  const styles = {
    page: {
      padding: 24,
      maxWidth: 1300,
      margin: "0 auto",
      fontFamily:
        "Arial, Helvetica, sans-serif",
    },

    title: {
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 6,
    },

    subtitle: {
      color: "#666",
      marginBottom: 24,
    },

    card: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 20,
      marginBottom: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 16,
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
    },

    field: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },

    label: {
      fontSize: 13,
      fontWeight: 600,
      color: "#444",
    },

    input: {
      padding: "10px 12px",
      border: "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box",
      width: "100%",
    },

    itemCard: {
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 16,
      marginBottom: 14,
      background: "#fafafa",
    },

    itemHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },

    itemTitle: {
      fontWeight: 700,
    },

    buttonRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 20,
    },

    primaryButton: {
      padding: "11px 20px",
      border: "none",
      borderRadius: 6,
      background: "#1976d2",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 600,
    },

    secondaryButton: {
      padding: "10px 16px",
      border: "1px solid #1976d2",
      borderRadius: 6,
      background: "#fff",
      color: "#1976d2",
      cursor: "pointer",
      fontWeight: 600,
    },

    dangerButton: {
      padding: "7px 12px",
      border: "1px solid #d32f2f",
      borderRadius: 5,
      background: "#fff",
      color: "#d32f2f",
      cursor: "pointer",
    },

    error: {
      padding: 14,
      background: "#ffebee",
      border: "1px solid #ef9a9a",
      borderRadius: 6,
      color: "#b71c1c",
      marginBottom: 20,
    },

    success: {
      padding: 14,
      background: "#e8f5e9",
      border: "1px solid #a5d6a7",
      borderRadius: 6,
      color: "#1b5e20",
      marginBottom: 20,
    },

    pre: {
      background: "#111",
      color: "#eee",
      padding: 16,
      borderRadius: 8,
      overflow: "auto",
      fontSize: 13,
    },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        Mark Sale Order Returned
      </h1>

      <div style={styles.subtitle}>
        Mark one or more items of a Uniware sale order as
        returned.
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {result?.successful && (
        <div style={styles.success}>
          <strong>Success:</strong>{" "}
          {result.message || "Sale order marked as returned."}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ----------------------------------------- */}
        {/* Sale Order Details */}
        {/* ----------------------------------------- */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            Sale Order Details
          </div>

          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>
                Facility *
              </label>

              <input
                style={styles.input}
                value={facility}
                onChange={(e) =>
                  setFacility(e.target.value)
                }
                placeholder="MAIN"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Sale Order Code *
              </label>

              <input
                style={styles.input}
                value={saleOrderCode}
                onChange={(e) =>
                  setSaleOrderCode(e.target.value)
                }
                placeholder="SO-10001"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Return Reason *
              </label>

              <input
                style={styles.input}
                value={returnReason}
                onChange={(e) =>
                  setReturnReason(e.target.value)
                }
                placeholder="Customer returned product"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Return Code
              </label>

              <input
                style={styles.input}
                value={returnCode}
                onChange={(e) =>
                  setReturnCode(e.target.value)
                }
                placeholder="Optional return code"
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------------- */}
        {/* Sale Order Items */}
        {/* ----------------------------------------- */}
        <div style={styles.card}>
          <div style={styles.itemHeader}>
            <div style={styles.sectionTitle}>
              Sale Order Items
            </div>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          {saleOrderItems.map((item, index) => (
            <div
              key={index}
              style={styles.itemCard}
            >
              <div style={styles.itemHeader}>
                <div style={styles.itemTitle}>
                  Item {index + 1}
                </div>

                {saleOrderItems.length > 1 && (
                  <button
                    type="button"
                    style={styles.dangerButton}
                    onClick={() =>
                      removeItem(index)
                    }
                  >
                    Remove
                  </button>
                )}
              </div>

              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Item Code *
                  </label>

                  <input
                    style={styles.input}
                    value={item.code}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "code",
                        e.target.value
                      )
                    }
                    placeholder="SOI-001"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Status
                  </label>

                  <input
                    style={styles.input}
                    value={item.status}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "status",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Shelf Code
                  </label>

                  <input
                    style={styles.input}
                    value={item.shelfCode}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "shelfCode",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Item Return Reason
                  </label>

                  <input
                    style={styles.input}
                    value={item.reason}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "reason",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ----------------------------------------- */}
        {/* Submit */}
        {/* ----------------------------------------- */}
        <div style={styles.card}>
          <div style={styles.buttonRow}>
            <button
              type="submit"
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading
                ? "Marking Returned..."
                : "Mark Sale Order Returned"}
            </button>
          </div>
        </div>
      </form>

      {/* ----------------------------------------- */}
      {/* Response */}
      {/* ----------------------------------------- */}
      {result && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            Uniware Response
          </div>

          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div style={styles.error}>
                <strong>Errors</strong>

                <ul>
                  {result.errors.map(
                    (err, index) => (
                      <li key={index}>
                        {err.message ||
                          err.description ||
                          JSON.stringify(err)}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {Array.isArray(result.warnings) &&
            result.warnings.length > 0 && (
              <div
                style={{
                  padding: 14,
                  background: "#fff8e1",
                  border:
                    "1px solid #ffe082",
                  borderRadius: 6,
                  marginBottom: 16,
                }}
              >
                <strong>Warnings</strong>

                <ul>
                  {result.warnings.map(
                    (warning, index) => (
                      <li key={index}>
                        {warning.message ||
                          warning.description ||
                          JSON.stringify(
                            warning
                          )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          <pre style={styles.pre}>
            {JSON.stringify(
              result,
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* ----------------------------------------- */}
      {/* Request Preview */}
      {/* ----------------------------------------- */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>
          Request Preview
        </div>

        <pre style={styles.pre}>
          {JSON.stringify(
            requestPreview,
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}

export default MarkSaleOrderReturned;