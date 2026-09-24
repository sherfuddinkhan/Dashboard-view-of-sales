import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function VerifySaleOrder() {
  const [saleOrderCode, setSaleOrderCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const code = saleOrderCode.trim();

    if (!code) {
      setError("Sale order code is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/verify`,
        {
          saleOrderCode: code,
        }
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          err.message ||
          "Failed to verify sale order."
      );

      setResult(apiError || null);
    } finally {
      setLoading(false);
    }
  };

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
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>
        Verify Sale Order
      </h2>

      <p
        style={{
          color: "#666",
          marginBottom: "24px",
        }}
      >
        Accept a sale order that is currently in
        <strong> Pending Verification </strong>
        status so that Uniware can move it to processing.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "22px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "7px",
            }}
          >
            Sale Order Code *
          </label>

          <input
            type="text"
            value={saleOrderCode}
            onChange={(event) =>
              setSaleOrderCode(event.target.value)
            }
            placeholder="Enter sale order code"
            style={{
              width: "100%",
              padding: "11px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <small
            style={{
              display: "block",
              marginTop: "6px",
              color: "#777",
            }}
          >
            Example: SO123456
          </small>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "18px",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#1976d2",
              color: "#fff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "15px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Verifying..." : "Verify Sale Order"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#757575",
              color: "#fff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "15px",
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Verification Response</h3>

          <div
            style={{
              padding: "14px",
              marginBottom: "18px",
              background: result.successful
                ? "#e8f5e9"
                : "#ffebee",
              color: result.successful
                ? "#2e7d32"
                : "#c62828",
              borderRadius: "6px",
            }}
          >
            <strong>
              {result.successful
                ? "Sale Order Verified Successfully"
                : "Sale Order Verification Failed"}
            </strong>

            {result.message && (
              <div style={{ marginTop: "6px" }}>
                {result.message}
              </div>
            )}
          </div>

          {/* Errors */}
          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h4>Errors</h4>

                {result.errors.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginBottom: "8px",
                      background: "#ffebee",
                      borderRadius: "5px",
                    }}
                  >
                    <div>
                      <strong>
                        {item.fieldName || "Error"}
                      </strong>
                    </div>

                    <div style={{ marginTop: "4px" }}>
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
              <div style={{ marginBottom: "20px" }}>
                <h4>Warnings</h4>

                {result.warnings.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginBottom: "8px",
                      background: "#fff8e1",
                      borderRadius: "5px",
                    }}
                  >
                    <div>
                      {item.message ||
                        item.description ||
                        "Warning"}
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

          {/* Raw Response */}
          <details>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Raw Response
            </summary>

            <pre
              style={{
                marginTop: "10px",
                padding: "15px",
                background: "#f5f5f5",
                borderRadius: "6px",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default VerifySaleOrder;