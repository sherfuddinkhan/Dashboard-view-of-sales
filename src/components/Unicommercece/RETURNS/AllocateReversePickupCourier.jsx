import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function AllocateReversePickupCourier() {
  const [facility, setFacility] = useState("MAIN");

  const [reversePickupCodes, setReversePickupCodes] = useState([
    "",
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ==========================================================
  // Reverse Pickup Code handlers
  // ==========================================================

  const updateCode = (index, value) => {
    setReversePickupCodes((current) =>
      current.map((code, codeIndex) =>
        codeIndex === index ? value : code
      )
    );
  };

  const addCode = () => {
    setReversePickupCodes((current) => [
      ...current,
      "",
    ]);
  };

  const removeCode = (index) => {
    setReversePickupCodes((current) =>
      current.filter((_, codeIndex) => codeIndex !== index)
    );
  };

  // ==========================================================
  // Request Preview
  // ==========================================================

  const requestPreview = useMemo(() => {
    return {
      facility: facility.trim(),

      reversePickupCodes: reversePickupCodes
        .map((code) => code.trim())
        .filter(Boolean),
    };
  }, [facility, reversePickupCodes]);

  // ==========================================================
  // Validation
  // ==========================================================

  const validate = () => {
    if (!facility.trim()) {
      return "Facility is required.";
    }

    const validCodes = reversePickupCodes
      .map((code) => code.trim())
      .filter(Boolean);

    if (validCodes.length === 0) {
      return "At least one reverse pickup code is required.";
    }

    return "";
  };

  // ==========================================================
  // Submit
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const uniqueCodes = [
        ...new Set(
          reversePickupCodes
            .map((code) => code.trim())
            .filter(Boolean)
        ),
      ];

      const payload = {
        facility: facility.trim(),
        reversePickupCodes: uniqueCodes,
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/reverse-pickups/allocate-courier`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      setResult(err.response?.data || null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to allocate reverse pickup courier."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Reset
  // ==========================================================

  const resetForm = () => {
    setFacility("MAIN");
    setReversePickupCodes([""]);
    setResult(null);
    setError("");
  };

  // ==========================================================
  // Render RVP list
  // ==========================================================

  const renderRvpTable = (
    title,
    items,
    type = "assigned"
  ) => {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    // assignedRVP and alreadyAssignedRVP contain objects
    if (
      type === "assigned" ||
      type === "alreadyAssigned"
    ) {
      return (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>
            {title}
            <span style={styles.countBadge}>
              {items.length}
            </span>
          </h3>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Reverse Pickup Code
                  </th>

                  <th style={styles.th}>
                    Shipping Provider
                  </th>

                  <th style={styles.th}>
                    Tracking Number
                  </th>

                  <th style={styles.th}>
                    Shipping Courier
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>
                      {item.reversePickupCode || "-"}
                    </td>

                    <td style={styles.td}>
                      {item.shippingProviderCode || "-"}
                    </td>

                    <td style={styles.td}>
                      {item.trackingNumber || "-"}
                    </td>

                    <td style={styles.td}>
                      {item.shippingCourier || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // manualRVPS and errorneousRVP are code arrays
    return (
      <div style={styles.resultCard}>
        <h3 style={styles.resultTitle}>
          {title}
          <span style={styles.countBadge}>
            {items.length}
          </span>
        </h3>

        <div style={styles.codeList}>
          {items.map((item, index) => (
            <span
              key={index}
              style={
                type === "error"
                  ? styles.errorCodeBadge
                  : styles.warningCodeBadge
              }
            >
              {typeof item === "string"
                ? item
                : item?.reversePickupCode || "-"}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ==================================================
            Header
        ================================================== */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Allocate Courier for Reverse Pick-up
            </h1>

            <p style={styles.subtitle}>
              Allocate a courier and tracking number for
              reverse pickups (CIR) in Uniware.
            </p>
          </div>

          <div style={styles.badge}>
            Facility Level
          </div>
        </div>

        {/* ==================================================
            API Information
        ================================================== */}

        <div style={styles.infoBox}>
          <strong>Uniware API</strong>

          <div style={styles.infoText}>
            POST /services/rest/v1/oms/reversePickup/
            assignReverseProvider
          </div>

          <div style={styles.infoText}>
            Facility header is required.
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ==================================================
              Facility
          ================================================== */}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Facility
            </h2>

            <p style={styles.sectionDescription}>
              Enter the Uniware facility code from which the
              reverse pickup is being processed.
            </p>

            <label style={styles.field}>
              <span style={styles.label}>
                Facility *
              </span>

              <input
                type="text"
                value={facility}
                onChange={(event) =>
                  setFacility(event.target.value)
                }
                placeholder="MAIN"
                style={styles.input}
              />
            </label>
          </section>

          {/* ==================================================
              Reverse Pickup Codes
          ================================================== */}

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Reverse Pickup Codes
                </h2>

                <p style={styles.sectionDescription}>
                  Add one or more reverse pickup codes.
                </p>
              </div>

              <button
                type="button"
                onClick={addCode}
                style={styles.secondaryButton}
              >
                + Add Code
              </button>
            </div>

            {reversePickupCodes.map((code, index) => (
              <div
                key={index}
                style={styles.codeRow}
              >
                <div style={styles.rowNumber}>
                  {index + 1}
                </div>

                <input
                  type="text"
                  value={code}
                  onChange={(event) =>
                    updateCode(
                      index,
                      event.target.value
                    )
                  }
                  placeholder="RPP1000087"
                  style={styles.input}
                />

                {reversePickupCodes.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeCode(index)
                    }
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </section>

          {/* ==================================================
              Information
          ================================================== */}

          <div style={styles.noteBox}>
            <strong>Processing information</strong>

            <div style={styles.noteText}>
              Uniware will attempt courier allocation for each
              reverse pickup code. The response can contain
              successfully assigned, already assigned, manual,
              and erroneous reverse pickups.
            </div>
          </div>

          {/* ==================================================
              Actions
          ================================================== */}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={resetForm}
              style={styles.resetButton}
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Allocating..."
                : "Allocate Courier"}
            </button>
          </div>
        </form>

        {/* ==================================================
            Error
        ================================================== */}

        {error && (
          <div style={styles.errorBox}>
            <strong>Error</strong>

            <div style={styles.message}>
              {error}
            </div>
          </div>
        )}

        {/* ==================================================
            Result
        ================================================== */}

        {result && (
          <section style={styles.resultSection}>

            <div
              style={{
                ...styles.statusBanner,
                ...(result.successful
                  ? styles.successBanner
                  : styles.failedBanner),
              }}
            >
              <strong>
                {result.successful
                  ? "✓ Courier Allocation Completed"
                  : "✕ Courier Allocation Failed"}
              </strong>

              {result.message && (
                <div style={styles.message}>
                  {result.message}
                </div>
              )}
            </div>

            {/* Assigned RVP */}

            {renderRvpTable(
              "Assigned Reverse Pickups",
              result.assignedRVP,
              "assigned"
            )}

            {/* Already Assigned RVP */}

            {renderRvpTable(
              "Already Assigned Reverse Pickups",
              result.alreadyAssignedRVP,
              "alreadyAssigned"
            )}

            {/* Manual RVP */}

            {renderRvpTable(
              "Manual Reverse Pickups",
              result.manualRVPS,
              "manual"
            )}

            {/* Erroneous RVP */}

            {renderRvpTable(
              "Erroneous Reverse Pickups",
              result.errorneousRVP,
              "error"
            )}

            {/* API Errors */}

            {Array.isArray(result.errors) &&
              result.errors.length > 0 && (
                <div style={styles.resultCard}>
                  <h3 style={styles.errorTitle}>
                    API Errors
                  </h3>

                  {result.errors.map((item, index) => (
                    <div
                      key={index}
                      style={styles.errorItem}
                    >
                      <strong>
                        {item.fieldName ||
                          `Error ${index + 1}`}
                      </strong>

                      <div>
                        {item.message ||
                          item.description ||
                          "Unknown error"}
                      </div>

                      {item.code !== undefined && (
                        <small>
                          Code: {item.code}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              )}

            {/* API Warnings */}

            {Array.isArray(result.warnings) &&
              result.warnings.length > 0 && (
                <div style={styles.resultCard}>
                  <h3 style={styles.warningTitle}>
                    API Warnings
                  </h3>

                  {result.warnings.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={styles.warningItem}
                      >
                        <strong>
                          {item.message ||
                            `Warning ${index + 1}`}
                        </strong>

                        {item.description && (
                          <div>
                            {item.description}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
          </section>
        )}

        {/* ==================================================
            Request Preview
        ================================================== */}

        <section style={styles.previewSection}>
          <h2 style={styles.sectionTitle}>
            Request Preview
          </h2>

          <pre style={styles.pre}>
            {JSON.stringify(
              requestPreview,
              null,
              2
            )}
          </pre>
        </section>

        {/* ==================================================
            Raw Response
        ================================================== */}

        {result && (
          <section style={styles.previewSection}>
            <h2 style={styles.sectionTitle}>
              Raw Response
            </h2>

            <pre style={styles.pre}>
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "32px 20px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    color: "#172033",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  badge: {
    padding: "8px 14px",
    borderRadius: "20px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: "13px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  infoBox: {
    background: "#eef6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "22px",
    color: "#1e3a8a",
  },

  infoText: {
    marginTop: "6px",
    fontSize: "13px",
    fontFamily: "monospace",
  },

  section: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "20px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#172033",
  },

  sectionDescription: {
    margin: "5px 0 18px",
    fontSize: "13px",
    color: "#64748b",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    maxWidth: "650px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    padding: "11px 12px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
  },

  codeRow: {
    display: "grid",
    gridTemplateColumns:
      "38px minmax(0, 1fr) auto",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },

  rowNumber: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    borderRadius: "7px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 600,
  },

  secondaryButton: {
    border: "1px solid #2563eb",
    borderRadius: "7px",
    padding: "9px 14px",
    background: "#fff",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },

  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  resetButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "12px 20px",
    background: "#fff",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  removeButton: {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },

  noteBox: {
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    padding: "14px 16px",
    marginBottom: "20px",
    color: "#334155",
  },

  noteText: {
    marginTop: "6px",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginBottom: "22px",
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "9px",
    marginBottom: "20px",
  },

  message: {
    marginTop: "6px",
    fontSize: "14px",
  },

  resultSection: {
    marginBottom: "20px",
  },

  statusBanner: {
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "14px",
  },

  successBanner: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
  },

  failedBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
  },

  resultCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "18px",
    marginBottom: "14px",
  },

  resultTitle: {
    margin: "0 0 14px",
    fontSize: "16px",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  countBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "12px",
    padding: "3px 8px",
    fontSize: "11px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  th: {
    textAlign: "left",
    padding: "11px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "11px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "13px",
  },

  codeList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  errorCodeBadge: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: "6px",
    padding: "6px 10px",
    fontFamily: "monospace",
    fontSize: "13px",
  },

  warningCodeBadge: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    borderRadius: "6px",
    padding: "6px 10px",
    fontFamily: "monospace",
    fontSize: "13px",
  },

  errorTitle: {
    margin: "0 0 12px",
    fontSize: "16px",
    color: "#b91c1c",
  },

  warningTitle: {
    margin: "0 0 12px",
    fontSize: "16px",
    color: "#92400e",
  },

  errorItem: {
    background: "#fff7f7",
    border: "1px solid #fecaca",
    padding: "10px",
    borderRadius: "7px",
    marginBottom: "8px",
    color: "#991b1b",
  },

  warningItem: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    padding: "10px",
    borderRadius: "7px",
    marginBottom: "8px",
    color: "#92400e",
  },

  previewSection: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },

  pre: {
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.6,
    marginTop: "14px",
  },
};

export default AllocateReversePickupCourier;