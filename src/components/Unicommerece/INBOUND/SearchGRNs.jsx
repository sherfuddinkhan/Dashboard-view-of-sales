import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const RANGE_OPTIONS = [
  "TODAY",
  "YESTERDAY",
  "LAST_WEEK",
  "LAST_MONTH",
  "THIS_MONTH",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "LAST_60_DAYS",
  "LAST_90_DAYS",
  "LAST_QUARTER",
  "THIS_QUARTER",
];

const SearchGRNs = () => {
  const [form, setForm] = useState({
    facility: "",
    purchaseOrderCode: "",
    textRange: "TODAY",
    start: "",
    end: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearForm = () => {
    setForm({
      facility: "",
      purchaseOrderCode: "",
      textRange: "TODAY",
      start: "",
      end: "",
    });

    setResponse(null);
    setError("");
  };

  const convertToUTC = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!form.facility.trim()) {
      setError("Facility code is required.");
      return;
    }

    if (!form.start) {
      setError("Start date/time is required.");
      return;
    }

    if (!form.end) {
      setError("End date/time is required.");
      return;
    }

    const startUTC = convertToUTC(form.start);
    const endUTC = convertToUTC(form.end);

    if (!startUTC || !endUTC) {
      setError(
        "Please enter valid start and end date/time values."
      );
      return;
    }

    if (
      new Date(form.start).getTime() >
      new Date(form.end).getTime()
    ) {
      setError(
        "Start date/time cannot be greater than end date/time."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        facility: form.facility.trim(),

        createdBetween: {
          start: startUTC,
          end: endUTC,
          textRange: form.textRange,
        },
      };

      if (form.purchaseOrderCode.trim()) {
        payload.purchaseOrderCode =
          form.purchaseOrderCode.trim();
      }

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/grn/search`,
        payload
      );

      setResponse(res.data);

      if (res.data?.successful === false) {
        setError(
          res.data?.message ||
            "Uniware could not search the GRNs."
        );
      }
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          data?.error ||
          err.message ||
          "Failed to search GRNs."
      );

      setResponse(data || null);
    } finally {
      setLoading(false);
    }
  };

  const grnCodes = useMemo(() => {
    return response?.inflowReceiptCodes || [];
  }, [response]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Search GRNs
          </h1>

          <p style={styles.subtitle}>
            Search Uniware GRNs using Purchase Order
            and creation date filters.
          </p>
        </div>

        {/* Search Form */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Search Filters
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              {/* Facility */}
              <div>
                <label style={styles.label}>
                  Facility Code *
                </label>

                <input
                  type="text"
                  name="facility"
                  value={form.facility}
                  onChange={handleChange}
                  placeholder="Example: MAIN"
                  style={styles.input}
                />
              </div>

              {/* PO */}
              <div>
                <label style={styles.label}>
                  Purchase Order Code
                </label>

                <input
                  type="text"
                  name="purchaseOrderCode"
                  value={form.purchaseOrderCode}
                  onChange={handleChange}
                  placeholder="Example: PO0194"
                  style={styles.input}
                />
              </div>

              {/* Text Range */}
              <div>
                <label style={styles.label}>
                  Date Range *
                </label>

                <select
                  name="textRange"
                  value={form.textRange}
                  onChange={handleChange}
                  style={styles.input}
                >
                  {RANGE_OPTIONS.map((range) => (
                    <option
                      key={range}
                      value={range}
                    >
                      {range.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start */}
              <div>
                <label style={styles.label}>
                  Start Date/Time *
                </label>

                <input
                  type="datetime-local"
                  name="start"
                  value={form.start}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* End */}
              <div>
                <label style={styles.label}>
                  End Date/Time *
                </label>

                <input
                  type="datetime-local"
                  name="end"
                  value={form.end}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={loading}
                style={styles.primaryButton}
              >
                {loading
                  ? "Searching..."
                  : "Search GRNs"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                style={styles.secondaryButton}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Response Message */}
        {response && (
          <>
            <div style={styles.summaryCard}>
              <div>
                <div style={styles.summaryLabel}>
                  Response
                </div>

                <div style={styles.summaryValue}>
                  {response.message ||
                    "No message"}
                </div>
              </div>

              <div>
                <div style={styles.summaryLabel}>
                  Total GRNs
                </div>

                <div style={styles.count}>
                  {grnCodes.length}
                </div>
              </div>

              <div>
                <div style={styles.summaryLabel}>
                  Status
                </div>

                <span
                  style={{
                    ...styles.status,
                    background:
                      response.successful
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      response.successful
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {response.successful
                    ? "SUCCESS"
                    : "FAILED"}
                </span>
              </div>
            </div>

            {/* Errors */}
            {response.errors?.length > 0 && (
              <div style={styles.errorCard}>
                <h2 style={styles.errorTitle}>
                  Errors
                </h2>

                {response.errors.map(
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
                          Code: {item.code}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Warnings */}
            {response.warnings?.length > 0 && (
              <div style={styles.warningCard}>
                <h2 style={styles.warningTitle}>
                  Warnings
                </h2>

                {response.warnings.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={styles.warningItem}
                    >
                      <strong>
                        {item.code !== undefined
                          ? `Code ${item.code}: `
                          : ""}
                      </strong>

                      {item.message ||
                        item.description ||
                        "Warning"}
                    </div>
                  )
                )}
              </div>
            )}

            {/* GRN Codes */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    GRN Results
                  </h2>

                  <p style={styles.resultText}>
                    {grnCodes.length} GRN
                    {grnCodes.length === 1
                      ? ""
                      : "s"} found
                  </p>
                </div>
              </div>

              {grnCodes.length === 0 ? (
                <div style={styles.empty}>
                  No GRNs found for the selected
                  filters.
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
                          GRN / Inflow Receipt Code
                        </th>

                        <th style={styles.th}>
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {grnCodes.map(
                        (code, index) => (
                          <tr key={`${code}-${index}`}>
                            <td style={styles.td}>
                              {index + 1}
                            </td>

                            <td
                              style={{
                                ...styles.td,
                                fontWeight: 600,
                              }}
                            >
                              {code}
                            </td>

                            <td style={styles.td}>
                              <button
                                type="button"
                                style={
                                  styles.viewButton
                                }
                                onClick={() => {
                                  window.open(
                                    `/purchase-orders/grn?code=${encodeURIComponent(
                                      code
                                    )}`,
                                    "_self"
                                  );
                                }}
                              >
                                View GRN
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Raw response */}
            <div style={styles.card}>
              <details>
                <summary
                  style={styles.rawSummary}
                >
                  View Raw Uniware Response
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
          </>
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
    maxWidth: "1300px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    color: "#172033",
  },

  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "15px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
    color: "#172033",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: 600,
    fontSize: "14px",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
    background: "#ffffff",
    outline: "none",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "22px",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    padding: "12px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  viewButton: {
    border: "none",
    background: "#0f766e",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },

  errorBox: {
    marginTop: "18px",
    padding: "12px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "7px",
  },

  summaryCard: {
    display: "grid",
    gridTemplateColumns:
      "2fr 1fr 1fr",
    gap: "15px",
    background: "#ffffff",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  summaryLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 600,
    marginBottom: "6px",
  },

  summaryValue: {
    fontSize: "15px",
    color: "#172033",
  },

  count: {
    fontSize: "25px",
    fontWeight: 700,
    color: "#2563eb",
  },

  status: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },

  errorCard: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: "18px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  errorTitle: {
    marginTop: 0,
    color: "#991b1b",
  },

  errorItem: {
    padding: "9px 0",
    color: "#7f1d1d",
    borderBottom:
      "1px solid #fecaca",
  },

  warningCard: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    padding: "18px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  warningTitle: {
    marginTop: 0,
    color: "#92400e",
  },

  warningItem: {
    padding: "8px 0",
    color: "#78350f",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultText: {
    margin: "0 0 18px",
    color: "#64748b",
    fontSize: "14px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
  },

  td: {
    border: "1px solid #e2e8f0",
    padding: "12px",
    fontSize: "13px",
  },

  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
    background: "#f8fafc",
    borderRadius: "8px",
  },

  rawSummary: {
    cursor: "pointer",
    fontWeight: 600,
    color: "#334155",
  },

  rawResponse: {
    marginTop: "15px",
    padding: "15px",
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default SearchGRNs;