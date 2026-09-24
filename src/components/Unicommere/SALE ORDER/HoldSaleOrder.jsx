import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function HoldSaleOrder() {
  const [saleOrderCode, setSaleOrderCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedCode = saleOrderCode.trim();

    if (!trimmedCode) {
      setError("Sale order code is required.");
      return;
    }

    const payload = {
      saleOrderCode: trimmedCode,
    };

    try {
      setLoading(true);

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/hold`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResult(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to hold sale order."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Reset
  // ---------------------------------------------------------
  const handleReset = () => {
    setSaleOrderCode("");
    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: "8px",
          }}
        >
          Hold Sale Order
        </h2>

        <p
          style={{
            margin: 0,
            color: "#666",
          }}
        >
          Hold processing of an existing sale order
          in Uniware.
        </p>
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            background: "#fff",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "18px",
            }}
          >
            Sale Order
          </h3>

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Sale Order Code *
          </label>

          <input
            type="text"
            value={saleOrderCode}
            onChange={(e) =>
              setSaleOrderCode(e.target.value)
            }
            placeholder="Example: SO1231100023"
            style={inputStyle}
          />

          <small
            style={{
              display: "block",
              marginTop: "6px",
              color: "#777",
            }}
          >
            Enter the Uniware sale order code that
            should be placed on hold.
          </small>
        </div>

        {/* ===================================================
            ERROR
        ==================================================== */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              background: "#fff0f0",
              border: "1px solid #ffb3b3",
              color: "#b00020",
              padding: "12px 16px",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        {/* ===================================================
            BUTTONS
        ==================================================== */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Holding..."
              : "Hold Sale Order"}
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

      {/* =====================================================
          RESULT
      ====================================================== */}
      {result && (
        <div
          style={{
            marginTop: "30px",
          }}
        >
          {/* Summary */}
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              border: result.successful
                ? "1px solid #b7dfb9"
                : "1px solid #ffb3b3",
              background: result.successful
                ? "#f0fff1"
                : "#fff5f5",
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              {result.successful
                ? "✓ Sale Order Held"
                : "✕ Hold Failed"}
            </h3>

            <div>
              <strong>Message:</strong>{" "}
              {result.message ||
                "No message returned"}
            </div>
          </div>

          {/* Errors */}
          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div
                style={{
                  marginTop: "20px",
                }}
              >
                <h3>Errors</h3>

                {result.errors.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={{
                        border:
                          "1px solid #ffcccc",
                        background:
                          "#fff5f5",
                        padding: "12px",
                        borderRadius:
                          "6px",
                        marginBottom:
                          "8px",
                      }}
                    >
                      <strong>
                        {item.fieldName ||
                          "Error"}
                      </strong>

                      <div>
                        {item.message ||
                          item.description ||
                          "Unknown error"}
                      </div>

                      {item.code !==
                        undefined && (
                        <small>
                          Code:{" "}
                          {item.code}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* Warnings */}
          {Array.isArray(result.warnings) &&
            result.warnings.length > 0 && (
              <div
                style={{
                  marginTop: "20px",
                }}
              >
                <h3>Warnings</h3>

                {result.warnings.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={{
                        border:
                          "1px solid #ffe0a3",
                        background:
                          "#fffaf0",
                        padding: "12px",
                        borderRadius:
                          "6px",
                        marginBottom:
                          "8px",
                      }}
                    >
                      <strong>
                        {item.message ||
                          "Warning"}
                      </strong>

                      {item.description && (
                        <div>
                          {
                            item.description
                          }
                        </div>
                      )}

                      {item.code !==
                        undefined && (
                        <small>
                          Code:{" "}
                          {item.code}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* Raw response */}
          <details
            style={{
              marginTop: "20px",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              View Raw Response
            </summary>

            <pre
              style={{
                marginTop: "12px",
                padding: "16px",
                background: "#f5f5f5",
                borderRadius: "6px",
                overflowX: "auto",
                fontSize: "13px",
              }}
            >
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
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "14px",
};

const primaryButtonStyle = {
  padding: "11px 20px",
  border: "none",
  borderRadius: "5px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  background: "#fff",
  color: "#333",
  cursor: "pointer",
  fontWeight: "600",
};

export default HoldSaleOrder;