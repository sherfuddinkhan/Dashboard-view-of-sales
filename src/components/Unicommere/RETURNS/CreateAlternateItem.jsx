import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateAlternateItem() {
  const [saleOrderItems, setSaleOrderItems] = useState([
    {
      code: "",
      status: "",
      shelfCode: "",
      reason: "",
    },
  ]);

  const [alternates, setAlternates] = useState([
    {
      itemSku: "",
      amountDifference: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ==========================================================
  // Sale Order Item handlers
  // ==========================================================

  const updateSaleOrderItem = (index, field, value) => {
    setSaleOrderItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addSaleOrderItem = () => {
    setSaleOrderItems((current) => [
      ...current,
      {
        code: "",
        status: "",
        shelfCode: "",
        reason: "",
      },
    ]);
  };

  const removeSaleOrderItem = (index) => {
    setSaleOrderItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // ==========================================================
  // Alternate item handlers
  // ==========================================================

  const updateAlternate = (index, field, value) => {
    setAlternates((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addAlternate = () => {
    setAlternates((current) => [
      ...current,
      {
        itemSku: "",
        amountDifference: "",
      },
    ]);
  };

  const removeAlternate = (index) => {
    setAlternates((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // ==========================================================
  // Request preview
  // ==========================================================

  const requestPreview = useMemo(() => {
    return {
      saleOrderItems: saleOrderItems.map((item) => {
        const result = {
          code: item.code.trim(),
        };

        if (item.status.trim()) {
          result.status = item.status.trim();
        }

        if (item.shelfCode.trim()) {
          result.shelfCode = item.shelfCode.trim();
        }

        if (item.reason.trim()) {
          result.reason = item.reason.trim();
        }

        return result;
      }),

      saleOrderItemAlternates: alternates.map((item) => ({
        itemSku: item.itemSku.trim(),
        amountDifference:
          item.amountDifference === ""
            ? ""
            : Number(item.amountDifference),
      })),
    };
  }, [saleOrderItems, alternates]);

  // ==========================================================
  // Validation
  // ==========================================================

  const validate = () => {
    if (saleOrderItems.length === 0) {
      return "At least one sale order item is required.";
    }

    for (let i = 0; i < saleOrderItems.length; i++) {
      if (!saleOrderItems[i].code.trim()) {
        return `Sale order item code is required at row ${i + 1}.`;
      }
    }

    if (alternates.length === 0) {
      return "At least one alternate item is required.";
    }

    for (let i = 0; i < alternates.length; i++) {
      const item = alternates[i];

      if (!item.itemSku.trim()) {
        return `Alternate item SKU is required at row ${i + 1}.`;
      }

      if (
        item.amountDifference === "" ||
        Number.isNaN(Number(item.amountDifference))
      ) {
        return `Amount difference is required at alternate row ${i + 1}.`;
      }
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

      const payload = {
        saleOrderItems: saleOrderItems.map((item) => {
          const result = {
            code: item.code.trim(),
          };

          if (item.status.trim()) {
            result.status = item.status.trim();
          }

          if (item.shelfCode.trim()) {
            result.shelfCode = item.shelfCode.trim();
          }

          if (item.reason.trim()) {
            result.reason = item.reason.trim();
          }

          return result;
        }),

        saleOrderItemAlternates: alternates.map((item) => ({
          itemSku: item.itemSku.trim(),
          amountDifference: Number(item.amountDifference),
        })),
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/create-alternate-item`,
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
          "Failed to create alternate item."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSaleOrderItems([
      {
        code: "",
        status: "",
        shelfCode: "",
        reason: "",
      },
    ]);

    setAlternates([
      {
        itemSku: "",
        amountDifference: "",
      },
    ]);

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
            <h1 style={styles.title}>Create Alternate Item</h1>

            <p style={styles.subtitle}>
              Create an alternate sale order item for a returned
              item in Uniware.
            </p>
          </div>

          <div style={styles.badge}>
            Tenant Level
          </div>
        </div>

        {/* ==================================================
            Information
        ================================================== */}

        <div style={styles.infoBox}>
          <strong>Uniware API</strong>

          <div style={styles.infoText}>
            POST /services/rest/v1/oms/saleOrder/
            createSaleOrderItemAlternate
          </div>

          <div style={styles.infoText}>
            No Facility header is required because this is a
            Tenant-level API.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ==================================================
              Returned Sale Order Items
          ================================================== */}

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Returned Sale Order Items
                </h2>

                <p style={styles.sectionDescription}>
                  Specify the sale order item being replaced.
                </p>
              </div>

              <button
                type="button"
                onClick={addSaleOrderItem}
                style={styles.secondaryButton}
              >
                + Add Item
              </button>
            </div>

            {saleOrderItems.map((item, index) => (
              <div
                key={index}
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <strong>
                    Returned Item #{index + 1}
                  </strong>

                  {saleOrderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeSaleOrderItem(index)
                      }
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={styles.grid}>
                  <Field
                    label="Sale Order Item Code *"
                    value={item.code}
                    onChange={(value) =>
                      updateSaleOrderItem(
                        index,
                        "code",
                        value
                      )
                    }
                    placeholder="SOI-0001"
                  />

                  <Field
                    label="Status"
                    value={item.status}
                    onChange={(value) =>
                      updateSaleOrderItem(
                        index,
                        "status",
                        value
                      )
                    }
                    placeholder="RETURNED"
                  />

                  <Field
                    label="Shelf Code"
                    value={item.shelfCode}
                    onChange={(value) =>
                      updateSaleOrderItem(
                        index,
                        "shelfCode",
                        value
                      )
                    }
                    placeholder="A-01-01"
                  />

                  <Field
                    label="Reason"
                    value={item.reason}
                    onChange={(value) =>
                      updateSaleOrderItem(
                        index,
                        "reason",
                        value
                      )
                    }
                    placeholder="Damaged / Wrong Item"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* ==================================================
              Alternate Items
          ================================================== */}

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Alternate Items
                </h2>

                <p style={styles.sectionDescription}>
                  Specify the SKU that should replace the
                  returned item and the amount difference.
                </p>
              </div>

              <button
                type="button"
                onClick={addAlternate}
                style={styles.secondaryButton}
              >
                + Add Alternate
              </button>
            </div>

            {alternates.map((item, index) => (
              <div
                key={index}
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <strong>
                    Alternate Item #{index + 1}
                  </strong>

                  {alternates.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeAlternate(index)
                      }
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={styles.grid}>
                  <Field
                    label="Item SKU *"
                    value={item.itemSku}
                    onChange={(value) =>
                      updateAlternate(
                        index,
                        "itemSku",
                        value
                      )
                    }
                    placeholder="Bharat4"
                  />

                  <Field
                    label="Amount Difference *"
                    type="number"
                    value={item.amountDifference}
                    onChange={(value) =>
                      updateAlternate(
                        index,
                        "amountDifference",
                        value
                      )
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* ==================================================
              Buttons
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
                ? "Creating..."
                : "Create Alternate Item"}
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
                  ? "✓ Alternate Item Created"
                  : "✕ Request Failed"}
              </strong>

              {result.message && (
                <div style={styles.message}>
                  {result.message}
                </div>
              )}
            </div>

            {/* Successful item codes */}

            {Array.isArray(
              result.successfulSaleOrderItemCodes
            ) &&
              result.successfulSaleOrderItemCodes.length >
                0 && (
                <div style={styles.resultCard}>
                  <h3 style={styles.resultTitle}>
                    Successful Sale Order Item Codes
                  </h3>

                  <div style={styles.codeList}>
                    {result.successfulSaleOrderItemCodes.map(
                      (code, index) => (
                        <span
                          key={index}
                          style={styles.codeBadge}
                        >
                          {code}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

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

// ============================================================
// Reusable field
// ============================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  );
}

// ============================================================
// Styles
// ============================================================

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
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  card: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "18px",
    marginBottom: "14px",
    background: "#fafcff",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    color: "#334155",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
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
    margin: "0 0 12px",
    fontSize: "16px",
    color: "#334155",
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

  codeList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  codeBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    padding: "6px 10px",
    fontFamily: "monospace",
    fontSize: "13px",
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

export default CreateAlternateItem;