import React, {
  useMemo,
  useState,
} from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const createItem = () => ({
  code: "",
  status: "GOOD_INVENTORY",
  shelfCode: "",
  reason: "",
});

function MarkSaleOrderReturnedInventory() {
  const [facility, setFacility] =
    useState("MAIN");

  const [saleOrderCode, setSaleOrderCode] =
    useState("");

  const [saleOrderItems, setSaleOrderItems] =
    useState([createItem()]);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Add item
  // --------------------------------------------------
  const addItem = () => {
    setSaleOrderItems((previous) => [
      ...previous,
      createItem(),
    ]);
  };

  // --------------------------------------------------
  // Remove item
  // --------------------------------------------------
  const removeItem = (index) => {
    setSaleOrderItems((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  };

  // --------------------------------------------------
  // Update item
  // --------------------------------------------------
  const updateItem = (
    index,
    field,
    value
  ) => {
    setSaleOrderItems((previous) =>
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

  // --------------------------------------------------
  // Request Preview
  // --------------------------------------------------
  const requestPreview = useMemo(() => {
    return {
      facility,
      saleOrderCode,
      saleOrderItems,
    };
  }, [
    facility,
    saleOrderCode,
    saleOrderItems,
  ]);

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    // Facility
    if (!facility.trim()) {
      setError(
        "Facility is required."
      );
      return;
    }

    // Sale order
    if (!saleOrderCode.trim()) {
      setError(
        "Sale order code is required."
      );
      return;
    }

    // Items
    if (
      !Array.isArray(saleOrderItems) ||
      saleOrderItems.length === 0
    ) {
      setError(
        "At least one sale order item is required."
      );
      return;
    }

    // Validate item codes
    const invalidCode =
      saleOrderItems.some(
        (item) =>
          !item.code ||
          !item.code.trim()
      );

    if (invalidCode) {
      setError(
        "Every sale order item must have an item code."
      );
      return;
    }

    // Validate inventory type
    const invalidStatus =
      saleOrderItems.some(
        (item) =>
          ![
            "GOOD_INVENTORY",
            "BAD_INVENTORY",
          ].includes(
            item.status
          )
      );

    if (invalidStatus) {
      setError(
        "Inventory type must be GOOD_INVENTORY or BAD_INVENTORY."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/sale-orders/mark-returned-inventory`,
          requestPreview,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      setResult(response.data);
    } catch (err) {
      const apiError =
        err.response?.data;

      setError(
        apiError?.message ||
          err.message ||
          "Failed to complete sale order return."
      );

      setResult(
        apiError || null
      );
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
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.05)",
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
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      border: "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
    },

    select: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      border: "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      background: "#fff",
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
      justifyContent:
        "space-between",
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
      border:
        "1px solid #1976d2",
      borderRadius: 6,
      background: "#fff",
      color: "#1976d2",
      cursor: "pointer",
      fontWeight: 600,
    },

    dangerButton: {
      padding: "7px 12px",
      border:
        "1px solid #d32f2f",
      borderRadius: 5,
      background: "#fff",
      color: "#d32f2f",
      cursor: "pointer",
    },

    error: {
      padding: 14,
      background: "#ffebee",
      border:
        "1px solid #ef9a9a",
      borderRadius: 6,
      color: "#b71c1c",
      marginBottom: 20,
    },

    success: {
      padding: 14,
      background: "#e8f5e9",
      border:
        "1px solid #a5d6a7",
      borderRadius: 6,
      color: "#1b5e20",
      marginBottom: 20,
    },

    warning: {
      padding: 14,
      background: "#fff8e1",
      border:
        "1px solid #ffe082",
      borderRadius: 6,
      marginBottom: 16,
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
        Complete a sale order return and
        update each returned item with its
        inventory type.
      </div>

      <div style={styles.warning}>
        <strong>Important:</strong>{" "}
        Push the inventory status for all
        items that are part of the return
        in one request. Uniware handles this
        return as a <strong>Courier Returned</strong>{" "}
        return type.
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {result?.successful && (
        <div style={styles.success}>
          <strong>Success:</strong>{" "}
          {result.message ||
            "Sale order return completed successfully."}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
      >
        {/* -------------------------------------- */}
        {/* Sale Order */}
        {/* -------------------------------------- */}

        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Sale Order Details
          </div>

          <div style={styles.grid}>
            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Facility *
              </label>

              <input
                style={styles.input}
                value={facility}
                onChange={(event) =>
                  setFacility(
                    event.target.value
                  )
                }
                placeholder="MAIN"
              />
            </div>

            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Sale Order Code *
              </label>

              <input
                style={styles.input}
                value={saleOrderCode}
                onChange={(event) =>
                  setSaleOrderCode(
                    event.target.value
                  )
                }
                placeholder="SO-10001"
              />
            </div>
          </div>
        </div>

        {/* -------------------------------------- */}
        {/* Items */}
        {/* -------------------------------------- */}

        <div style={styles.card}>
          <div style={styles.itemHeader}>
            <div
              style={styles.sectionTitle}
            >
              Returned Items
            </div>

            <button
              type="button"
              style={
                styles.secondaryButton
              }
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          {saleOrderItems.map(
            (item, index) => (
              <div
                key={index}
                style={
                  styles.itemCard
                }
              >
                <div
                  style={
                    styles.itemHeader
                  }
                >
                  <div
                    style={
                      styles.itemTitle
                    }
                  >
                    Item {index + 1}
                  </div>

                  {saleOrderItems.length >
                    1 && (
                    <button
                      type="button"
                      style={
                        styles.dangerButton
                      }
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div
                  style={styles.grid}
                >
                  {/* Item Code */}
                  <div
                    style={
                      styles.field
                    }
                  >
                    <label
                      style={
                        styles.label
                      }
                    >
                      Order Item Code *
                    </label>

                    <input
                      style={
                        styles.input
                      }
                      value={
                        item.code
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          index,
                          "code",
                          event.target
                            .value
                        )
                      }
                      placeholder="SOI-001"
                    />
                  </div>

                  {/* Inventory Type */}
                  <div
                    style={
                      styles.field
                    }
                  >
                    <label
                      style={
                        styles.label
                      }
                    >
                      Inventory Type
                    </label>

                    <select
                      style={
                        styles.select
                      }
                      value={
                        item.status
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          index,
                          "status",
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="GOOD_INVENTORY">
                        GOOD_INVENTORY
                      </option>

                      <option value="BAD_INVENTORY">
                        BAD_INVENTORY
                      </option>
                    </select>
                  </div>

                  {/* Shelf */}
                  <div
                    style={
                      styles.field
                    }
                  >
                    <label
                      style={
                        styles.label
                      }
                    >
                      Shelf Code
                    </label>

                    <input
                      style={
                        styles.input
                      }
                      value={
                        item.shelfCode
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          index,
                          "shelfCode",
                          event.target
                            .value
                        )
                      }
                      placeholder="A-01-01"
                    />
                  </div>

                  {/* Reason */}
                  <div
                    style={
                      styles.field
                    }
                  >
                    <label
                      style={
                        styles.label
                      }
                    >
                      Return Reason
                    </label>

                    <input
                      style={
                        styles.input
                      }
                      value={
                        item.reason
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          index,
                          "reason",
                          event.target
                            .value
                        )
                      }
                      placeholder="Damaged / Customer return"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* -------------------------------------- */}
        {/* Submit */}
        {/* -------------------------------------- */}

        <div style={styles.card}>
          <div
            style={styles.buttonRow}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? "Completing Return..."
                : "Complete Return"}
            </button>
          </div>
        </div>
      </form>

      {/* -------------------------------------- */}
      {/* Response */}
      {/* -------------------------------------- */}

      {result && (
        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Uniware Response
          </div>

          {Array.isArray(
            result.errors
          ) &&
            result.errors.length >
              0 && (
              <div
                style={styles.error}
              >
                <strong>
                  Errors
                </strong>

                <ul>
                  {result.errors.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
                        {item.message ||
                          item.description ||
                          JSON.stringify(
                            item
                          )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {Array.isArray(
            result.warnings
          ) &&
            result.warnings.length >
              0 && (
              <div
                style={
                  styles.warning
                }
              >
                <strong>
                  Warnings
                </strong>

                <ul>
                  {result.warnings.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
                        {item.message ||
                          item.description ||
                          JSON.stringify(
                            item
                          )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          <pre
            style={styles.pre}
          >
            {JSON.stringify(
              result,
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* -------------------------------------- */}
      {/* Request Preview */}
      {/* -------------------------------------- */}

      <div style={styles.card}>
        <div
          style={styles.sectionTitle}
        >
          Request Preview
        </div>

        <pre
          style={styles.pre}
        >
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

export default MarkSaleOrderReturnedInventory;