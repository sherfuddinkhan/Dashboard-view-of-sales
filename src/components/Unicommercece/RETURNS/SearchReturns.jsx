import React, {
  useMemo,
  useState,
} from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const CIR_STATUSES = [
  "CREATED",
  "CANCELED",
  "COMPLETE",
  "NOT_RECEIVED",
];

const RTO_STATUSES = [
  "RECEIVED",
  "NOT_RECEIVED",
];

function SearchReturns() {
  const [facility, setFacility] =
    useState("MAIN");

  const [returnType, setReturnType] =
    useState("CIR");

  const [statusCode, setStatusCode] =
    useState("");

  const [forwardItemFacility, setForwardItemFacility] =
    useState("");

  const [dateMode, setDateMode] =
    useState("CREATED");

  const [createdFrom, setCreatedFrom] =
    useState("");

  const [createdTo, setCreatedTo] =
    useState("");

  const [updatedFrom, setUpdatedFrom] =
    useState("");

  const [updatedTo, setUpdatedTo] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Statuses depend on return type
  // --------------------------------------------------
  const availableStatuses =
    returnType === "CIR"
      ? CIR_STATUSES
      : RTO_STATUSES;

  // --------------------------------------------------
  // Request Preview
  // --------------------------------------------------
  const requestPreview =
    useMemo(() => {
      const payload = {
        facility,
        returnType,
      };

      if (statusCode) {
        payload.statusCode =
          statusCode;
      }

      if (
        forwardItemFacility.trim()
      ) {
        payload.forwardItemFacility =
          forwardItemFacility;
      }

      if (dateMode === "CREATED") {
        payload.createdFrom =
          createdFrom || null;

        payload.createdTo =
          createdTo || null;

        payload.updatedFrom =
          null;

        payload.updatedTo =
          null;
      } else {
        payload.updatedFrom =
          updatedFrom || null;

        payload.updatedTo =
          updatedTo || null;

        payload.createdFrom =
          null;

        payload.createdTo =
          null;
      }

      return payload;
    }, [
      facility,
      returnType,
      statusCode,
      forwardItemFacility,
      dateMode,
      createdFrom,
      createdTo,
      updatedFrom,
      updatedTo,
    ]);

  // --------------------------------------------------
  // Return type change
  // --------------------------------------------------
  const handleReturnTypeChange = (
    value
  ) => {
    setReturnType(value);
    setStatusCode("");
  };

  // --------------------------------------------------
  // Date mode change
  // --------------------------------------------------
  const handleDateModeChange = (
    value
  ) => {
    setDateMode(value);

    if (value === "CREATED") {
      setUpdatedFrom("");
      setUpdatedTo("");
    } else {
      setCreatedFrom("");
      setCreatedTo("");
    }
  };

  // --------------------------------------------------
  // Clear
  // --------------------------------------------------
  const handleClear = () => {
    setFacility("MAIN");
    setReturnType("CIR");
    setStatusCode("");
    setForwardItemFacility("");
    setDateMode("CREATED");
    setCreatedFrom("");
    setCreatedTo("");
    setUpdatedFrom("");
    setUpdatedTo("");
    setResult(null);
    setError("");
  };

  // --------------------------------------------------
  // Validate date format
  // --------------------------------------------------
  const isValidUniwareDate =
    (value) => {
      if (!value) {
        return true;
      }

      return /^\d{1,2}-[A-Za-z]{3}-\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(
        value
      );
    };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!facility.trim()) {
      setError(
        "Facility is required."
      );
      return;
    }

    if (
      !["CIR", "RTO"].includes(
        returnType
      )
    ) {
      setError(
        "Return type must be CIR or RTO."
      );
      return;
    }

    if (
      statusCode &&
      !availableStatuses.includes(
        statusCode
      )
    ) {
      setError(
        `Invalid status for ${returnType}.`
      );
      return;
    }

    // ------------------------------------------------
    // Validate created date range
    // ------------------------------------------------
    if (
      dateMode === "CREATED"
    ) {
      if (
        (createdFrom &&
          !createdTo) ||
        (!createdFrom &&
          createdTo)
      ) {
        setError(
          "Both Created From and Created To are required."
        );
        return;
      }

      if (
        createdFrom &&
        !isValidUniwareDate(
          createdFrom
        )
      ) {
        setError(
          "Created From must use format: dd-mmm-yyyy HH:mm:ss"
        );
        return;
      }

      if (
        createdTo &&
        !isValidUniwareDate(
          createdTo
        )
      ) {
        setError(
          "Created To must use format: dd-mmm-yyyy HH:mm:ss"
        );
        return;
      }
    }

    // ------------------------------------------------
    // Validate updated date range
    // ------------------------------------------------
    if (
      dateMode === "UPDATED"
    ) {
      if (
        (updatedFrom &&
          !updatedTo) ||
        (!updatedFrom &&
          updatedTo)
      ) {
        setError(
          "Both Updated From and Updated To are required."
        );
        return;
      }

      if (
        updatedFrom &&
        !isValidUniwareDate(
          updatedFrom
        )
      ) {
        setError(
          "Updated From must use format: dd-mmm-yyyy HH:mm:ss"
        );
        return;
      }

      if (
        updatedTo &&
        !isValidUniwareDate(
          updatedTo
        )
      ) {
        setError(
          "Updated To must use format: dd-mmm-yyyy HH:mm:ss"
        );
        return;
      }
    }

    try {
      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/returns/search`,
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
          "Failed to search returns."
      );

      setResult(
        apiError || null
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const formatValue = (
    value,
    fallback = "N/A"
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return fallback;
    }

    return String(value);
  };

  const returnOrders =
    Array.isArray(
      result?.returnOrders
    )
      ? result.returnOrders
      : [];

  // --------------------------------------------------
  // Styles
  // --------------------------------------------------
  const styles = {
    page: {
      padding: 24,
      maxWidth: 1400,
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

    help: {
      fontSize: 12,
      color: "#777",
      lineHeight: 1.5,
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
      padding: "10px 18px",
      border:
        "1px solid #777",
      borderRadius: 6,
      background: "#fff",
      color: "#333",
      cursor: "pointer",
      fontWeight: 600,
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

    info: {
      padding: 14,
      background: "#e3f2fd",
      border:
        "1px solid #90caf9",
      borderRadius: 6,
      color: "#0d47a1",
      marginBottom: 20,
      lineHeight: 1.5,
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse:
        "collapse",
      minWidth: 650,
    },

    th: {
      border:
        "1px solid #ddd",
      padding: 11,
      background: "#f5f5f5",
      textAlign: "left",
      fontSize: 13,
    },

    td: {
      border:
        "1px solid #ddd",
      padding: 11,
      fontSize: 13,
    },

    badge: {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: 12,
      background: "#eee",
      fontWeight: 600,
      fontSize: 12,
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
        Search Returns
      </h1>

      <div style={styles.subtitle}>
        Search Uniware returns using CIR or
        RTO return type, status, facility and
        a maximum 30-day date range.
      </div>

      <div style={styles.info}>
        <strong>Search rules:</strong>
        <br />
        • CIR supports CREATED, CANCELED,
        COMPLETE and NOT_RECEIVED.
        <br />
        • RTO supports RECEIVED and
        NOT_RECEIVED.
        <br />
        • Use either Created dates or Updated
        dates, not both.
        <br />
        • The selected date range must not
        exceed 30 days.
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
            "Returns retrieved successfully."}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
      >
        {/* -------------------------------------- */}
        {/* Search Filters */}
        {/* -------------------------------------- */}

        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Search Filters
          </div>

          <div style={styles.grid}>
            {/* Facility */}
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

            {/* Return Type */}
            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Return Type *
              </label>

              <select
                style={styles.select}
                value={returnType}
                onChange={(event) =>
                  handleReturnTypeChange(
                    event.target
                      .value
                  )
                }
              >
                <option value="CIR">
                  CIR
                </option>

                <option value="RTO">
                  RTO
                </option>
              </select>
            </div>

            {/* Status */}
            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Status
              </label>

              <select
                style={styles.select}
                value={statusCode}
                onChange={(event) =>
                  setStatusCode(
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  All Statuses
                </option>

                {availableStatuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Forward Facility */}
            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Forward Item Facility
              </label>

              <input
                style={styles.input}
                value={
                  forwardItemFacility
                }
                onChange={(event) =>
                  setForwardItemFacility(
                    event.target.value
                  )
                }
                placeholder="GGN"
              />
            </div>
          </div>
        </div>

        {/* -------------------------------------- */}
        {/* Date Filters */}
        {/* -------------------------------------- */}

        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Date Range
          </div>

          <div style={styles.grid}>
            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Date Filter
              </label>

              <select
                style={styles.select}
                value={dateMode}
                onChange={(event) =>
                  handleDateModeChange(
                    event.target
                      .value
                  )
                }
              >
                <option value="CREATED">
                  Created Date
                </option>

                <option value="UPDATED">
                  Updated Date
                </option>
              </select>
            </div>

            {dateMode ===
              "CREATED" ? (
              <>
                <div
                  style={styles.field}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Created From
                  </label>

                  <input
                    style={
                      styles.input
                    }
                    value={
                      createdFrom
                    }
                    onChange={(
                      event
                    ) =>
                      setCreatedFrom(
                        event.target
                          .value
                      )
                    }
                    placeholder="16-Oct-2022 00:00:00"
                  />

                  <div
                    style={
                      styles.help
                    }
                  >
                    Format:
                    dd-mmm-yyyy
                    HH:mm:ss
                  </div>
                </div>

                <div
                  style={styles.field}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Created To
                  </label>

                  <input
                    style={
                      styles.input
                    }
                    value={
                      createdTo
                    }
                    onChange={(
                      event
                    ) =>
                      setCreatedTo(
                        event.target
                          .value
                      )
                    }
                    placeholder="15-Nov-2022 23:59:59"
                  />
                </div>
              </>
            ) : (
              <>
                <div
                  style={styles.field}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Updated From
                  </label>

                  <input
                    style={
                      styles.input
                    }
                    value={
                      updatedFrom
                    }
                    onChange={(
                      event
                    ) =>
                      setUpdatedFrom(
                        event.target
                          .value
                      )
                    }
                    placeholder="16-Sep-2021 00:00:00"
                  />

                  <div
                    style={
                      styles.help
                    }
                  >
                    Format:
                    dd-mmm-yyyy
                    HH:mm:ss
                  </div>
                </div>

                <div
                  style={styles.field}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Updated To
                  </label>

                  <input
                    style={
                      styles.input
                    }
                    value={
                      updatedTo
                    }
                    onChange={(
                      event
                    ) =>
                      setUpdatedTo(
                        event.target
                          .value
                      )
                    }
                    placeholder="15-Oct-2021 23:59:59"
                  />
                </div>
              </>
            )}
          </div>

          <div
            style={{
              ...styles.help,
              marginTop: 14,
            }}
          >
            Uniware allows a maximum
            difference of 30 days between
            From and To.
          </div>
        </div>

        {/* -------------------------------------- */}
        {/* Actions */}
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
                ? "Searching..."
                : "Search Returns"}
            </button>

            <button
              type="button"
              style={
                styles.secondaryButton
              }
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* -------------------------------------- */}
      {/* Results */}
      {/* -------------------------------------- */}

      {result &&
        result.successful && (
          <div style={styles.card}>
            <div
              style={styles.sectionTitle}
            >
              Search Results
            </div>

            <div
              style={{
                marginBottom: 16,
              }}
            >
              <strong>
                Return Type:
              </strong>{" "}
              <span
                style={
                  styles.badge
                }
              >
                {formatValue(
                  result.returnType
                )}
              </span>

              <span
                style={{
                  marginLeft: 12,
                }}
              >
                <strong>
                  Total:
                </strong>{" "}
                {returnOrders.length}
              </span>
            </div>

            {returnOrders.length ===
            0 ? (
              <div
                style={{
                  padding: 20,
                  textAlign:
                    "center",
                  color: "#666",
                }}
              >
                No returns found for
                the selected filters.
              </div>
            ) : (
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
                        #
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Return Code
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Created
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Updated
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {returnOrders.map(
                      (
                        order,
                        index
                      ) => (
                        <tr
                          key={
                            `${order.code}-${index}`
                          }
                        >
                          <td
                            style={
                              styles.td
                            }
                          >
                            {index +
                              1}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatValue(
                              order.code
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatValue(
                              order.created
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatValue(
                              order.updated
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      {/* -------------------------------------- */}
      {/* Errors */}
      {/* -------------------------------------- */}

      {result &&
        Array.isArray(
          result.errors
        ) &&
        result.errors.length > 0 && (
          <div style={styles.card}>
            <div
              style={styles.sectionTitle}
            >
              Uniware Errors
            </div>

            <div style={styles.error}>
              <ul>
                {result.errors.map(
                  (
                    item,
                    index
                  ) => (
                    <li key={index}>
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
          </div>
        )}

      {/* -------------------------------------- */}
      {/* Warnings */}
      {/* -------------------------------------- */}

      {result &&
        Array.isArray(
          result.warnings
        ) &&
        result.warnings.length > 0 && (
          <div style={styles.card}>
            <div
              style={styles.sectionTitle}
            >
              Uniware Warnings
            </div>

            <div
              style={{
                padding: 14,
                background:
                  "#fff8e1",
                border:
                  "1px solid #ffe082",
                borderRadius: 6,
              }}
            >
              <ul>
                {result.warnings.map(
                  (
                    item,
                    index
                  ) => (
                    <li key={index}>
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
          </div>
        )}

      {/* -------------------------------------- */}
      {/* Raw Response */}
      {/* -------------------------------------- */}

      {result && (
        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Raw Response
          </div>

          <pre style={styles.pre}>
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

export default SearchReturns;