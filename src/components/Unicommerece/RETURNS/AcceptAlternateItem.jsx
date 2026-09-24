import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function AcceptAlternateItem() {
  const [saleOrderCode, setSaleOrderCode] = useState("");

  const [saleOrderItemCodes, setSaleOrderItemCodes] = useState([
    "",
  ]);

  const [selectedAlternateItemSku, setSelectedAlternateItemSku] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ==========================================================
  // Sale Order Item Code handlers
  // ==========================================================

  const updateItemCode = (index, value) => {
    setSaleOrderItemCodes((current) =>
      current.map((code, itemIndex) =>
        itemIndex === index ? value : code
      )
    );
  };

  const addItemCode = () => {
    setSaleOrderItemCodes((current) => [
      ...current,
      "",
    ]);
  };

  const removeItemCode = (index) => {
    setSaleOrderItemCodes((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // ==========================================================
  // Request preview
  // ==========================================================

  const requestPreview = useMemo(() => {
    return {
      saleOrderCode: saleOrderCode.trim(),

      saleOrderItemCodes: saleOrderItemCodes
        .map((code) => code.trim())
        .filter(Boolean),

      selectedAlternateItemSku:
        selectedAlternateItemSku.trim(),
    };
  }, [
    saleOrderCode,
    saleOrderItemCodes,
    selectedAlternateItemSku,
  ]);

  // ==========================================================
  // Validation
  // ==========================================================

  const validate = () => {
    if (!saleOrderCode.trim()) {
      return "Sale order code is required.";
    }

    const validItemCodes = saleOrderItemCodes
      .map((code) => code.trim())
      .filter(Boolean);

    if (validItemCodes.length === 0) {
      return "At least one sale order item code is required.";
    }

    if (!selectedAlternateItemSku.trim()) {
      return "Selected alternate item SKU is required.";
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

      const uniqueItemCodes = [
        ...new Set(
          saleOrderItemCodes
            .map((code) => code.trim())
            .filter(Boolean)
        ),
      ];

      const payload = {
        saleOrderCode: saleOrderCode.trim(),
        saleOrderItemCodes: uniqueItemCodes,
        selectedAlternateItemSku:
          selectedAlternateItemSku.trim(),
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/accept-alternate-item`,
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
          "Failed to accept alternate item."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Reset
  // ==========================================================

  const resetForm = () => {
    setSaleOrderCode("");

    setSaleOrderItemCodes([""]);

    setSelectedAlternateItemSku("");

    setResult(null);
    setError("");
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
              Accept Alternate Item
            </h1>

            <p style={styles.subtitle}>
              Accept a selected alternate SKU for one or more
              returned sale order items in Uniware.
            </p>
          </div>

          <div style={styles.badge}>
            Tenant Level
          </div>
        </div>

        {/* ==================================================
            API Information
        ================================================== */}

        <div style={styles.infoBox}>
          <strong>Uniware API</strong>

          <div style={styles.infoText}>
            POST /services/rest/v1/oms/saleOrder/
            acceptSaleOrderItemAlternate
          </div>

          <div style={styles.infoText}>
            No Facility header is required because this is a
            Tenant-level API.
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ==================================================
              Sale Order
          ================================================== */}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Sale Order
            </h2>

            <p style={styles.sectionDescription}>
              Enter the sale order containing the returned item.
            </p>

            <div style={styles.singleField}>
              <label style={styles.field}>
                <span style={styles.label}>
                  Sale Order Code *
                </span>

                <input
                  type="text"
                  value={saleOrderCode}
                  onChange={(event) =>
                    setSaleOrderCode(event.target.value)
                  }
                  placeholder="SO00159"
                  style={styles.input}
                />
              </label>
            </div>
          </section>

          {/* ==================================================
              Sale Order Item Codes
          ================================================== */}

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Returned Sale Order Items
                </h2>

                <p style={styles.sectionDescription}>
                  Select the returned sale order item codes
                  for which the alternate item should be accepted.
                </p>
              </div>

              <button
                type="button"
                onClick={addItemCode}
                style={styles.secondaryButton}
              >
                + Add Item
              </button>
            </div>

            {saleOrderItemCodes.map((code, index) => (
              <div
                key={index}
                style={styles.itemRow}
              >
                <div style={styles.rowNumber}>
                  {index + 1}
                </div>

                <input
                  type="text"
                  value={code}
                  onChange={(event) =>
                    updateItemCode(
                      index,
                      event.target.value
                    )
                  }
                  placeholder="Sale Order Item Code"
                  style={styles.input}
                />

                {saleOrderItemCodes.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeItemCode(index)
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
              Alternate SKU
          ================================================== */}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Selected Alternate Item
            </h2>

            <p style={styles.sectionDescription}>
              Enter the SKU of the alternate item that was
              previously created for the returned item.
            </p>

            <label style={styles.field}>
              <span style={styles.label}>
                Selected Alternate Item SKU *
              </span>

              <input
                type="text"
                value={selectedAlternateItemSku}
                onChange={(event) =>
                  setSelectedAlternateItemSku(
                    event.target.value
                  )
                }
                placeholder="Bharat4"
                style={styles.input}
              />
            </label>
          </section>

          {/* ==================================================
              Important Note
          ================================================== */}

          <div style={styles.warningBox}>
            <strong>Important</strong>

            <div style={styles.warningText}>
              The selected SKU must correspond to an alternate
              item that has already been created for the returned
              sale order item.
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
                ? "Accepting..."
                : "Accept Alternate Item"}
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
                  ? "✓ Alternate Item Accepted"
                  : "✕ Request Failed"}
              </strong>

              {result.message && (
                <div style={styles.message}>
                  {result.message}
                </div>
              )}
            </div>

            {/* Errors */}

            {Array.isArray(result.errors) &&
              result.errors.length > 0 && (
                <div style={styles.resultCard}>
                  <h3 style={styles.errorTitle}>
                    Errors
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

            {/* Warnings */}

            {Array.isArray(result.warnings) &&
              result.warnings.length > 0 && (
                <div style={styles.resultCard}>
                  <h3 style={styles.warningTitle}>
                    Warnings
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
    maxWidth: "1100px",
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
    background: "#e0f2fe",
    color: "#0369a1",
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

  singleField: {
    maxWidth: "600px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
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

  itemRow: {
    display: "grid",
    gridTemplateColumns: "38px minmax(0, 1fr) auto",
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

  warningBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "9px",
    padding: "14px 16px",
    marginBottom: "20px",
    color: "#92400e",
  },

  warningText: {
    marginTop: "5px",
    fontSize: "13px",
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

export default AcceptAlternateItem;