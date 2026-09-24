import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function MarkDispatchedShippingPackage() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingPackageCode: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ----------------------------------------------------------
  // Handle input changes
  // ----------------------------------------------------------

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ----------------------------------------------------------
  // Mark dispatched
  // ----------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const facility =
      form.facility.trim();

    const shippingPackageCode =
      form.shippingPackageCode.trim();

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!facility) {
      setError(
        "Facility is required."
      );
      return;
    }

    if (!shippingPackageCode) {
      setError(
        "Shipping Package Code is required."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/shipping-packages/dispatch`,
          {
            facility,
            shippingPackageCode,
          }
        );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to mark shipping package as dispatched."
      );

      if (responseData) {
        setResult(responseData);
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Clear
  // ----------------------------------------------------------

  const handleClear = () => {
    setForm({
      facility: "MAIN",
      shippingPackageCode: "",
    });

    setError("");
    setResult(null);
  };

  return (
    <div
      style={{
        maxWidth: "950px",
        margin: "30px auto",
        padding: "24px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "28px",
          boxShadow:
            "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}

        <div
          style={{
            marginBottom: "26px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "27px",
            }}
          >
            Mark Dispatched Shipping Package
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            Mark a shipping package as
            dispatched in Uniware using its
            shipping package code.
          </p>

          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "5px",
              background: "#fef3c7",
              color: "#92400e",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            FACILITY LEVEL — FACILITY HEADER REQUIRED
          </span>
        </div>

        {/* ------------------------------------------------ */}
        {/* Form */}
        {/* ------------------------------------------------ */}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "18px",
              padding: "20px",
              background: "#fafafa",
              border:
                "1px solid #e5e7eb",
              borderRadius: "9px",
            }}
          >
            {/* Facility */}
            <div>
              <label
                style={labelStyle}
              >
                Facility *
              </label>

              <input
                type="text"
                name="facility"
                value={form.facility}
                onChange={handleChange}
                placeholder="MAIN"
                style={inputStyle}
              />

              <small
                style={helpStyle}
              >
                Uniware facility code.
              </small>
            </div>

            {/* Shipping Package */}
            <div>
              <label
                style={labelStyle}
              >
                Shipping Package Code *
              </label>

              <input
                type="text"
                name="shippingPackageCode"
                value={
                  form.shippingPackageCode
                }
                onChange={handleChange}
                placeholder="SHP00001"
                style={inputStyle}
              />

              <small
                style={helpStyle}
              >
                The Uniware shipping package
                code to dispatch.
              </small>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* Actions */}
          {/* ------------------------------------------------ */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "22px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px 22px",
                border: "none",
                borderRadius: "7px",
                background: "#16a34a",
                color: "#fff",
                fontWeight: 700,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? "Dispatching..."
                : "Mark Dispatched"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={
                clearButtonStyle
              }
            >
              Clear
            </button>
          </div>
        </form>

        {/* ------------------------------------------------ */}
        {/* Error */}
        {/* ------------------------------------------------ */}

        {error && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#fef2f2",
              border:
                "1px solid #fecaca",
              borderRadius: "8px",
              color: "#b91c1c",
            }}
          >
            <strong>
              Error:
            </strong>{" "}
            {error}
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* Result */}
        {/* ------------------------------------------------ */}

        {result && (
          <DispatchResult
            result={result}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Dispatch Result
// ============================================================

function DispatchResult({ result }) {
  const successful =
    result.successful === true;

  const cancelledOnChannel =
    result.cancelledOnChannel;

  return (
    <div
      style={{
        marginTop: "30px",
      }}
    >
      <h3
        style={{
          marginBottom: "16px",
        }}
      >
        Dispatch Result
      </h3>

      {/* Status */}
      <div
        style={{
          padding: "20px",
          borderRadius: "9px",
          background: successful
            ? "#f0fdf4"
            : "#fef2f2",
          border: `1px solid ${
            successful
              ? "#bbf7d0"
              : "#fecaca"
          }`,
        }}
      >
        <div
          style={{
            fontSize: "19px",
            fontWeight: 700,
            color: successful
              ? "#15803d"
              : "#b91c1c",
          }}
        >
          {successful
            ? "✓ Shipping Package Dispatched"
            : "✕ Dispatch Failed"}
        </div>

        <div
          style={{
            marginTop: "8px",
            color: "#374151",
          }}
        >
          {result.message ||
            "N/A"}
        </div>
      </div>

      {/* Result information */}
      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "15px",
        }}
      >
        <ResultCard
          label="Shipping Package Code"
          value={
            result.shippingPackageCode
          }
        />

        <ResultCard
          label="Cancelled On Channel"
          value={
            cancelledOnChannel ===
            undefined
              ? "N/A"
              : cancelledOnChannel
                ? "Yes"
                : "No"
          }
        />

        <ResultCard
          label="Successful"
          value={
            result.successful ===
            undefined
              ? "N/A"
              : result.successful
                ? "Yes"
                : "No"
          }
        />
      </div>

      {/* Errors */}
      {Array.isArray(
        result.errors
      ) &&
        result.errors.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#fef2f2",
              border:
                "1px solid #fecaca",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                marginTop: 0,
                color: "#b91c1c",
              }}
            >
              Uniware Errors
            </h4>

            {result.errors.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    padding:
                      "10px 0",
                    borderBottom:
                      "1px solid #fee2e2",
                  }}
                >
                  <div>
                    <strong>
                      Code:
                    </strong>{" "}
                    {item.code ??
                      "N/A"}
                  </div>

                  <div>
                    <strong>
                      Field:
                    </strong>{" "}
                    {item.fieldName ||
                      "N/A"}
                  </div>

                  <div>
                    <strong>
                      Message:
                    </strong>{" "}
                    {item.message ||
                      item.description ||
                      "N/A"}
                  </div>

                  {item.errorParams && (
                    <pre
                      style={{
                        marginTop:
                          "8px",
                        padding:
                          "10px",
                        background:
                          "#fff",
                        border:
                          "1px solid #e5e7eb",
                        overflowX:
                          "auto",
                      }}
                    >
                      {JSON.stringify(
                        item.errorParams,
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
              )
            )}
          </div>
        )}

      {/* Warnings */}
      {Array.isArray(
        result.warnings
      ) &&
        result.warnings.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#fffbeb",
              border:
                "1px solid #fde68a",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                marginTop: 0,
                color: "#92400e",
              }}
            >
              Uniware Warnings
            </h4>

            {result.warnings.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    marginBottom:
                      "8px",
                  }}
                >
                  <strong>
                    {item.code ??
                      "Warning"}
                    :
                  </strong>{" "}
                  {item.message ||
                    item.description ||
                    "N/A"}
                </div>
              )
            )}
          </div>
        )}

      {/* Raw response */}
      <details
        style={{
          marginTop: "22px",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Raw Uniware Response
        </summary>

        <pre
          style={{
            marginTop: "12px",
            padding: "16px",
            background: "#111827",
            color: "#e5e7eb",
            borderRadius: "8px",
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
  );
}

// ============================================================
// Result Card
// ============================================================

function ResultCard({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "15px",
        background: "#f9fafb",
        border:
          "1px solid #e5e7eb",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          wordBreak:
            "break-word",
        }}
      >
        {value ===
          undefined ||
        value === null ||
        value === ""
          ? "N/A"
          : String(value)}
      </div>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border:
    "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
  fontSize: "14px",
};

const helpStyle = {
  display: "block",
  marginTop: "6px",
  color: "#6b7280",
};

const clearButtonStyle = {
  padding: "13px 22px",
  border:
    "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

export default MarkDispatchedShippingPackage;