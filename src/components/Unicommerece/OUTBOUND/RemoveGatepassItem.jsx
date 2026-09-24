import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function RemoveGatepassItem() {
  const [facility, setFacility] = useState("MAIN");
  const [gatePassCode, setGatePassCode] = useState("");
  const [itemCode, setItemCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedFacility = facility.trim();
    const trimmedGatePassCode = gatePassCode.trim();
    const trimmedItemCode = itemCode.trim();

    if (!trimmedFacility) {
      setError("Facility is required.");
      return;
    }

    if (!trimmedGatePassCode) {
      setError("Gatepass code is required.");
      return;
    }

    if (!trimmedItemCode) {
      setError("Item barcode is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/gatepasses/remove-item`,
        {
          facility: trimmedFacility,
          gatePassCode: trimmedGatePassCode,
          itemCode: trimmedItemCode
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error(
        "Remove Gatepass Item Error:",
        err
      );

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to remove item from gatepass."
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
    setItemCode("");
    setResult(null);
    setError("");
  };

  // ----------------------------------------------------------
  // Request Preview
  // ----------------------------------------------------------

  const requestPreview = {
    facility,
    gatePassCode,
    itemCode
  };

  return (
    <div
      style={{
        maxWidth: "900px",
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
            Remove Item from Gatepass
          </h2>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px"
            }}
          >
            Remove a scanned item from a gatepass in
            Uniware. This API is available for facilities
            using item traceability.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Facility */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
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
              Uniware facility code sent in the Facility
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
              autoComplete="off"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Existing gatepass containing the item.
            </small>
          </div>

          {/* Item Barcode */}
          <div style={{ marginBottom: "22px" }}>
            <label style={labelStyle}>
              Item Barcode *
            </label>

            <input
              type="text"
              value={itemCode}
              onChange={(e) =>
                setItemCode(e.target.value)
              }
              placeholder="000002"
              autoComplete="off"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Enter the physical item barcode / itemCode.
              This API is for item traceability.
            </small>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "22px"
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
                ? "Removing..."
                : "Remove Item"}
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
                ? "Item Removed Successfully"
                : "Item Removal Failed"}
            </h3>

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
                        <div>
                          <strong>
                            {item.fieldName ||
                              "Gatepass"}:
                          </strong>{" "}
                          {item.message ||
                            item.description ||
                            "Unknown error"}
                        </div>

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
  background: "#d32f2f",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600"
};

const secondaryButtonStyle = {
  padding: "11px 20px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#fff",
  color: "#333",
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

export default RemoveGatepassItem;