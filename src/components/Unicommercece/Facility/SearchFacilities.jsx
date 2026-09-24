import React, {
  useMemo,
  useState,
} from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const FACILITY_STATUSES = [
  "ALL",
  "ENABLED",
  "DISABLED",
];

const DATE_TYPES = [
  "CREATED",
  "UPDATED",
];

function SearchFacilities() {
  const getDefaultFromDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    return date.toISOString().slice(0, 16);
  };

  const getDefaultToDate = () => {
    return new Date()
      .toISOString()
      .slice(0, 16);
  };

  const [facilityStatus, setFacilityStatus] =
    useState("ALL");

  const [fromDate, setFromDate] =
    useState(getDefaultFromDate());

  const [toDate, setToDate] =
    useState(getDefaultToDate());

  const [dateType, setDateType] =
    useState("UPDATED");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ------------------------------------------------------------
  // Styles
  // ------------------------------------------------------------

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f7fb",
      padding: "30px",
      fontFamily:
        "Arial, Helvetica, sans-serif",
    },

    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },

    header: {
      background: "#fff",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow:
        "0 2px 10px rgba(0,0,0,0.06)",
    },

    title: {
      margin: 0,
      fontSize: "26px",
      color: "#172033",
    },

    subtitle: {
      marginTop: "8px",
      color: "#667085",
      fontSize: "14px",
      lineHeight: 1.5,
    },

    card: {
      background: "#fff",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow:
        "0 2px 10px rgba(0,0,0,0.06)",
    },

    sectionTitle: {
      margin: "0 0 18px",
      fontSize: "18px",
      color: "#172033",
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(230px, 1fr))",
      gap: "16px",
    },

    field: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
    },

    label: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#344054",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: "1px solid #d0d5dd",
      borderRadius: "8px",
      fontSize: "14px",
    },

    select: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: "1px solid #d0d5dd",
      borderRadius: "8px",
      fontSize: "14px",
      background: "#fff",
    },

    buttonRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "20px",
    },

    primaryButton: {
      border: 0,
      borderRadius: "8px",
      padding: "12px 20px",
      background: "#2563eb",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    },

    secondaryButton: {
      border: "1px solid #d0d5dd",
      borderRadius: "8px",
      padding: "11px 18px",
      background: "#fff",
      color: "#344054",
      fontWeight: 600,
      cursor: "pointer",
    },

    errorBox: {
      padding: "14px 16px",
      borderRadius: "8px",
      background: "#fef3f2",
      border: "1px solid #fecdca",
      color: "#b42318",
      marginBottom: "16px",
    },

    successBox: {
      padding: "14px 16px",
      borderRadius: "8px",
      background: "#ecfdf3",
      border: "1px solid #abefc6",
      color: "#067647",
      marginBottom: "16px",
    },

    tableWrapper: {
      overflowX: "auto",
      border: "1px solid #eaecf0",
      borderRadius: "10px",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "650px",
    },

    th: {
      padding: "12px 14px",
      textAlign: "left",
      background: "#f9fafb",
      borderBottom:
        "1px solid #eaecf0",
      fontSize: "13px",
      color: "#475467",
    },

    td: {
      padding: "13px 14px",
      borderBottom:
        "1px solid #f2f4f7",
      fontSize: "14px",
      color: "#344054",
    },

    status: {
      display: "inline-block",
      padding: "4px 9px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
    },

    raw: {
      background: "#0f172a",
      color: "#e2e8f0",
      padding: "18px",
      borderRadius: "10px",
      overflow: "auto",
      fontSize: "13px",
      lineHeight: 1.5,
    },
  };

  // ------------------------------------------------------------
  // Facilities
  // ------------------------------------------------------------

  const facilities = useMemo(() => {
    if (!result?.parties) {
      return [];
    }

    return Array.isArray(result.parties)
      ? result.parties
      : [];
  }, [result]);

  // ------------------------------------------------------------
  // Search
  // ------------------------------------------------------------

  const handleSearch = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!fromDate) {
      setError(
        "From date is required."
      );
      return;
    }

    if (!toDate) {
      setError(
        "To date is required."
      );
      return;
    }

    const from = new Date(
      fromDate
    );

    const to = new Date(
      toDate
    );

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime())
    ) {
      setError(
        "Please enter valid dates."
      );
      return;
    }

    if (from > to) {
      setError(
        "From date cannot be later than to date."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        facilityStatus,
        fromDate:
          from.toISOString(),
        toDate:
          to.toISOString(),
        dateType,
      };

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/facilities/search`,
          payload
        );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to search facilities."
      );

      setResult(
        err.response?.data || null
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------

  const handleReset = () => {
    setFacilityStatus("ALL");
    setFromDate(
      getDefaultFromDate()
    );
    setToDate(
      getDefaultToDate()
    );
    setDateType("UPDATED");
    setResult(null);
    setError("");
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Search Facilities
          </h1>

          <p style={styles.subtitle}>
            Search all facilities and
            warehouses available to your
            Uniware tenant based on status
            and creation/update date.
          </p>
        </div>

        {/* -------------------------------------------------- */}
        {/* Search Form */}
        {/* -------------------------------------------------- */}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Search Criteria
          </h2>

          <form
            onSubmit={handleSearch}
          >
            <div style={styles.grid}>
              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Facility Status *
                </label>

                <select
                  style={styles.select}
                  value={facilityStatus}
                  onChange={(e) =>
                    setFacilityStatus(
                      e.target.value
                    )
                  }
                >
                  {FACILITY_STATUSES.map(
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

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Date Type *
                </label>

                <select
                  style={styles.select}
                  value={dateType}
                  onChange={(e) =>
                    setDateType(
                      e.target.value
                    )
                  }
                >
                  {DATE_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  From Date *
                </label>

                <input
                  type="datetime-local"
                  style={styles.input}
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(
                      e.target.value
                    )
                  }
                />
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  To Date *
                </label>

                <input
                  type="datetime-local"
                  style={styles.input}
                  value={toDate}
                  onChange={(e) =>
                    setToDate(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="submit"
                style={{
                  ...styles.primaryButton,
                  opacity: loading
                    ? 0.7
                    : 1,
                }}
                disabled={loading}
              >
                {loading
                  ? "Searching..."
                  : "Search Facilities"}
              </button>

              <button
                type="button"
                style={
                  styles.secondaryButton
                }
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* -------------------------------------------------- */}
        {/* Error */}
        {/* -------------------------------------------------- */}

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* Results */}
        {/* -------------------------------------------------- */}

        {result && (
          <div style={styles.card}>
            {result.successful && (
              <div
                style={styles.successBox}
              >
                <strong>
                  Facility search completed.
                </strong>

                <div
                  style={{
                    marginTop: "6px",
                  }}
                >
                  Facilities found:{" "}
                  <strong>
                    {facilities.length}
                  </strong>
                </div>
              </div>
            )}

            <h2 style={styles.sectionTitle}>
              Facilities
            </h2>

            {facilities.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#667085",
                  border:
                    "1px solid #eaecf0",
                  borderRadius: "8px",
                }}
              >
                No facilities found for
                the selected criteria.
              </div>
            ) : (
              <div
                style={styles.tableWrapper}
              >
                <table
                  style={styles.table}
                >
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        #
                      </th>

                      <th style={styles.th}>
                        Facility Code
                      </th>

                      <th style={styles.th}>
                        Status
                      </th>

                      <th style={styles.th}>
                        Created
                      </th>

                      <th style={styles.th}>
                        Updated
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {facilities.map(
                      (
                        facility,
                        index
                      ) => (
                        <tr
                          key={
                            facility.facilityCode ||
                            index
                          }
                        >
                          <td
                            style={styles.td}
                          >
                            {index + 1}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              fontWeight: 600,
                            }}
                          >
                            {
                              facility.facilityCode
                            }
                          </td>

                          <td
                            style={styles.td}
                          >
                            <span
                              style={{
                                ...styles.status,
                                background:
                                  facility.facilityStatus ===
                                  "ENABLED"
                                    ? "#ecfdf3"
                                    : "#f2f4f7",
                                color:
                                  facility.facilityStatus ===
                                  "ENABLED"
                                    ? "#067647"
                                    : "#475467",
                              }}
                            >
                              {
                                facility.facilityStatus
                              }
                            </span>
                          </td>

                          <td
                            style={styles.td}
                          >
                            {facility.created
                              ? new Date(
                                  facility.created
                                ).toLocaleString()
                              : "-"}
                          </td>

                          <td
                            style={styles.td}
                          >
                            {facility.updated
                              ? new Date(
                                  facility.updated
                                ).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* Raw Response */}
            {/* ------------------------------------------------ */}

            <h2
              style={{
                ...styles.sectionTitle,
                marginTop: "28px",
              }}
            >
              API Response
            </h2>

            <pre style={styles.raw}>
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchFacilities;