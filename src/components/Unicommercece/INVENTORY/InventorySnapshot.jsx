import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const initialForm = {
  facility: "",
  skuText: "",
  updatedSinceInMinutes: "",
};

const InventorySnapshot = () => {
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildPayload = () => {
    const payload = {
      facility: form.facility.trim(),
    };

    // Convert textarea SKU list into array.
    //
    // Supports:
    // SKU001
    // SKU002
    //
    // or:
    // SKU001, SKU002
    //
    // or both comma/newline separated.
    if (form.skuText.trim()) {
      const skus = form.skuText
        .split(/[\n,]+/)
        .map((sku) => sku.trim())
        .filter(Boolean);

      payload.itemTypeSKUs = [...new Set(skus)];
    }

    if (form.updatedSinceInMinutes !== "") {
      payload.updatedSinceInMinutes = Number(
        form.updatedSinceInMinutes
      );
    }

    return payload;
  };

  const getInventorySnapshot = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      if (!form.facility.trim()) {
        throw new Error("Facility Code is required.");
      }

      if (
        !form.skuText.trim() &&
        form.updatedSinceInMinutes === ""
      ) {
        throw new Error(
          "Enter at least one SKU or Updated Since Minutes."
        );
      }

      if (form.updatedSinceInMinutes !== "") {
        const minutes = Number(
          form.updatedSinceInMinutes
        );

        if (
          !Number.isInteger(minutes) ||
          minutes < 0 ||
          minutes > 1440
        ) {
          throw new Error(
            "Updated Since Minutes must be an integer between 0 and 1440."
          );
        }
      }

      const payload = buildPayload();

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/inventory/snapshot`,
        payload
      );

      setResponse(res.data);
    } catch (err) {
      console.error(
        "Inventory Snapshot Error:",
        err
      );

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to get inventory snapshot."
      );

      if (apiError) {
        setResponse(apiError);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm(initialForm);
    setResponse(null);
    setError("");
  };

  const snapshots =
    response?.inventorySnapshots || [];

  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0";
    }

    return String(value);
  };

  const getTotal = (field) => {
    return snapshots.reduce(
      (total, item) =>
        total + (Number(item[field]) || 0),
      0
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Inventory Snapshot
          </h1>

          <p style={styles.subtitle}>
            View inventory distribution of SKU(s) at a
            Uniware facility.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={getInventorySnapshot}
          style={styles.card}
        >
          <h2 style={styles.sectionTitle}>
            Inventory Filters
          </h2>

          <div style={styles.grid}>
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

            {/* Updated Minutes */}
            <div>
              <label style={styles.label}>
                Updated Since (Minutes)
              </label>

              <input
                type="number"
                name="updatedSinceInMinutes"
                value={
                  form.updatedSinceInMinutes
                }
                onChange={handleChange}
                min="0"
                max="1440"
                placeholder="Example: 480"
                style={styles.input}
              />

              <small style={styles.helpText}>
                Maximum 1440 minutes (24 hours)
              </small>
            </div>
          </div>

          {/* SKU */}
          <div style={styles.textareaContainer}>
            <label style={styles.label}>
              Item Type SKU(s)
            </label>

            <textarea
              name="skuText"
              value={form.skuText}
              onChange={handleChange}
              placeholder={`Enter one or multiple SKUs.

Example:
AGS-CP-569
W-05
TN-WBH-001

Comma separated is also supported:
AGS-CP-569, W-05, TN-WBH-001`}
              rows={8}
              style={styles.textarea}
            />

            <small style={styles.helpText}>
              Maximum 10,000 SKUs per API request.
              Leave blank when using only Updated Since
              Minutes.
            </small>
          </div>

          {/* Buttons */}
          <div style={styles.buttonRow}>
            <button
              type="submit"
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? "Loading..."
                : "Get Inventory Snapshot"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              style={styles.secondaryButton}
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <>
            {/* Response Summary */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Response Summary
              </h2>

              <div style={styles.summaryGrid}>
                <InfoBox
                  label="Successful"
                  value={
                    response.successful
                      ? "Yes"
                      : "No"
                  }
                />

                <InfoBox
                  label="SKUs Returned"
                  value={snapshots.length}
                />

                <InfoBox
                  label="Message"
                  value={
                    response.message || "N/A"
                  }
                />
              </div>
            </div>

            {/* Errors */}
            {response.errors?.length > 0 && (
              <div style={styles.errorBox}>
                <h3>
                  Uniware Errors
                </h3>

                {response.errors.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={styles.messageItem}
                    >
                      <strong>
                        {item.code || "Error"}
                      </strong>

                      {item.fieldName && (
                        <div>
                          <strong>
                            Field:
                          </strong>{" "}
                          {item.fieldName}
                        </div>
                      )}

                      <div>
                        {item.message ||
                          item.description ||
                          "Unknown error"}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Warnings */}
            {response.warnings?.length > 0 && (
              <div style={styles.warningBox}>
                <h3>
                  Uniware Warnings
                </h3>

                {response.warnings.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={styles.messageItem}
                    >
                      <strong>
                        {item.code ||
                          "Warning"}
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

            {/* Inventory Table */}
            <div style={styles.card}>
              <div style={styles.tableHeader}>
                <div>
                  <h2
                    style={{
                      ...styles.sectionTitle,
                      marginBottom: "5px",
                    }}
                  >
                    Inventory Distribution
                  </h2>

                  <span
                    style={styles.recordText}
                  >
                    {snapshots.length} SKU(s)
                  </span>
                </div>
              </div>

              {snapshots.length === 0 ? (
                <div style={styles.empty}>
                  No inventory records found.
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
                          SKU
                        </th>

                        <th style={styles.th}>
                          Available Inventory
                        </th>

                        <th style={styles.th}>
                          Open Sale
                        </th>

                        <th style={styles.th}>
                          Open Purchase
                        </th>

                        <th style={styles.th}>
                          Putaway Pending
                        </th>

                        <th style={styles.th}>
                          Inventory Blocked
                        </th>

                        <th style={styles.th}>
                          Pending Stock Transfer
                        </th>

                        <th style={styles.th}>
                          Vendor Inventory
                        </th>

                        <th style={styles.th}>
                          Virtual Inventory
                        </th>

                        <th style={styles.th}>
                          Pending Assessment
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {snapshots.map(
                        (item, index) => (
                          <tr
                            key={`${item.itemTypeSKU}-${index}`}
                          >
                            <td style={styles.td}>
                              {index + 1}
                            </td>

                            <td
                              style={{
                                ...styles.td,
                                fontWeight: 700,
                              }}
                            >
                              {formatValue(
                                item.itemTypeSKU
                              )}
                            </td>

                            <td
                              style={{
                                ...styles.td,
                                fontWeight: 700,
                              }}
                            >
                              {formatValue(
                                item.inventory
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatValue(
                                item.openSale
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatValue(
                                item.openPurchase
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatValue(
                                item.putawayPending
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatValue(
                                item.inventoryBlocked
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatValue(
                                item.pendingStockTransfer
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatValue(
                                item.vendorInventory
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatValue(
                                item.virtualInventory
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatValue(
                                item.pendingInventoryAssessment
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                    {/* Totals */}
                    <tfoot>
                      <tr>
                        <td
                          colSpan="2"
                          style={{
                            ...styles.th,
                            textAlign: "right",
                          }}
                        >
                          TOTAL
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal("inventory")}
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal("openSale")}
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal("openPurchase")}
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal(
                            "putawayPending"
                          )}
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal(
                            "inventoryBlocked"
                          )}
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal(
                            "pendingStockTransfer"
                          )}
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal(
                            "vendorInventory"
                          )}
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal(
                            "virtualInventory"
                          )}
                        </td>

                        <td style={styles.totalCell}>
                          {getTotal(
                            "pendingInventoryAssessment"
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Individual SKU Cards */}
            {snapshots.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  SKU Inventory Details
                </h2>

                <div style={styles.detailGrid}>
                  {snapshots.map(
                    (item, index) => (
                      <div
                        key={`card-${item.itemTypeSKU}-${index}`}
                        style={styles.skuCard}
                      >
                        <div
                          style={
                            styles.skuCardHeader
                          }
                        >
                          <strong>
                            {formatValue(
                              item.itemTypeSKU
                            )}
                          </strong>
                        </div>

                        <InventoryMetric
                          label="Available Inventory"
                          value={
                            item.inventory
                          }
                        />

                        <InventoryMetric
                          label="Open Sale"
                          value={
                            item.openSale
                          }
                        />

                        <InventoryMetric
                          label="Open Purchase"
                          value={
                            item.openPurchase
                          }
                        />

                        <InventoryMetric
                          label="Putaway Pending"
                          value={
                            item.putawayPending
                          }
                        />

                        <InventoryMetric
                          label="Inventory Blocked"
                          value={
                            item.inventoryBlocked
                          }
                        />

                        <InventoryMetric
                          label="Pending Stock Transfer"
                          value={
                            item.pendingStockTransfer
                          }
                        />

                        <InventoryMetric
                          label="Vendor Inventory"
                          value={
                            item.vendorInventory
                          }
                        />

                        <InventoryMetric
                          label="Virtual Inventory"
                          value={
                            item.virtualInventory
                          }
                        />

                        <InventoryMetric
                          label="Pending Assessment"
                          value={
                            item.pendingInventoryAssessment
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Raw Response */}
            <details style={styles.rawDetails}>
              <summary style={styles.rawSummary}>
                View Raw Uniware Response
              </summary>

              <pre style={styles.pre}>
                {JSON.stringify(
                  response,
                  null,
                  2
                )}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
};

const InfoBox = ({ label, value }) => (
  <div style={styles.infoBox}>
    <div style={styles.infoLabel}>
      {label}
    </div>

    <div style={styles.infoValue}>
      {value}
    </div>
  </div>
);

const InventoryMetric = ({
  label,
  value,
}) => (
  <div style={styles.metric}>
    <span>{label}</span>

    <strong>
      {value ?? 0}
    </strong>
  </div>
);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    padding: "30px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    color: "#222",
  },

  container: {
    maxWidth: "1600px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    marginTop: "8px",
    color: "#666",
  },

  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "18px",
    fontSize: "21px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },

  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border:
      "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },

  textareaContainer: {
    marginTop: "20px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  helpText: {
    display: "block",
    marginTop: "6px",
    color: "#777",
    fontSize: "12px",
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "6px",
    padding: "12px 22px",
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    border:
      "1px solid #bbb",
    borderRadius: "6px",
    padding: "12px 22px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  errorBox: {
    background: "#fff0f0",
    border:
      "1px solid #e0a0a0",
    color: "#a00000",
    padding: "15px",
    borderRadius: "7px",
    marginBottom: "20px",
  },

  warningBox: {
    background: "#fff8e5",
    border:
      "1px solid #e5c46a",
    color: "#765900",
    padding: "15px",
    borderRadius: "7px",
    marginBottom: "20px",
  },

  messageItem: {
    marginBottom: "9px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  infoBox: {
    border:
      "1px solid #e0e0e0",
    borderRadius: "7px",
    padding: "14px",
    background: "#fafafa",
  },

  infoLabel: {
    fontSize: "12px",
    color: "#777",
    marginBottom: "5px",
    fontWeight: 600,
  },

  infoValue: {
    fontSize: "15px",
    wordBreak: "break-word",
  },

  tableHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  recordText: {
    color: "#777",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    minWidth: "1400px",
  },

  th: {
    textAlign: "left",
    padding: "11px",
    background: "#f0f2f5",
    borderBottom:
      "1px solid #ddd",
    whiteSpace:
      "nowrap",
    fontSize: "13px",
  },

  td: {
    padding: "11px",
    borderBottom:
      "1px solid #eee",
    whiteSpace:
      "nowrap",
    fontSize: "13px",
  },

  totalCell: {
    padding: "12px",
    borderTop:
      "2px solid #ccc",
    background: "#f5f5f5",
    fontWeight: 700,
    whiteSpace:
      "nowrap",
  },

  empty: {
    textAlign: "center",
    padding: "45px",
    color: "#777",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
  },

  skuCard: {
    border:
      "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#fff",
  },

  skuCardHeader: {
    padding: "15px",
    background: "#f0f2f5",
    borderBottom:
      "1px solid #ddd",
    fontSize: "16px",
  },

  metric: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "15px",
    padding:
      "10px 15px",
    borderBottom:
      "1px solid #eee",
    fontSize: "13px",
  },

  rawDetails: {
    background: "#1e1e1e",
    color: "#fff",
    borderRadius: "8px",
    marginBottom: "30px",
    overflow: "hidden",
  },

  rawSummary: {
    cursor: "pointer",
    padding: "15px",
    fontWeight: 600,
  },

  pre: {
    padding: "20px",
    margin: 0,
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default InventorySnapshot;