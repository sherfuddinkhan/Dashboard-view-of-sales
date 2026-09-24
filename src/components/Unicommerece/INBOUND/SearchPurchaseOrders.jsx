import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const SearchPurchaseOrders = () => {
  const getDefaultStartDate = () => {
    const date = new Date();

    date.setDate(date.getDate() - 30);

    return formatDateTimeLocal(date);
  };

  const getDefaultEndDate = () => {
    return formatDateTimeLocal(new Date());
  };

  const [approvedStart, setApprovedStart] =
    useState(getDefaultStartDate());

  const [approvedEnd, setApprovedEnd] =
    useState(getDefaultEndDate());

  const [createdStart, setCreatedStart] =
    useState(getDefaultStartDate());

  const [createdEnd, setCreatedEnd] =
    useState(getDefaultEndDate());

  const [purchaseOrderCodes, setPurchaseOrderCodes] =
    useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [warnings, setWarnings] = useState([]);

  const [copiedCode, setCopiedCode] = useState("");

  const [searchPerformed, setSearchPerformed] =
    useState(false);

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------

  const searchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setWarnings([]);
      setCopiedCode("");

      if (!approvedStart || !approvedEnd) {
        setError(
          "Approved start and end dates are required."
        );

        return;
      }

      if (!createdStart || !createdEnd) {
        setError(
          "Created start and end dates are required."
        );

        return;
      }

      const approvedStartDate =
        new Date(approvedStart);

      const approvedEndDate =
        new Date(approvedEnd);

      const createdStartDate =
        new Date(createdStart);

      const createdEndDate =
        new Date(createdEnd);

      if (
        approvedStartDate > approvedEndDate
      ) {
        setError(
          "Approved start date cannot be after the end date."
        );

        return;
      }

      if (
        createdStartDate > createdEndDate
      ) {
        setError(
          "Created start date cannot be after the end date."
        );

        return;
      }

      const payload = {
        approvedBetween: {
          start:
            approvedStartDate.toISOString(),

          end:
            approvedEndDate.toISOString(),
        },

        createdBetween: {
          start:
            createdStartDate.toISOString(),

          end:
            createdEndDate.toISOString(),
        },
      };

      console.log(
        "Search Purchase Orders:",
        payload
      );

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders/search`,
        payload
      );

      const data = response.data;

      setSearchPerformed(true);

      if (data.successful === false) {
        setError(
          data.message ||
            "Failed to search purchase orders."
        );

        setPurchaseOrderCodes([]);

        setWarnings(
          Array.isArray(data.warnings)
            ? data.warnings
            : []
        );

        return;
      }

      const codes = Array.isArray(
        data.purchaseOrderCodes
      )
        ? data.purchaseOrderCodes
        : [];

      setPurchaseOrderCodes(codes);

      setMessage(
        data.message ||
          `Found ${codes.length} purchase order(s).`
      );

      setWarnings(
        Array.isArray(data.warnings)
          ? data.warnings
          : []
      );
    } catch (err) {
      console.error(
        "Search Purchase Orders Error:",
        err
      );

      setSearchPerformed(true);

      setPurchaseOrderCodes([]);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to search purchase orders."
      );

      setWarnings(
        err.response?.data?.warnings || []
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Reset
  // ---------------------------------------------------------

  const resetSearch = () => {
    setApprovedStart(
      getDefaultStartDate()
    );

    setApprovedEnd(
      getDefaultEndDate()
    );

    setCreatedStart(
      getDefaultStartDate()
    );

    setCreatedEnd(
      getDefaultEndDate()
    );

    setPurchaseOrderCodes([]);

    setLoading(false);

    setError("");

    setMessage("");

    setWarnings([]);

    setCopiedCode("");

    setSearchPerformed(false);
  };

  // ---------------------------------------------------------
  // Copy
  // ---------------------------------------------------------

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 1500);
    } catch (error) {
      console.error(
        "Unable to copy PO code",
        error
      );
    }
  };

  // ---------------------------------------------------------
  // Summary
  // ---------------------------------------------------------

  const resultCount = useMemo(
    () => purchaseOrderCodes.length,
    [purchaseOrderCodes]
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}

        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              Search Purchase Orders
            </h2>

            <div style={styles.subtitle}>
              Uniware Purchase Order Search
            </div>
          </div>

          <button
            type="button"
            onClick={resetSearch}
            style={styles.secondaryButton}
          >
            Reset
          </button>
        </div>

        {/* Filters */}

        <section style={styles.filterSection}>
          <h3 style={styles.sectionTitle}>
            Search Filters
          </h3>

          <div style={styles.filterGrid}>
            {/* Approved Start */}

            <div>
              <label style={styles.label}>
                Approved Start *
              </label>

              <input
                type="datetime-local"
                value={approvedStart}
                onChange={(e) =>
                  setApprovedStart(
                    e.target.value
                  )
                }
                style={styles.input}
              />
            </div>

            {/* Approved End */}

            <div>
              <label style={styles.label}>
                Approved End *
              </label>

              <input
                type="datetime-local"
                value={approvedEnd}
                onChange={(e) =>
                  setApprovedEnd(
                    e.target.value
                  )
                }
                style={styles.input}
              />
            </div>

            {/* Created Start */}

            <div>
              <label style={styles.label}>
                Created Start *
              </label>

              <input
                type="datetime-local"
                value={createdStart}
                onChange={(e) =>
                  setCreatedStart(
                    e.target.value
                  )
                }
                style={styles.input}
              />
            </div>

            {/* Created End */}

            <div>
              <label style={styles.label}>
                Created End *
              </label>

              <input
                type="datetime-local"
                value={createdEnd}
                onChange={(e) =>
                  setCreatedEnd(
                    e.target.value
                  )
                }
                style={styles.input}
              />
            </div>
          </div>

          {/* Actions */}

          <div style={styles.filterActions}>
            <button
              type="button"
              onClick={searchPurchaseOrders}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? "Searching..."
                : "Search Purchase Orders"}
            </button>

            <button
              type="button"
              onClick={resetSearch}
              disabled={loading}
              style={styles.secondaryButton}
            >
              Clear
            </button>
          </div>
        </section>

        {/* Error */}

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* Success/message */}

        {message && !error && (
          <div style={styles.success}>
            {message}
          </div>
        )}

        {/* Warnings */}

        {warnings.length > 0 && (
          <div style={styles.warning}>
            <strong>Warnings</strong>

            {warnings.map(
              (warning, index) => (
                <div key={index}>
                  {warning.message ||
                    warning.description ||
                    "Warning"}
                </div>
              )
            )}
          </div>
        )}

        {/* Statistics */}

        <div style={styles.statistics}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>
              Purchase Orders Found
            </div>

            <div style={styles.statValue}>
              {resultCount}
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>
              Search Status
            </div>

            <div
              style={{
                ...styles.statValue,
                fontSize: "18px",
              }}
            >
              {searchPerformed
                ? "Completed"
                : "Not searched"}
            </div>
          </div>
        </div>

        {/* Results */}

        <section style={styles.resultsSection}>
          <div style={styles.resultsHeader}>
            <div>
              <h3 style={styles.sectionTitle}>
                Purchase Order Codes
              </h3>

              <div style={styles.resultSubtitle}>
                {resultCount} record
                {resultCount === 1
                  ? ""
                  : "s"} found
              </div>
            </div>
          </div>

          {loading ? (
            <div style={styles.empty}>
              Searching Uniware purchase orders...
            </div>
          ) : !searchPerformed ? (
            <div style={styles.empty}>
              Select your date ranges and click
              <strong>
                {" "}
                Search Purchase Orders
              </strong>
              .
            </div>
          ) : purchaseOrderCodes.length ===
            0 ? (
            <div style={styles.empty}>
              No purchase orders found for the
              selected date ranges.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      #
                    </th>

                    <th style={styles.th}>
                      Purchase Order Code
                    </th>

                    <th style={styles.th}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {purchaseOrderCodes.map(
                    (code, index) => (
                      <tr
                        key={`${code}-${index}`}
                      >
                        <td style={styles.td}>
                          {index + 1}
                        </td>

                        <td style={styles.td}>
                          <strong>
                            {code}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          <button
                            type="button"
                            onClick={() =>
                              copyCode(code)
                            }
                            style={
                              styles.copyButton
                            }
                          >
                            {copiedCode ===
                            code
                              ? "Copied"
                              : "Copy"}
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Format datetime-local
|--------------------------------------------------------------------------
*/

function formatDateTimeLocal(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    padding: "24px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "#fff",
    borderRadius: "10px",
    padding: "24px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "18px",
    borderBottom: "1px solid #eee",
  },

  title: {
    margin: 0,
    fontSize: "26px",
  },

  subtitle: {
    color: "#777",
    marginTop: "5px",
  },

  filterSection: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "18px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 11px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    background: "#fff",
  },

  filterActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  primaryButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "5px",
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  secondaryButton: {
    padding: "10px 18px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "500",
  },

  statistics: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  statCard: {
    minWidth: "200px",
    padding: "16px",
    border: "1px solid #e2e2e2",
    borderRadius: "8px",
    background: "#fafafa",
  },

  statLabel: {
    fontSize: "12px",
    color: "#777",
  },

  statValue: {
    marginTop: "5px",
    fontSize: "24px",
    fontWeight: "700",
  },

  resultsSection: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
  },

  resultsHeader: {
    padding: "18px 20px",
    borderBottom: "1px solid #ddd",
    background: "#fafafa",
  },

  resultSubtitle: {
    marginTop: "5px",
    fontSize: "13px",
    color: "#777",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "13px",
    textAlign: "left",
    background: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    fontSize: "13px",
  },

  td: {
    padding: "13px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },

  copyButton: {
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
  },

  empty: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#777",
  },

  error: {
    padding: "13px",
    marginBottom: "18px",
    borderRadius: "6px",
    background: "#ffebee",
    color: "#c62828",
  },

  success: {
    padding: "13px",
    marginBottom: "18px",
    borderRadius: "6px",
    background: "#e8f5e9",
    color: "#2e7d32",
  },

  warning: {
    padding: "13px",
    marginBottom: "18px",
    borderRadius: "6px",
    background: "#fff8e1",
    color: "#8d6e00",
  },
};

export default SearchPurchaseOrders;