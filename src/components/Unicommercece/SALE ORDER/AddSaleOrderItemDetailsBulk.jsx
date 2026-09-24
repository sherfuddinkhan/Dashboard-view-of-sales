import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function AddSaleOrderItemDetailsBulk() {
  const [saleOrderCode, setSaleOrderCode] =
    useState("");

  const [saleOrderItems, setSaleOrderItems] =
    useState([
      {
        saleOrderItemCode: "",
        itemDetails: [
          {
            name: "",
            value: "",
          },
        ],
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // -----------------------------
  // SOI functions
  // -----------------------------

  const addSaleOrderItem = () => {
    setSaleOrderItems((prev) => [
      ...prev,
      {
        saleOrderItemCode: "",
        itemDetails: [
          {
            name: "",
            value: "",
          },
        ],
      },
    ]);
  };

  const removeSaleOrderItem = (index) => {
    setSaleOrderItems((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  const updateSaleOrderItemCode = (
    index,
    value
  ) => {
    setSaleOrderItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              saleOrderItemCode: value,
            }
          : item
      )
    );
  };

  // -----------------------------
  // Item detail functions
  // -----------------------------

  const addItemDetail = (itemIndex) => {
    setSaleOrderItems((prev) =>
      prev.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              itemDetails: [
                ...item.itemDetails,
                {
                  name: "",
                  value: "",
                },
              ],
            }
          : item
      )
    );
  };

  const removeItemDetail = (
    itemIndex,
    detailIndex
  ) => {
    setSaleOrderItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) {
          return item;
        }

        if (item.itemDetails.length === 1) {
          return item;
        }

        return {
          ...item,
          itemDetails:
            item.itemDetails.filter(
              (_, index) =>
                index !== detailIndex
            ),
        };
      })
    );
  };

  const updateItemDetail = (
    itemIndex,
    detailIndex,
    field,
    value
  ) => {
    setSaleOrderItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) {
          return item;
        }

        return {
          ...item,
          itemDetails:
            item.itemDetails.map(
              (detail, index) =>
                index === detailIndex
                  ? {
                      ...detail,
                      [field]: value,
                    }
                  : detail
            ),
        };
      })
    );
  };

  // -----------------------------
  // Submit
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedSaleOrderCode =
      saleOrderCode.trim();

    if (!trimmedSaleOrderCode) {
      setError(
        "Sale order code is required."
      );
      return;
    }

    if (
      saleOrderItems.length === 0
    ) {
      setError(
        "At least one sale order item is required."
      );
      return;
    }

    const cleanedItems =
      saleOrderItems.map(
        (item) => ({
          saleOrderItemCode:
            item.saleOrderItemCode.trim(),

          itemDetails:
            item.itemDetails.map(
              (detail) => ({
                name: detail.name.trim(),
                value:
                  detail.value.trim(),
              })
            ),
        })
      );

    // Validate SOI codes
    const missingCode =
      cleanedItems.find(
        (item) =>
          !item.saleOrderItemCode
      );

    if (missingCode) {
      setError(
        "Every sale order item must have a sale order item code."
      );
      return;
    }

    // Validate item details
    for (
      let itemIndex = 0;
      itemIndex < cleanedItems.length;
      itemIndex++
    ) {
      const item =
        cleanedItems[itemIndex];

      if (
        !Array.isArray(
          item.itemDetails
        ) ||
        item.itemDetails.length === 0
      ) {
        setError(
          `At least one item detail is required for ${item.saleOrderItemCode}.`
        );
        return;
      }

      for (
        let detailIndex = 0;
        detailIndex <
        item.itemDetails.length;
        detailIndex++
      ) {
        const detail =
          item.itemDetails[
            detailIndex
          ];

        if (!detail.name) {
          setError(
            `Item detail ${
              detailIndex + 1
            } name is required for ${item.saleOrderItemCode}.`
          );
          return;
        }

        if (!detail.value) {
          setError(
            `Item detail ${
              detailIndex + 1
            } value is required for ${item.saleOrderItemCode}.`
          );
          return;
        }
      }
    }

    // Check duplicate SOI codes
    const codes =
      cleanedItems.map(
        (item) =>
          item.saleOrderItemCode
      );

    const duplicateCodes =
      codes.filter(
        (code, index) =>
          codes.indexOf(code) !==
          index
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
      saleOrderCode:
        trimmedSaleOrderCode,

      saleOrderItemDetailDTOS:
        cleanedItems,
    };

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/sale-orders/item-details/add-bulk`,
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

  // -----------------------------
  // Reset
  // -----------------------------

  const handleReset = () => {
    setSaleOrderCode("");

    setSaleOrderItems([
      {
        saleOrderItemCode: "",
        itemDetails: [
          {
            name: "",
            value: "",
          },
        ],
      },
    ]);

    setResult(null);
    setError("");
  };

  const errors =
    result?.errors || [];

  const warnings =
    result?.warnings || [];

  const itemResponses =
    result?.addSaleOrderItemDetailResponses ||
    [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Add Item Details — Multi SOI
            </h1>

            <p style={styles.subtitle}>
              Add item-level details for
              multiple sale order items in
              one request.
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
              <span
                style={styles.required}
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
              placeholder="Example: SO267"
              style={styles.input}
            />
          </div>

          {/* SOIs */}
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
                  Each SOI can contain
                  multiple item details.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  addSaleOrderItem
                }
                style={
                  styles.addButton
                }
              >
                + Add SOI
              </button>
            </div>

            {saleOrderItems.map(
              (item, itemIndex) => (
                <div
                  key={itemIndex}
                  style={
                    styles.soiCard
                  }
                >
                  {/* SOI Header */}
                  <div
                    style={
                      styles.soiHeader
                    }
                  >
                    <div
                      style={
                        styles.soiTitleWrapper
                      }
                    >
                      <div
                        style={
                          styles.number
                        }
                      >
                        {itemIndex + 1}
                      </div>

                      <div>
                        <strong>
                          Sale Order Item{" "}
                          {itemIndex + 1}
                        </strong>

                        <div
                          style={
                            styles.smallText
                          }
                        >
                          Single SOI with
                          multiple details
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeSaleOrderItem(
                          itemIndex
                        )
                      }
                      disabled={
                        saleOrderItems.length ===
                        1
                      }
                      style={{
                        ...styles.removeButton,
                        opacity:
                          saleOrderItems.length ===
                          1
                            ? 0.5
                            : 1,
                      }}
                    >
                      Remove SOI
                    </button>
                  </div>

                  {/* SOI Code */}
                  <div
                    style={
                      styles.soiCodeSection
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
                      value={
                        item.saleOrderItemCode
                      }
                      onChange={(e) =>
                        updateSaleOrderItemCode(
                          itemIndex,
                          e.target.value
                        )
                      }
                      placeholder="Example: TEST_2_S-0"
                      style={
                        styles.input
                      }
                    />
                  </div>

                  {/* Details */}
                  <div>
                    <div
                      style={
                        styles.detailHeader
                      }
                    >
                      <div>
                        <strong>
                          Item Details
                        </strong>

                        <div
                          style={
                            styles.smallText
                          }
                        >
                          Example: IMEI,
                          SerialNumber,
                          itemSealId
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addItemDetail(
                            itemIndex
                          )
                        }
                        style={
                          styles.secondaryButton
                        }
                      >
                        + Add Detail
                      </button>
                    </div>

                    {item.itemDetails.map(
                      (
                        detail,
                        detailIndex
                      ) => (
                        <div
                          key={
                            detailIndex
                          }
                          style={
                            styles.detailRow
                          }
                        >
                          <div
                            style={
                              styles.detailNumber
                            }
                          >
                            {detailIndex +
                              1}
                          </div>

                          <div
                            style={
                              styles.detailInput
                            }
                          >
                            <label
                              style={
                                styles.label
                              }
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
                              value={
                                detail.name
                              }
                              onChange={(
                                e
                              ) =>
                                updateItemDetail(
                                  itemIndex,
                                  detailIndex,
                                  "name",
                                  e.target
                                    .value
                                )
                              }
                              placeholder="Example: IMEI"
                              style={
                                styles.input
                              }
                            />
                          </div>

                          <div
                            style={
                              styles.detailInput
                            }
                          >
                            <label
                              style={
                                styles.label
                              }
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
                              value={
                                detail.value
                              }
                              onChange={(
                                e
                              ) =>
                                updateItemDetail(
                                  itemIndex,
                                  detailIndex,
                                  "value",
                                  e.target
                                    .value
                                )
                              }
                              placeholder="Example: 123456789012345"
                              style={
                                styles.input
                              }
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItemDetail(
                                itemIndex,
                                detailIndex
                              )
                            }
                            disabled={
                              item
                                .itemDetails
                                .length ===
                              1
                            }
                            style={{
                              ...styles.deleteDetailButton,
                              opacity:
                                item
                                  .itemDetails
                                  .length ===
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
              Example structure
            </strong>

            <pre
              style={
                styles.examplePre
              }
            >
{`SO267
 ├── TEST_2_S-0
 │    ├── itemSealId = 12
 │    ├── Imei = 123456789012345
 │    └── SerialNumber = SN-10001
 │
 └── TESTB-0
      ├── itemSealId = 15
      ├── Imei = 987654321098765
      └── SerialNumber = SN-10002`}
            </pre>
          </div>

          {/* Error */}
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
                ? "Adding Details..."
                : "Add Item Details"}
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

            {/* Overall status */}
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
                  ? "✓ Request Successful"
                  : "✕ Request Failed"}
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

            {/* Per-SOI response */}
            {itemResponses.length >
              0 && (
              <div
                style={
                  styles.responseTableWrapper
                }
              >
                <h3
                  style={
                    styles.resultTitle
                  }
                >
                  Sale Order Item
                  Results
                </h3>

                <div
                  style={
                    styles.tableWrapper
                  }
                >
                  <table
                    style={
                      styles.table
                    }
                  >
                    <thead>
                      <tr>
                        <th
                          style={
                            styles.th
                          }
                        >
                          SOI Code
                        </th>

                        <th
                          style={
                            styles.th
                          }
                        >
                          Status
                        </th>

                        <th
                          style={
                            styles.th
                          }
                        >
                          Message
                        </th>

                        <th
                          style={
                            styles.th
                          }
                        >
                          Errors
                        </th>

                        <th
                          style={
                            styles.th
                          }
                        >
                          Warnings
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {itemResponses.map(
                        (
                          response,
                          index
                        ) => (
                          <tr
                            key={
                              index
                            }
                          >
                            <td
                              style={
                                styles.td
                              }
                            >
                              <strong>
                                {
                                  response.saleOrderItemCode
                                }
                              </strong>
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              <span
                                style={{
                                  ...styles.statusPill,
                                  ...(response.successful
                                    ? styles.successPill
                                    : styles.failurePill),
                                }}
                              >
                                {response.successful
                                  ? "Success"
                                  : "Failed"}
                              </span>
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              {response.message ||
                                "—"}
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              {response
                                .errors
                                ?.length ||
                                0}
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              {response
                                .warnings
                                ?.length ||
                                0}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Overall errors */}
            {errors.length >
              0 && (
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
                      key={
                        index
                      }
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
                          {
                            item.code
                          }
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Overall warnings */}
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
                      key={
                        index
                      }
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
    maxWidth: "1100px",
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

  helperText: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#6b7280",
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

  secondaryButton: {
    border:
      "1px solid #2563eb",
    background: "#ffffff",
    color: "#2563eb",
    padding: "7px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
  },

  soiCard: {
    border:
      "1px solid #dbe1ea",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "16px",
    background: "#fbfcfe",
  },

  soiHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  soiTitleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  number: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "7px",
    background: "#e5e7eb",
    color: "#374151",
    fontWeight: 700,
  },

  smallText: {
    marginTop: "4px",
    color: "#6b7280",
    fontSize: "12px",
  },

  removeButton: {
    border:
      "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "7px 11px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },

  soiCodeSection: {
    marginBottom: "22px",
  },

  detailHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  detailRow: {
    display: "grid",
    gridTemplateColumns:
      "35px minmax(0, 1fr) minmax(0, 1fr) 40px",
    gap: "12px",
    alignItems: "end",
    background: "#ffffff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "10px",
  },

  detailNumber: {
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#4b5563",
    marginBottom: "4px",
  },

  detailInput: {
    minWidth: 0,
  },

  deleteDetailButton: {
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

  responseTableWrapper: {
    marginTop: "20px",
  },

  resultTitle: {
    margin: "0 0 10px",
    fontSize: "15px",
    color: "#111827",
  },

  tableWrapper: {
    overflowX: "auto",
    border:
      "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    fontSize: "13px",
  },

  th: {
    textAlign: "left",
    padding: "11px",
    background: "#f9fafb",
    borderBottom:
      "1px solid #e5e7eb",
    color: "#374151",
  },

  td: {
    padding: "11px",
    borderBottom:
      "1px solid #f1f5f9",
    color: "#4b5563",
  },

  statusPill: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 700,
  },

  successPill: {
    background: "#dcfce7",
    color: "#166534",
  },

  failurePill: {
    background: "#fee2e2",
    color: "#991b1b",
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

export default AddSaleOrderItemDetailsBulk;