import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CompleteGatepass() {
  const [facility, setFacility] = useState("MAIN");
  const [gatePassCode, setGatePassCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/gatepasses/complete`,
        {
          facility: trimmedFacility,
          gatePassCode: trimmedGatePassCode
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error("Complete Gatepass Error:", err);

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to complete gatepass."
      );

      setResult(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGatePassCode("");
    setResult(null);
    setError("");
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
          padding: "24px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.08)"
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              margin: 0,
              marginBottom: "8px",
              color: "#222"
            }}
          >
            Complete Gatepass
          </h2>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px"
            }}
          >
            Mark a Uniware gatepass as complete after all required items have
            been scanned.
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
              onChange={(e) => setFacility(e.target.value)}
              placeholder="MAIN"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />

            <small style={{ color: "#777" }}>
              Uniware facility code used in the Facility header.
            </small>
          </div>

          {/* Gatepass Code */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: "600"
              }}
            >
              Gatepass Code *
            </label>

            <input
              type="text"
              value={gatePassCode}
              onChange={(e) => setGatePassCode(e.target.value)}
              placeholder="GP000123"
              autoComplete="off"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px"
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 20px",
                border: "none",
                borderRadius: "6px",
                background: loading ? "#999" : "#1976d2",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600"
              }}
            >
              {loading ? "Completing..." : "Complete Gatepass"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              style={{
                padding: "11px 20px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                background: "#fff",
                color: "#333",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600"
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: "#ffebee",
              border: "1px solid #ef9a9a",
              borderRadius: "6px",
              color: "#c62828"
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              background: result.successful ? "#e8f5e9" : "#fff3e0",
              border: `1px solid ${
                result.successful ? "#81c784" : "#ffb74d"
              }`,
              borderRadius: "8px"
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: result.successful ? "#2e7d32" : "#e65100"
              }}
            >
              {result.successful
                ? "Gatepass Completed Successfully"
                : "Gatepass Completion Failed"}
            </h3>

            {result.message && (
              <p style={{ marginBottom: "12px" }}>
                <strong>Message:</strong> {result.message}
              </p>
            )}

            {/* Errors */}
            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ marginBottom: "8px" }}>Errors</h4>

                {result.errors.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginBottom: "7px",
                      background: "#fff",
                      border: "1px solid #ef9a9a",
                      borderRadius: "5px"
                    }}
                  >
                    <div>
                      <strong>
                        {item.fieldName || "Gatepass"}:
                      </strong>{" "}
                      {item.message || item.description || "Unknown error"}
                    </div>

                    {item.code !== undefined && (
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        Error Code: {item.code}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {Array.isArray(result.warnings) &&
              result.warnings.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                  <h4 style={{ marginBottom: "8px" }}>Warnings</h4>

                  {result.warnings.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "10px",
                        marginBottom: "7px",
                        background: "#fff",
                        border: "1px solid #ffcc80",
                        borderRadius: "5px"
                      }}
                    >
                      {item.message || item.description || "Warning"}
                    </div>
                  ))}
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

              <pre
                style={{
                  marginTop: "12px",
                  padding: "14px",
                  background: "#f5f5f5",
                  borderRadius: "6px",
                  overflowX: "auto",
                  fontSize: "12px"
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompleteGatepass;