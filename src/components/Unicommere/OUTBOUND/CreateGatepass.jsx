import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GATEPASS_TYPES = [
  "RETURNABLE",
  "NON_RETURNABLE",
  "RETURN_TO_VENDOR",
  "STOCK_TRANSFER",
];

function CreateGatepass() {
  const [facility, setFacility] = useState("MAIN");
  const [code, setCode] = useState("");
  const [purpose, setPurpose] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [referenceNumber, setReferenceNumber] =
    useState("");

  const [type, setType] = useState("RETURNABLE");
  const [partyCode, setPartyCode] = useState("");

  const [customFields, setCustomFields] = useState([]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [createdGatePassCode, setCreatedGatePassCode] =
    useState("");
  const [error, setError] = useState("");

  const addCustomField = () => {
    setCustomFields((current) => [
      ...current,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const updateCustomField = (index, field, value) => {
    setCustomFields((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeCustomField = (index) => {
    setCustomFields((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const createGatepass = async (e) => {
    e.preventDefault();

    const facilityValue = facility.trim();
    const codeValue = code.trim();
    const partyCodeValue = partyCode.trim();

    if (!facilityValue) {
      setError("Facility code is required.");
      return;
    }

    if (!codeValue) {
      setError("Gatepass code is required.");
      return;
    }

    if (!type) {
      setError("Gatepass type is required.");
      return;
    }

    if (!partyCodeValue) {
      setError("Party code is required.");
      return;
    }

    if (purpose.length > 500) {
      setError(
        "Purpose cannot exceed 500 characters."
      );
      return;
    }

    if (referenceNumber.length > 45) {
      setError(
        "Reference number cannot exceed 45 characters."
      );
      return;
    }

    if (
      transferAmount !== "" &&
      !Number.isFinite(Number(transferAmount))
    ) {
      setError(
        "Transfer amount must be a valid number."
      );
      return;
    }

    const validCustomFields = customFields
      .filter(
        (field) =>
          field.name.trim() !== ""
      )
      .map((field) => ({
        name: field.name.trim(),
        value: field.value,
      }));

    const payload = {
      facility: facilityValue,

      wsGatePass: {
        code: codeValue,

        ...(purpose.trim()
          ? {
              purpose: purpose.trim(),
            }
          : {}),

        ...(transferAmount !== ""
          ? {
              transferAmount: Number(
                transferAmount
              ),
            }
          : {}),

        ...(referenceNumber.trim()
          ? {
              referenceNumber:
                referenceNumber.trim(),
            }
          : {}),

        ...(validCustomFields.length > 0
          ? {
              customFieldValues:
                validCustomFields,
            }
          : {}),
      },

      type,

      partyCode: partyCodeValue,
    };

    setLoading(true);
    setError("");
    setResponse(null);
    setCreatedGatePassCode("");

    try {
      const res = await axios.post(
        `${SERVER_URL}/api/uniware/gatepasses/create`,
        payload
      );

      setResponse(res.data);

      if (res.data?.gatePassCode) {
        setCreatedGatePassCode(
          res.data.gatePassCode
        );
      }

      if (res.data?.successful === false) {
        const apiMessage =
          res.data?.message ||
          res.data?.errors?.[0]?.message ||
          res.data?.errors?.[0]?.description;

        setError(
          apiMessage ||
            "Uniware could not create the gatepass."
        );
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
          "Failed to create gatepass."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFacility("MAIN");
    setCode("");
    setPurpose("");
    setTransferAmount("");
    setReferenceNumber("");
    setType("RETURNABLE");
    setPartyCode("");
    setCustomFields([]);
    setLoading(false);
    setResponse(null);
    setCreatedGatePassCode("");
    setError("");
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Create Gatepass
          </h1>

          <p style={styles.subtitle}>
            Create a Uniware gatepass with party,
            purpose and transfer details.
          </p>
        </div>

        <div style={styles.apiBadge}>
          POST /purchase/gatepass/create
        </div>
      </div>

      {/* Form */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          Gatepass Details
        </h2>

        <form onSubmit={createGatepass}>
          <div style={styles.formGrid}>
            {/* Facility */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Facility Code{" "}
                <span style={styles.required}>
                  *
                </span>
              </label>

              <input
                type="text"
                value={facility}
                onChange={(e) =>
                  setFacility(e.target.value)
                }
                placeholder="MAIN"
                style={styles.input}
              />

              <small style={styles.helpText}>
                Sent as the Uniware Facility header.
              </small>
            </div>

            {/* Gatepass Code */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Gatepass Code{" "}
                <span style={styles.required}>
                  *
                </span>
              </label>

              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value)
                }
                placeholder="GP000123"
                style={styles.input}
              />
            </div>

            {/* Type */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Gatepass Type{" "}
                <span style={styles.required}>
                  *
                </span>
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
                style={styles.input}
              >
                {GATEPASS_TYPES.map(
                  (gatepassType) => (
                    <option
                      key={gatepassType}
                      value={gatepassType}
                    >
                      {gatepassType}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Party Code */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Party Code{" "}
                <span style={styles.required}>
                  *
                </span>
              </label>

              <input
                type="text"
                value={partyCode}
                onChange={(e) =>
                  setPartyCode(e.target.value)
                }
                placeholder="VENDOR001"
                style={styles.input}
              />

              <small style={styles.helpText}>
                Uniware party/vendor/customer code.
              </small>
            </div>

            {/* Transfer Amount */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Transfer Amount
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={transferAmount}
                onChange={(e) =>
                  setTransferAmount(
                    e.target.value
                  )
                }
                placeholder="0"
                style={styles.input}
              />
            </div>

            {/* Reference Number */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Reference Number
              </label>

              <input
                type="text"
                maxLength={45}
                value={referenceNumber}
                onChange={(e) =>
                  setReferenceNumber(
                    e.target.value
                  )
                }
                placeholder="Reference number"
                style={styles.input}
              />

              <small style={styles.helpText}>
                Maximum 45 characters.
              </small>
            </div>

            {/* Purpose */}
            <div
              style={{
                ...styles.formGroup,
                gridColumn: "1 / -1",
              }}
            >
              <label style={styles.label}>
                Purpose
              </label>

              <textarea
                rows={4}
                maxLength={500}
                value={purpose}
                onChange={(e) =>
                  setPurpose(e.target.value)
                }
                placeholder="Enter gatepass purpose..."
                style={{
                  ...styles.input,
                  resize: "vertical",
                }}
              />

              <small style={styles.helpText}>
                {purpose.length}/500 characters
              </small>
            </div>
          </div>

          {/* Custom Fields */}
          <div style={styles.customSection}>
            <div style={styles.customHeader}>
              <div>
                <h3 style={styles.subTitle}>
                  Custom Fields
                </h3>

                <p style={styles.sectionHelp}>
                  Optional Uniware custom field
                  values.
                </p>
              </div>

              <button
                type="button"
                onClick={addCustomField}
                style={styles.addButton}
              >
                + Add Field
              </button>
            </div>

            {customFields.length === 0 && (
              <div style={styles.empty}>
                No custom fields added.
              </div>
            )}

            {customFields.map(
              (field, index) => (
                <div
                  key={index}
                  style={styles.customRow}
                >
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      updateCustomField(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Field name"
                    style={styles.input}
                  />

                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) =>
                      updateCustomField(
                        index,
                        "value",
                        e.target.value
                      )
                    }
                    placeholder="Field value"
                    style={styles.input}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeCustomField(index)
                    }
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>

          {/* Buttons */}
          <div style={styles.buttonRow}>
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
                : "Create Gatepass"}
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
          <strong>Request Failed</strong>

          <div style={styles.errorMessage}>
            {error}
          </div>
        </div>
      )}

      {/* Success */}
      {createdGatePassCode && (
        <div style={styles.successBox}>
          <div>
            <div style={styles.successTitle}>
              Gatepass Created
            </div>

            <div style={styles.successText}>
              Gatepass Code
            </div>

            <div style={styles.gatePassCode}>
              {createdGatePassCode}
            </div>
          </div>

          <a
            href={`/gatepasses/scan-item`}
            style={styles.scanButton}
          >
            Scan Items →
          </a>
        </div>
      )}

      {/* Response */}
      {response && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            API Response
          </h2>

          <div style={styles.responseGrid}>
            <div style={styles.infoBox}>
              <span style={styles.label}>
                Successful
              </span>

              <strong
                style={{
                  color: response.successful
                    ? "#166534"
                    : "#991b1b",
                }}
              >
                {response.successful
                  ? "Yes"
                  : "No"}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>
                Message
              </span>

              <strong>
                {response.message ||
                  "N/A"}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>
                Gatepass Code
              </span>

              <strong>
                {response.gatePassCode ||
                  "N/A"}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>
                Errors
              </span>

              <strong>
                {response.errors?.length || 0}
              </strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>
                Warnings
              </span>

              <strong>
                {response.warnings?.length || 0}
              </strong>
            </div>
          </div>

          {/* Errors */}
          {response.errors?.length > 0 && (
            <div style={styles.messageSection}>
              <h3 style={styles.subTitle}>
                Errors
              </h3>

              {response.errors.map(
                (item, index) => (
                  <div
                    key={`error-${index}`}
                    style={styles.errorItem}
                  >
                    <strong>
                      {item.code !== undefined
                        ? `Error ${item.code}`
                        : `Error ${
                            index + 1
                          }`}
                    </strong>

                    <div>
                      {item.message ||
                        item.description ||
                        "Unknown error"}
                    </div>

                    {item.fieldName && (
                      <small>
                        Field:{" "}
                        {item.fieldName}
                      </small>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* Warnings */}
          {response.warnings?.length > 0 && (
            <div style={styles.messageSection}>
              <h3 style={styles.subTitle}>
                Warnings
              </h3>

              {response.warnings.map(
                (item, index) => (
                  <div
                    key={`warning-${index}`}
                    style={styles.warningItem}
                  >
                    <strong>
                      {item.code !== undefined
                        ? `Warning ${item.code}`
                        : `Warning ${
                            index + 1
                          }`}
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

          <details style={styles.details}>
            <summary style={styles.summary}>
              View Raw JSON
            </summary>

            <pre style={styles.json}>
              {JSON.stringify(
                response,
                null,
                2
              )}
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
    fontFamily:
      "Arial, Helvetica, sans-serif",
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
    boxShadow:
      "0 2px 7px rgba(15, 23, 42, 0.04)",
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

  customSection: {
    marginTop: "26px",
    paddingTop: "22px",
    borderTop:
      "1px solid #e2e8f0",
  },

  customHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "14px",
  },

  subTitle: {
    margin: "0 0 5px",
    fontSize: "15px",
    color: "#334155",
  },

  sectionHelp: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
  },

  addButton: {
    padding: "8px 13px",
    border: "1px solid #bfdbfe",
    borderRadius: "7px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 600,
    cursor: "pointer",
  },

  customRow: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr auto",
    gap: "10px",
    marginBottom: "10px",
    alignItems: "center",
  },

  removeButton: {
    padding: "10px 13px",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    background: "#fef2f2",
    color: "#b91c1c",
    cursor: "pointer",
  },

  empty: {
    padding: "14px",
    borderRadius: "7px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "13px",
  },

  errorBox: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    padding: "15px 18px",
    borderRadius: "9px",
    border:
      "1px solid #fecaca",
    background: "#fef2f2",
    color: "#991b1b",
  },

  errorMessage: {
    marginTop: "6px",
  },

  successBox: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    padding: "18px 20px",
    borderRadius: "10px",
    border:
      "1px solid #bbf7d0",
    background: "#f0fdf4",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  successTitle: {
    color: "#166534",
    fontSize: "17px",
    fontWeight: 700,
  },

  successText: {
    marginTop: "7px",
    color: "#64748b",
    fontSize: "12px",
  },

  gatePassCode: {
    marginTop: "4px",
    color: "#14532d",
    fontSize: "20px",
    fontWeight: 700,
    fontFamily: "monospace",
  },

  scanButton: {
    padding: "11px 18px",
    borderRadius: "7px",
    background: "#166534",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 600,
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
    border:
      "1px solid #e2e8f0",
    color: "#0f172a",
    minWidth: 0,
  },

  messageSection: {
    marginTop: "20px",
  },

  errorItem: {
    marginBottom: "8px",
    padding: "12px",
    borderRadius: "7px",
    background: "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
  },

  warningItem: {
    marginBottom: "8px",
    padding: "12px",
    borderRadius: "7px",
    background: "#fffbeb",
    border:
      "1px solid #fde68a",
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

export default CreateGatepass;