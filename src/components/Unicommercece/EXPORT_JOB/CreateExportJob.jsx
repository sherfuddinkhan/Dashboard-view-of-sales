import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const TEXT_RANGES = [
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

const FREQUENCIES = [
  "ONETIME",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
];

function CreateExportJob() {
  const [facility, setFacility] = useState("MAIN");

  const [exportJobTypeName, setExportJobTypeName] = useState(
    "Inventory Snapshot"
  );

  const [columnsText, setColumnsText] = useState(
    "SKU\nInventory\nOpen Sale\nOpen Purchase"
  );

  const [frequency, setFrequency] = useState("ONETIME");

  const [scheduleTime, setScheduleTime] = useState("");

  const [notificationEmail, setNotificationEmail] =
    useState("");

  const [cronExpression, setCronExpression] =
    useState("");

  const [reportName, setReportName] = useState("");

  const [filters, setFilters] = useState([
    {
      id: "",
      text: "",
      selectedValue: "",
      selectedValues: "",
      dateTime: "",
      start: "",
      end: "",
      textRange: "",
      checked: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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
        "repeat(auto-fit, minmax(240px, 1fr))",
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
      outline: "none",
    },

    textarea: {
      width: "100%",
      boxSizing: "border-box",
      minHeight: "130px",
      padding: "11px 12px",
      border: "1px solid #d0d5dd",
      borderRadius: "8px",
      fontSize: "14px",
      resize: "vertical",
      fontFamily: "inherit",
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

    filterCard: {
      border: "1px solid #e4e7ec",
      borderRadius: "10px",
      padding: "18px",
      marginBottom: "14px",
      background: "#fafbfc",
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

    dangerButton: {
      border: "1px solid #fda4af",
      borderRadius: "8px",
      padding: "9px 14px",
      background: "#fff",
      color: "#be123c",
      fontWeight: 600,
      cursor: "pointer",
    },

    result: {
      background: "#0f172a",
      color: "#e2e8f0",
      borderRadius: "10px",
      padding: "18px",
      overflow: "auto",
      fontSize: "13px",
      lineHeight: 1.5,
    },

    successBox: {
      padding: "14px 16px",
      borderRadius: "8px",
      background: "#ecfdf3",
      border: "1px solid #abefc6",
      color: "#067647",
      marginBottom: "15px",
    },

    errorBox: {
      padding: "14px 16px",
      borderRadius: "8px",
      background: "#fef3f2",
      border: "1px solid #fecdca",
      color: "#b42318",
      marginBottom: "15px",
    },
  };

  // ------------------------------------------------------------
  // Parse columns
  // ------------------------------------------------------------

  const columns = useMemo(() => {
    return columnsText
      .split(/\r?\n|,/)
      .map((column) => column.trim())
      .filter(Boolean);
  }, [columnsText]);

  // ------------------------------------------------------------
  // Filter helpers
  // ------------------------------------------------------------

  const updateFilter = (index, field, value) => {
    setFilters((current) =>
      current.map((filter, filterIndex) =>
        filterIndex === index
          ? {
              ...filter,
              [field]: value,
            }
          : filter
      )
    );
  };

  const addFilter = () => {
    setFilters((current) => [
      ...current,
      {
        id: "",
        text: "",
        selectedValue: "",
        selectedValues: "",
        dateTime: "",
        start: "",
        end: "",
        textRange: "",
        checked: true,
      },
    ]);
  };

  const removeFilter = (index) => {
    setFilters((current) =>
      current.filter(
        (_, filterIndex) => filterIndex !== index
      )
    );
  };

  // ------------------------------------------------------------
  // Build export filters
  // ------------------------------------------------------------

  const buildExportFilters = () => {
    return filters
      .map((filter) => {
        if (
          !filter.id ||
          String(filter.id).trim() === ""
        ) {
          return null;
        }

        const item = {
          id: Number(filter.id),
        };

        if (filter.text.trim()) {
          item.text = filter.text.trim();
        }

        if (filter.selectedValue.trim()) {
          item.selectedValue =
            filter.selectedValue.trim();
        }

        if (filter.selectedValues.trim()) {
          item.selectedValues =
            filter.selectedValues
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean);
        }

        if (filter.dateTime) {
          item.dateTime = new Date(
            filter.dateTime
          ).toISOString();
        }

        const dateRange = {};

        if (filter.start) {
          dateRange.start = new Date(
            filter.start
          ).toISOString();
        }

        if (filter.end) {
          dateRange.end = new Date(
            filter.end
          ).toISOString();
        }

        if (filter.textRange) {
          dateRange.textRange =
            filter.textRange;
        }

        if (Object.keys(dateRange).length > 0) {
          item.dateRange = dateRange;
        }

        item.checked = Boolean(filter.checked);

        return item;
      })
      .filter(Boolean);
  };

  // ------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!facility.trim()) {
      setError("Facility is required.");
      return;
    }

    if (!exportJobTypeName.trim()) {
      setError(
        "Export Job Type / Report Name is required."
      );
      return;
    }

    if (columns.length === 0) {
      setError(
        "Enter at least one export column."
      );
      return;
    }

    if (!frequency.trim()) {
      setError("Frequency is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        facility: facility.trim(),
        exportJobTypeName:
          exportJobTypeName.trim(),
        exportColums: columns,
        frequency: frequency.trim(),
      };

      const exportFilters =
        buildExportFilters();

      if (exportFilters.length > 0) {
        payload.exportFilters = exportFilters;
      }

      if (scheduleTime) {
        payload.scheduleTime = new Date(
          scheduleTime
        ).toISOString();
      }

      if (notificationEmail.trim()) {
        payload.notificationEmail =
          notificationEmail.trim();
      }

      if (cronExpression.trim()) {
        payload.cronExpression =
          cronExpression.trim();
      }

      if (reportName.trim()) {
        payload.reportName =
          reportName.trim();
      }

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/export-jobs/create`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create export job."
      );

      setResult(
        err.response?.data || null
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Create Uniware Export Job
          </h1>

          <p style={styles.subtitle}>
            Create an asynchronous Uniware CSV export
            job by selecting a report, columns and
            optional filters.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ------------------------------------------------ */}
          {/* Basic information */}
          {/* ------------------------------------------------ */}

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Export Job Information
            </h2>

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
                  Export Job Type Name *
                </label>

                <input
                  style={styles.input}
                  value={exportJobTypeName}
                  onChange={(e) =>
                    setExportJobTypeName(
                      e.target.value
                    )
                  }
                  placeholder="Inventory Snapshot"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Frequency *
                </label>

                <select
                  style={styles.select}
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value)
                  }
                >
                  {FREQUENCIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Report Name
                </label>

                <input
                  style={styles.input}
                  value={reportName}
                  onChange={(e) =>
                    setReportName(e.target.value)
                  }
                  placeholder="Inventory Snapshot Export"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Notification Email
                </label>

                <input
                  type="email"
                  style={styles.input}
                  value={notificationEmail}
                  onChange={(e) =>
                    setNotificationEmail(
                      e.target.value
                    )
                  }
                  placeholder="user@example.com"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Schedule Time
                </label>

                <input
                  type="datetime-local"
                  style={styles.input}
                  value={scheduleTime}
                  onChange={(e) =>
                    setScheduleTime(
                      e.target.value
                    )
                  }
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Cron Expression
                </label>

                <input
                  style={styles.input}
                  value={cronExpression}
                  onChange={(e) =>
                    setCronExpression(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* Columns */}
          {/* ------------------------------------------------ */}

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Export Columns *
            </h2>

            <div style={styles.field}>
              <label style={styles.label}>
                Enter one column per line
              </label>

              <textarea
                style={styles.textarea}
                value={columnsText}
                onChange={(e) =>
                  setColumnsText(
                    e.target.value
                  )
                }
                placeholder={
                  "SKU\nInventory\nOpen Sale\nOpen Purchase"
                }
              />
            </div>

            <div
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: "#667085",
              }}
            >
              Columns detected:{" "}
              <strong>
                {columns.length}
              </strong>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* Filters */}
          {/* ------------------------------------------------ */}

          <div style={styles.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "18px",
              }}
            >
              <h2
                style={{
                  ...styles.sectionTitle,
                  marginBottom: 0,
                }}
              >
                Export Filters
              </h2>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={addFilter}
              >
                + Add Filter
              </button>
            </div>

            {filters.map((filter, index) => (
              <div
                key={index}
                style={styles.filterCard}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <strong>
                    Filter #{index + 1}
                  </strong>

                  {filters.length > 1 && (
                    <button
                      type="button"
                      style={styles.dangerButton}
                      onClick={() =>
                        removeFilter(index)
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={styles.grid}>
                  <div style={styles.field}>
                    <label style={styles.label}>
                      Filter ID *
                    </label>

                    <input
                      type="number"
                      style={styles.input}
                      value={filter.id}
                      onChange={(e) =>
                        updateFilter(
                          index,
                          "id",
                          e.target.value
                        )
                      }
                      placeholder="1"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Text
                    </label>

                    <input
                      style={styles.input}
                      value={filter.text}
                      onChange={(e) =>
                        updateFilter(
                          index,
                          "text",
                          e.target.value
                        )
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Selected Value
                    </label>

                    <input
                      style={styles.input}
                      value={
                        filter.selectedValue
                      }
                      onChange={(e) =>
                        updateFilter(
                          index,
                          "selectedValue",
                          e.target.value
                        )
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Selected Values
                    </label>

                    <input
                      style={styles.input}
                      value={
                        filter.selectedValues
                      }
                      onChange={(e) =>
                        updateFilter(
                          index,
                          "selectedValues",
                          e.target.value
                        )
                      }
                      placeholder="A,B,C"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Date/Time
                    </label>

                    <input
                      type="datetime-local"
                      style={styles.input}
                      value={filter.dateTime}
                      onChange={(e) =>
                        updateFilter(
                          index,
                          "dateTime",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Date Range
                    </label>

                    <select
                      style={styles.select}
                      value={
                        filter.textRange
                      }
                      onChange={(e) =>
                        updateFilter(
                          index,
                          "textRange",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select range
                      </option>

                      {TEXT_RANGES.map(
                        (range) => (
                          <option
                            key={range}
                            value={range}
                          >
                            {range}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Start
                    </label>

                    <input
                      type="datetime-local"
                      style={styles.input}
                      value={filter.start}
                      onChange={(e) =>
                        updateFilter(
                          index,
                          "start",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      End
                    </label>

                    <input
                      type="datetime-local"
                      style={styles.input}
                      value={filter.end}
                      onChange={(e) =>
                        updateFilter(
                          index,
                          "end",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "16px",
                    fontSize: "14px",
                    color: "#344054",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(
                      filter.checked
                    )}
                    onChange={(e) =>
                      updateFilter(
                        index,
                        "checked",
                        e.target.checked
                      )
                    }
                  />

                  Filter checked
                </label>
              </div>
            ))}
          </div>

          {/* ------------------------------------------------ */}
          {/* Submit */}
          {/* ------------------------------------------------ */}

          <div style={styles.card}>
            {error && (
              <div style={styles.errorBox}>
                <strong>Error:</strong>{" "}
                {error}
              </div>
            )}

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
                  ? "Creating Export Job..."
                  : "Create Export Job"}
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => {
                  setResult(null);
                  setError("");
                }}
              >
                Clear Result
              </button>
            </div>
          </div>
        </form>

        {/* -------------------------------------------------- */}
        {/* Result */}
        {/* -------------------------------------------------- */}

        {result && (
          <div style={styles.card}>
            {result.successful && (
              <div style={styles.successBox}>
                <strong>
                  Export job created successfully.
                </strong>

                {result.jobCode && (
                  <div
                    style={{
                      marginTop: "7px",
                    }}
                  >
                    Job Code:{" "}
                    <strong>
                      {result.jobCode}
                    </strong>
                  </div>
                )}

                {result.exportJobId && (
                  <div
                    style={{
                      marginTop: "4px",
                    }}
                  >
                    Export Job ID:{" "}
                    <strong>
                      {result.exportJobId}
                    </strong>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "8px",
                  }}
                >
                  The export is asynchronous.
                  Use the job code with the Get
                  Export Job Status API to obtain
                  the CSV download link once the job
                  is complete.
                </div>
              </div>
            )}

            <h2 style={styles.sectionTitle}>
              API Response
            </h2>

            <pre style={styles.result}>
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

export default CreateExportJob;