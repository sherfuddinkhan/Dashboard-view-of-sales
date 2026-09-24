import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function ScanGatepassItem() {
  const [facility, setFacility] = useState("MAIN");
  const [gatePassCode, setGatePassCode] = useState("");
  const [itemCode, setItemCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [scannedItem, setScannedItem] = useState(null);
  const [error, setError] = useState("");

  const scanItem = async (e) => {
    e.preventDefault();

    const facilityValue = facility.trim();
    const gatePassValue = gatePassCode.trim();
    const itemCodeValue = itemCode.trim();

    if (!facilityValue) {
      setError("Facility code is required.");
      return;
    }

    if (!gatePassValue) {
      setError("Gatepass code is required.");
      return;
    }

    if (!itemCodeValue) {
      setError("Item code is required.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);
    setScannedItem(null);

    try {
      const res = await axios.post(
        `${SERVER_URL}/api/uniware/gatepasses/scan-item`,
        {
          facility: facilityValue,
          gatePassCode: gatePassValue,
          itemCode: itemCodeValue,
        }
      );

      setResponse(res.data);
      setScannedItem(res.data?.scannedItem || null);

      if (res.data?.successful === false) {
        const apiMessage =
          res.data?.message ||
          res.data?.errors?.[0]?.message ||
          res.data?.errors?.[0]?.description;

        setError(apiMessage || "Uniware could not scan the item.");
      }
    } catch (err) {
      const data = err.response?.data;

      setResponse(data || null);

      const apiMessage =
        data?.message ||
        data?.errors?.[0]?.message ||
        data?.errors?.[0]?.description;

      setError(
        apiMessage ||
          err.message ||
          "Failed to scan item for gatepass."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFacility("MAIN");
    setGatePassCode("");
    setItemCode("");
    setResponse(null);
    setScannedItem(null);
    setError("");
  };

  const renderValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    return String(value);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Scan Item</h1>

          <p style={styles.subtitle}>
            Mark an item as scanned for issuing a Uniware gatepass.
          </p>
        </div>

        <div style={styles.apiBadge}>
          POST /purchase/gatepass/scan/item
        </div>
      </div>

      {/* Form */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Scan Gatepass Item</h2>

        <form onSubmit={scanItem}>
          <div style={styles.formGrid}>
            {/* Facility */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Facility Code <span style={styles.required}>*</span>
              </label>

              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="MAIN"
                style={styles.input}
              />

              <small style={styles.helpText}>
                Uniware facility code used in the Facility header.
              </small>
            </div>

            {/* Gatepass */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Gatepass Code <span style={styles.required}>*</span>
              </label>

              <input
                type="text"
                value={gatePassCode}
                onChange={(e) => setGatePassCode(e.target.value)}
                placeholder="Example: GP000123"
                style={styles.input}
              />

              <small style={styles.helpText}>
                Gatepass code against which the item is scanned.
              </small>
            </div>

            {/* Item */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Item Code <span style={styles.required}>*</span>
              </label>

              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="Example: 000002"
                style={styles.input}
              />

              <small style={styles.helpText}>
                Physical Uniware item code, not SKU.
              </small>
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Scanning..." : "Scan Item"}
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
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <strong>Scan Failed</strong>

          <div style={styles.errorMessage}>
            {error}
          </div>
        </div>
      )}

      {/* Successful scanned item */}
      {scannedItem && (
        <div style={styles.card}>
          <div style={styles.successHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Scanned Item
              </h2>

              <p style={styles.successMessage}>
                The item scan response was received from Uniware.
              </p>
            </div>

            <div style={styles.successBadge}>
              SCANNED
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoBox}>
              <span style={styles.label}>Item Code</span>
              <strong>
                {renderValue(scannedItem.itemCode)}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>Item Name</span>
              <strong>
                {renderValue(scannedItem.itemName)}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>Item SKU</span>
              <strong>
                {renderValue(scannedItem.itemSKU)}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>
                Inventory Type
              </span>

              <strong>
                {renderValue(scannedItem.inventoryType)}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>Shelf Code</span>

              <strong>
                {renderValue(scannedItem.shelfCode)}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Response summary */}
      {response && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            API Response
          </h2>

          <div style={styles.responseGrid}>
            <div style={styles.infoBox}>
              <span style={styles.label}>Successful</span>

              <strong
                style={{
                  color: response.successful
                    ? "#166534"
                    : "#991b1b",
                }}
              >
                {response.successful ? "Yes" : "No"}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>Message</span>

              <strong>
                {renderValue(response.message)}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>Errors</span>

              <strong>
                {response.errors?.length || 0}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>Warnings</span>

              <strong>
                {response.warnings?.length || 0}
              </strong>
            </div>
          </div>

          {/* Errors */}
          {response.errors?.length > 0 && (
            <div style={styles.messageSection}>
              <h3 style={styles.subTitle}>Errors</h3>

              {response.errors.map((item, index) => (
                <div
                  key={`error-${index}`}
                  style={styles.errorItem}
                >
                  <strong>
                    {item.code !== undefined
                      ? `Error ${item.code}`
                      : `Error ${index + 1}`}
                  </strong>

                  <div>
                    {item.message ||
                      item.description ||
                      "Unknown error"}
                  </div>

                  {item.fieldName && (
                    <small>
                      Field: {item.fieldName}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {response.warnings?.length > 0 && (
            <div style={styles.messageSection}>
              <h3 style={styles.subTitle}>Warnings</h3>

              {response.warnings.map((item, index) => (
                <div
                  key={`warning-${index}`}
                  style={styles.warningItem}
                >
                  <strong>
                    {item.code !== undefined
                      ? `Warning ${item.code}`
                      : `Warning ${index + 1}`}
                  </strong>

                  <div>
                    {item.message ||
                      item.description ||
                      "Warning"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Raw response */}
          <details style={styles.details}>
            <summary style={styles.summary}>
              View Raw JSON
            </summary>

            <pre style={styles.json}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: "#f8fafc",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    maxWidth: "1400px",
    margin: "0 auto 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "28px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  apiBadge: {
    padding: "9px 13px",
    borderRadius: "8px",
    background: "#e2e8f0",
    color: "#334155",
    fontSize: "12px",
    fontFamily: "monospace",
  },

  card: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    padding: "22px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow: "0 2px 7px rgba(15, 23, 42, 0.04)",
    boxSizing: "border-box",
  },

  cardTitle: {
    margin: "0 0 18px",
    color: "#0f172a",
    fontSize: "19px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },

  formGroup: {
    minWidth: 0,
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
  },

  required: {
    color: "#dc2626",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
  },

  helpText: {
    display: "block",
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "22px",
  },

  primaryButton: {
    padding: "11px 20px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "11px 20px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },

  errorBox: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    padding: "15px 18px",
    borderRadius: "9px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#991b1b",
  },

  errorMessage: {
    marginTop: "6px",
  },

  successHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  successMessage: {
    margin: "-10px 0 18px",
    color: "#64748b",
    fontSize: "13px",
  },

  successBadge: {
    padding: "6px 11px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "11px",
    fontWeight: 700,
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
  },

  responseGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },

  infoBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "14px",
    borderRadius: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    minWidth: 0,
  },

  subTitle: {
    margin: "0 0 10px",
    fontSize: "15px",
    color: "#334155",
  },

  messageSection: {
    marginTop: "20px",
  },

  errorItem: {
    marginBottom: "8px",
    padding: "12px",
    borderRadius: "7px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
  },

  warningItem: {
    marginBottom: "8px",
    padding: "12px",
    borderRadius: "7px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    fontSize: "13px",
  },

  details: {
    marginTop: "20px",
  },

  summary: {
    cursor: "pointer",
    color: "#334155",
    fontWeight: 600,
    fontSize: "13px",
  },

  json: {
    marginTop: "10px",
    padding: "16px",
    borderRadius: "8px",
    background: "#0f172a",
    color: "#e2e8f0",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.6,
  },
};

export default ScanGatepassItem;