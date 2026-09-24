import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const initialForm = {
  facility: "",
  itemSKU: "",
  quantity: "",
  shelfCode: "",
  inventoryType: "GOOD_INVENTORY",
  adjustmentType: "ADD",
  transferToShelfCode: "",
  sla: "",
  remarks: "",
};

const AdjustInventory = () => {
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

  const handleAdjustmentTypeChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      adjustmentType: value,
      transferToShelfCode:
        value === "TRANSFER"
          ? prev.transferToShelfCode
          : "",
    }));
  };

  const adjustInventory = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      // -----------------------------
      // Client validation
      // -----------------------------
      if (!form.facility.trim()) {
        throw new Error(
          "Facility Code is required."
        );
      }

      if (!form.itemSKU.trim()) {
        throw new Error(
          "Item SKU is required."
        );
      }

      if (form.quantity === "") {
        throw new Error(
          "Quantity is required."
        );
      }

      const numericQuantity =
        Number(form.quantity);

      if (
        !Number.isFinite(numericQuantity)
      ) {
        throw new Error(
          "Quantity must be a valid number."
        );
      }

      if (!form.shelfCode.trim()) {
        throw new Error(
          "Shelf Code is required."
        );
      }

      if (
        form.adjustmentType ===
          "TRANSFER" &&
        !form.transferToShelfCode.trim()
      ) {
        throw new Error(
          "Transfer To Shelf Code is required for TRANSFER."
        );
      }

      if (form.remarks.length > 255) {
        throw new Error(
          "Remarks cannot exceed 255 characters."
        );
      }

      if (form.sla !== "") {
        const numericSla =
          Number(form.sla);

        if (
          !Number.isFinite(numericSla)
        ) {
          throw new Error(
            "SLA must be a valid number."
          );
        }
      }

      // -----------------------------
      // Build request
      // -----------------------------
      const inventoryAdjustment = {
        itemSKU: form.itemSKU.trim(),
        quantity: numericQuantity,
        shelfCode: form.shelfCode.trim(),
        inventoryType:
          form.inventoryType,
        adjustmentType:
          form.adjustmentType,
      };

      if (
        form.adjustmentType ===
          "TRANSFER" &&
        form.transferToShelfCode.trim()
      ) {
        inventoryAdjustment.transferToShelfCode =
          form.transferToShelfCode.trim();
      }

      if (form.sla !== "") {
        inventoryAdjustment.sla =
          Number(form.sla);
      }

      if (form.remarks.trim()) {
        inventoryAdjustment.remarks =
          form.remarks.trim();
      }

      const payload = {
        facility: form.facility.trim(),
        inventoryAdjustment,
      };

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/inventory/adjust`,
        payload
      );

      setResponse(res.data);
    } catch (err) {
      console.error(
        "Adjust Inventory Error:",
        err
      );

      const apiError =
        err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]
            ?.message ||
          err.message ||
          "Failed to adjust inventory."
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

  const isTransfer =
    form.adjustmentType === "TRANSFER";

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Adjust Inventory
          </h1>

          <p style={styles.subtitle}>
            Adjust inventory for a single SKU
            in a Uniware facility.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={adjustInventory}
          style={styles.card}
        >
          <h2 style={styles.sectionTitle}>
            Inventory Adjustment
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

              <small style={styles.help}>
                Uniware facility code.
              </small>
            </div>

            {/* SKU */}
            <div>
              <label style={styles.label}>
                Item SKU *
              </label>

              <input
                type="text"
                name="itemSKU"
                value={form.itemSKU}
                onChange={handleChange}
                placeholder="Example: TN-WBH-001"
                style={styles.input}
              />

              <small style={styles.help}>
                Uniware Item Type SKU.
              </small>
            </div>

            {/* Quantity */}
            <div>
              <label style={styles.label}>
                Quantity *
              </label>

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Example: 10"
                style={styles.input}
              />
            </div>

            {/* Shelf */}
            <div>
              <label style={styles.label}>
                Shelf Code *
              </label>

              <input
                type="text"
                name="shelfCode"
                value={form.shelfCode}
                onChange={handleChange}
                placeholder="Example: A-01-01"
                style={styles.input}
              />
            </div>

            {/* Inventory Type */}
            <div>
              <label style={styles.label}>
                Inventory Type
              </label>

              <select
                name="inventoryType"
                value={form.inventoryType}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="GOOD_INVENTORY">
                  GOOD_INVENTORY
                </option>

                <option value="BAD_INVENTORY">
                  BAD_INVENTORY
                </option>

                <option value="QC_REJECTED">
                  QC_REJECTED
                </option>

                <option value="VIRTUAL_INVENTORY">
                  VIRTUAL_INVENTORY
                </option>
              </select>
            </div>

            {/* Adjustment Type */}
            <div>
              <label style={styles.label}>
                Adjustment Type *
              </label>

              <select
                name="adjustmentType"
                value={
                  form.adjustmentType
                }
                onChange={
                  handleAdjustmentTypeChange
                }
                style={styles.input}
              >
                <option value="ADD">
                  ADD
                </option>

                <option value="REMOVE">
                  REMOVE
                </option>

                <option value="REPLACE">
                  REPLACE
                </option>

                <option value="TRANSFER">
                  TRANSFER
                </option>
              </select>
            </div>

            {/* Transfer Shelf */}
            {isTransfer && (
              <div>
                <label style={styles.label}>
                  Transfer To Shelf Code *
                </label>

                <input
                  type="text"
                  name="transferToShelfCode"
                  value={
                    form.transferToShelfCode
                  }
                  onChange={handleChange}
                  placeholder="Example: B-01-02"
                  style={styles.input}
                />

                <small style={styles.help}>
                  Required for TRANSFER.
                </small>
              </div>
            )}

            {/* SLA */}
            <div>
              <label style={styles.label}>
                SLA
              </label>

              <input
                type="number"
                name="sla"
                value={form.sla}
                onChange={handleChange}
                placeholder="Optional"
                style={styles.input}
              />
            </div>
          </div>

          {/* Remarks */}
          <div style={styles.remarksBox}>
            <label style={styles.label}>
              Remarks
            </label>

            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              maxLength={255}
              rows={4}
              placeholder="Optional remarks"
              style={styles.textarea}
            />

            <div style={styles.characterCount}>
              {form.remarks.length}/255
            </div>
          </div>

          {/* Transfer Info */}
          {isTransfer && (
            <div style={styles.transferInfo}>
              <strong>
                Transfer:
              </strong>{" "}
              Inventory will be transferred from{" "}
              <strong>
                {form.shelfCode ||
                  "source shelf"}
              </strong>{" "}
              to{" "}
              <strong>
                {form.transferToShelfCode ||
                  "destination shelf"}
              </strong>
              .
            </div>
          )}

          {/* Buttons */}
          <div style={styles.buttonRow}>
            <button
              type="submit"
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? "Adjusting..."
                : "Adjust Inventory"}
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
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Uniware Response
            </h2>

            <div style={styles.summaryGrid}>
              <Info
                label="Successful"
                value={
                  response.successful
                    ? "Yes"
                    : "No"
                }
              />

              <Info
                label="Message"
                value={
                  response.message ||
                  "N/A"
                }
              />
            </div>

            {/* Errors */}
            {response.errors?.length >
              0 && (
              <div
                style={styles.errorBox}
              >
                <h3>
                  Uniware Errors
                </h3>

                {response.errors.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      style={
                        styles.messageItem
                      }
                    >
                      <strong>
                        {item.code ||
                          "Error"}
                      </strong>

                      {item.fieldName && (
                        <div>
                          <strong>
                            Field:
                          </strong>{" "}
                          {
                            item.fieldName
                          }
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
            {response.warnings
              ?.length > 0 && (
              <div
                style={
                  styles.warningBox
                }
              >
                <h3>
                  Uniware Warnings
                </h3>

                {response.warnings.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      style={
                        styles.messageItem
                      }
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

            {/* Request Summary */}
            {response.successful && (
              <div
                style={
                  styles.successBox
                }
              >
                Inventory adjustment
                request was accepted by
                Uniware.
              </div>
            )}
          </div>
        )}

        {/* Adjustment Explanation */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Adjustment Types
          </h2>

          <div style={styles.typeGrid}>
            <TypeCard
              title="ADD"
              description="Adds the specified quantity to existing inventory."
            />

            <TypeCard
              title="REMOVE"
              description="Subtracts the specified quantity from existing inventory."
            />

            <TypeCard
              title="REPLACE"
              description="Replaces the existing inventory quantity with the specified quantity."
            />

            <TypeCard
              title="TRANSFER"
              description="Transfers inventory from the source shelf to another shelf."
            />
          </div>
        </div>

        {/* Inventory Types */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Inventory Types
          </h2>

          <div style={styles.typeGrid}>
            <TypeCard
              title="GOOD_INVENTORY"
              description="Inventory in good condition and available for sale."
            />

            <TypeCard
              title="BAD_INVENTORY"
              description="Broken or expired non-sellable inventory."
            />

            <TypeCard
              title="QC_REJECTED"
              description="Inventory rejected by the warehouse quality team."
            />

            <TypeCard
              title="VIRTUAL_INVENTORY"
              description="Inventory that is not physically present in the warehouse."
            />
          </div>
        </div>

        {/* Raw Response */}
        {response && (
          <details
            style={styles.rawDetails}
          >
            <summary
              style={styles.rawSummary}
            >
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
        )}
      </div>
    </div>
  );
};

const Info = ({
  label,
  value,
}) => (
  <div style={styles.infoBox}>
    <div style={styles.infoLabel}>
      {label}
    </div>

    <div style={styles.infoValue}>
      {value}
    </div>
  </div>
);

const TypeCard = ({
  title,
  description,
}) => (
  <div style={styles.typeCard}>
    <div style={styles.typeTitle}>
      {title}
    </div>

    <div style={styles.typeDescription}>
      {description}
    </div>
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
    maxWidth: "1300px",
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
    marginBottom: "20px",
    fontSize: "21px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
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
    background: "#fff",
  },

  help: {
    display: "block",
    marginTop: "6px",
    color: "#777",
    fontSize: "12px",
  },

  remarksBox: {
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

  characterCount: {
    textAlign: "right",
    color: "#777",
    fontSize: "12px",
    marginTop: "5px",
  },

  transferInfo: {
    marginTop: "20px",
    padding: "14px",
    background: "#eef5ff",
    border:
      "1px solid #b9d3f5",
    borderRadius: "7px",
    color: "#174a7c",
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
    marginTop: "20px",
  },

  successBox: {
    background: "#edf8f0",
    border:
      "1px solid #a9d9b4",
    color: "#176b2c",
    padding: "15px",
    borderRadius: "7px",
    marginTop: "20px",
  },

  messageItem: {
    marginBottom: "10px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
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

  typeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
  },

  typeCard: {
    border:
      "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    background: "#fafafa",
  },

  typeTitle: {
    fontWeight: 700,
    fontSize: "14px",
    marginBottom: "8px",
  },

  typeDescription: {
    color: "#666",
    fontSize: "13px",
    lineHeight: 1.5,
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

export default AdjustInventory;