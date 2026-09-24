import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function UpdateGatepass() {
  const [facility, setFacility] = useState("MAIN");

  const [gatePassCode, setGatePassCode] = useState("");
  const [gatePassInternalCode, setGatePassInternalCode] = useState("");
  const [purpose, setPurpose] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [customFields, setCustomFields] = useState([
    {
      name: "",
      value: ""
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Custom fields
  // ----------------------------------------------------------

  const addCustomField = () => {
    setCustomFields((previous) => [
      ...previous,
      {
        name: "",
        value: ""
      }
    ]);
  };

  const removeCustomField = (index) => {
    setCustomFields((previous) =>
      previous.filter((_, fieldIndex) => fieldIndex !== index)
    );
  };

  const updateCustomField = (index, key, value) => {
    setCustomFields((previous) =>
      previous.map((field, fieldIndex) =>
        fieldIndex === index
          ? {
              ...field,
              [key]: value
            }
          : field
      )
    );
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedFacility = facility.trim();
    const trimmedGatePassCode = gatePassCode.trim();

    if (!trimmedFacility) {
      setError("Facility is required.");
      return;
    }

    if (!trimmedGatePassCode) {
      setError("Gatepass code is required.");
      return;
    }

    if (purpose.length > 500) {
      setError("Purpose cannot exceed 500 characters.");
      return;
    }

    if (referenceNumber.length > 45) {
      setError("Reference number cannot exceed 45 characters.");
      return;
    }

    if (
      transferAmount !== "" &&
      !Number.isFinite(Number(transferAmount))
    ) {
      setError("Transfer amount must be a valid number.");
      return;
    }

    const cleanedCustomFields = customFields
      .filter((field) => field.name.trim())
      .map((field) => {
        const customField = {
          name: field.name.trim()
        };

        if (field.value !== "") {
          customField.value = field.value;
        }

        return customField;
      });

    const wsGatePass = {};

    if (gatePassInternalCode.trim()) {
      wsGatePass.code = gatePassInternalCode.trim();
    }

    if (purpose.trim()) {
      wsGatePass.purpose = purpose.trim();
    }

    if (transferAmount !== "") {
      wsGatePass.transferAmount = Number(transferAmount);
    }

    if (referenceNumber.trim()) {
      wsGatePass.referenceNumber =
        referenceNumber.trim();
    }

    if (cleanedCustomFields.length > 0) {
      wsGatePass.customFieldValues =
        cleanedCustomFields;
    }

    const payload = {
      facility: trimmedFacility,
      gatePassCode: trimmedGatePassCode,
      wsGatePass
    };

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/gatepasses/update`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      console.error("Update Gatepass Error:", err);

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to update gatepass."
      );

      setResult(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Reset
  // ----------------------------------------------------------

  const handleReset = () => {
    setGatePassCode("");
    setGatePassInternalCode("");
    setPurpose("");
    setTransferAmount("");
    setReferenceNumber("");

    setCustomFields([
      {
        name: "",
        value: ""
      }
    ]);

    setResult(null);
    setError("");
  };

  // ----------------------------------------------------------
  // Request preview
  // ----------------------------------------------------------

  const requestPreview = {
    facility,
    gatePassCode,
    wsGatePass: {
      ...(gatePassInternalCode.trim()
        ? {
            code: gatePassInternalCode.trim()
          }
        : {}),
      ...(purpose.trim()
        ? {
            purpose: purpose.trim()
          }
        : {}),
      ...(transferAmount !== ""
        ? {
            transferAmount: Number(transferAmount)
          }
        : {}),
      ...(referenceNumber.trim()
        ? {
            referenceNumber: referenceNumber.trim()
          }
        : {}),
      ...(customFields.filter((field) =>
        field.name.trim()
      ).length > 0
        ? {
            customFieldValues: customFields
              .filter((field) => field.name.trim())
              .map((field) => ({
                name: field.name.trim(),
                ...(field.value !== ""
                  ? { value: field.value }
                  : {})
              }))
          }
        : {})
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "26px",
          boxShadow: "0 3px 14px rgba(0,0,0,0.08)"
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <h2
            style={{
              margin: 0,
              marginBottom: "8px",
              color: "#222"
            }}
          >
            Update Gatepass
          </h2>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px"
            }}
          >
            Modify the details of an existing Uniware
            gatepass.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Facility */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600"
              }}
            >
              Facility *
            </label>

            <input
              type="text"
              value={facility}
              onChange={(e) =>
                setFacility(e.target.value)
              }
              placeholder="MAIN"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Uniware facility code used in the request
              header.
            </small>
          </div>

          {/* Gatepass Code */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Gatepass Code *
            </label>

            <input
              type="text"
              value={gatePassCode}
              onChange={(e) =>
                setGatePassCode(e.target.value)
              }
              placeholder="GP000123"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Existing gatepass code to update.
            </small>
          </div>

          {/* Gatepass Details */}
          <div
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "18px",
              marginBottom: "20px"
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "18px"
              }}
            >
              Gatepass Details
            </h3>

            {/* Code */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>
                Code
              </label>

              <input
                type="text"
                value={gatePassInternalCode}
                onChange={(e) =>
                  setGatePassInternalCode(
                    e.target.value
                  )
                }
                placeholder="Optional gatepass code"
                style={inputStyle}
              />
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>
                Purpose
              </label>

              <textarea
                value={purpose}
                onChange={(e) =>
                  setPurpose(e.target.value)
                }
                placeholder="Enter gatepass purpose"
                maxLength={500}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical"
                }}
              />

              <small style={helpStyle}>
                {purpose.length}/500 characters
              </small>
            </div>

            {/* Transfer Amount */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>
                Transfer Amount
              </label>

              <input
                type="number"
                value={transferAmount}
                onChange={(e) =>
                  setTransferAmount(e.target.value)
                }
                placeholder="0"
                step="any"
                style={inputStyle}
              />
            </div>

            {/* Reference Number */}
            <div style={{ marginBottom: "5px" }}>
              <label style={labelStyle}>
                Reference Number
              </label>

              <input
                type="text"
                value={referenceNumber}
                onChange={(e) =>
                  setReferenceNumber(e.target.value)
                }
                placeholder="REF-001"
                maxLength={45}
                style={inputStyle}
              />

              <small style={helpStyle}>
                {referenceNumber.length}/45 characters
              </small>
            </div>
          </div>

          {/* Custom Fields */}
          <div
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "18px",
              marginBottom: "20px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}
            >
              <h3 style={{ margin: 0 }}>
                Custom Fields
              </h3>

              <button
                type="button"
                onClick={addCustomField}
                style={secondaryButtonStyle}
              >
                + Add Field
              </button>
            </div>

            {customFields.map((field, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr auto",
                  gap: "10px",
                  marginBottom: "10px"
                }}
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
                  style={inputStyle}
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
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={() =>
                    removeCustomField(index)
                  }
                  disabled={customFields.length === 1}
                  style={{
                    ...dangerButtonStyle,
                    opacity:
                      customFields.length === 1
                        ? 0.5
                        : 1
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px"
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading
                ? "Updating..."
                : "Update Gatepass"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              style={secondaryButtonStyle}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              background: "#ffebee",
              border: "1px solid #ef9a9a",
              borderRadius: "7px",
              color: "#c62828"
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Request Preview */}
        <details
          style={{
            marginBottom: "20px"
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Request Preview
          </summary>

          <pre style={preStyle}>
            {JSON.stringify(
              requestPreview,
              null,
              2
            )}
          </pre>
        </details>

        {/* Result */}
        {result && (
          <div
            style={{
              padding: "18px",
              background: result.successful
                ? "#e8f5e9"
                : "#fff3e0",
              border: `1px solid ${
                result.successful
                  ? "#81c784"
                  : "#ffb74d"
              }`,
              borderRadius: "8px"
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: result.successful
                  ? "#2e7d32"
                  : "#e65100"
              }}
            >
              {result.successful
                ? "Gatepass Updated Successfully"
                : "Gatepass Update Failed"}
            </h3>

            {result.gatePassCode && (
              <div
                style={{
                  marginBottom: "10px"
                }}
              >
                <strong>Gatepass Code:</strong>{" "}
                {result.gatePassCode}
              </div>
            )}

            {result.message && (
              <div
                style={{
                  marginBottom: "14px"
                }}
              >
                <strong>Message:</strong>{" "}
                {result.message}
              </div>
            )}

            {/* Errors */}
            {Array.isArray(result.errors) &&
              result.errors.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                  <h4>Errors</h4>

                  {result.errors.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={{
                          background: "#fff",
                          border: "1px solid #ef9a9a",
                          borderRadius: "5px",
                          padding: "10px",
                          marginBottom: "7px"
                        }}
                      >
                        <strong>
                          {item.fieldName ||
                            "Gatepass"}
                          :
                        </strong>{" "}
                        {item.message ||
                          item.description ||
                          "Unknown error"}

                        {item.code !==
                          undefined && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#777",
                              marginTop: "4px"
                            }}
                          >
                            Error Code:{" "}
                            {item.code}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Warnings */}
            {Array.isArray(result.warnings) &&
              result.warnings.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                  <h4>Warnings</h4>

                  {result.warnings.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={{
                          background: "#fff",
                          border: "1px solid #ffcc80",
                          borderRadius: "5px",
                          padding: "10px",
                          marginBottom: "7px"
                        }}
                      >
                        {item.message ||
                          item.description ||
                          "Warning"}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Raw Response */}
            <details>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Raw Response
              </summary>

              <pre style={preStyle}>
                {JSON.stringify(
                  result,
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Styles
// ------------------------------------------------------------

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none"
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600"
};

const helpStyle = {
  display: "block",
  marginTop: "5px",
  color: "#777",
  fontSize: "12px"
};

const primaryButtonStyle = {
  padding: "11px 20px",
  border: "none",
  borderRadius: "6px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600"
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#fff",
  color: "#333",
  cursor: "pointer",
  fontWeight: "600"
};

const dangerButtonStyle = {
  padding: "10px 14px",
  border: "1px solid #e57373",
  borderRadius: "6px",
  background: "#ffebee",
  color: "#c62828",
  cursor: "pointer",
  fontWeight: "600"
};

const preStyle = {
  marginTop: "12px",
  padding: "14px",
  background: "#f5f5f5",
  borderRadius: "6px",
  overflowX: "auto",
  fontSize: "12px",
  lineHeight: "1.5"
};

export default UpdateGatepass;