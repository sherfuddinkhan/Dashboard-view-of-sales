import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function ForceDispatchShippingPackage() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingPackageCode: "",
    shippingProviderCode: "",
    trackingNumber: "",
    skipDetailing: true,
    skipChannelInvoicing: false,
    invoiceCode: "",
    channelProductIdToTax: "",
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
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const facility =
      form.facility.trim();

    const shippingPackageCode =
      form.shippingPackageCode.trim();

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

    // --------------------------------------------------------
    // Optional channelProductIdToTax
    // --------------------------------------------------------

    let parsedTaxMapping;

    if (
      form.channelProductIdToTax.trim()
    ) {
      try {
        parsedTaxMapping =
          JSON.parse(
            form.channelProductIdToTax
          );

        if (
          !parsedTaxMapping ||
          typeof parsedTaxMapping !==
            "object" ||
          Array.isArray(
            parsedTaxMapping
          )
        ) {
          setError(
            "channelProductIdToTax must be a valid JSON object."
          );
          return;
        }
      } catch {
        setError(
          "channelProductIdToTax contains invalid JSON."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // Build request
    // --------------------------------------------------------

    const payload = {
      facility,
      shippingPackageCode,

      // Preserve explicit boolean values
      skipDetailing:
        form.skipDetailing,

      skipChannelInvoicing:
        form.skipChannelInvoicing,
    };

    if (
      form.shippingProviderCode.trim()
    ) {
      payload.shippingProviderCode =
        form.shippingProviderCode.trim();
    }

    if (
      form.trackingNumber.trim()
    ) {
      payload.trackingNumber =
        form.trackingNumber.trim();
    }

    if (
      form.invoiceCode.trim()
    ) {
      payload.invoiceCode =
        form.invoiceCode.trim();
    }

    if (
      parsedTaxMapping !==
      undefined
    ) {
      payload.channelProductIdToTax =
        parsedTaxMapping;
    }

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/shipping-packages/force-dispatch`,
          payload
        );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to force dispatch shipping package."
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
      shippingProviderCode: "",
      trackingNumber: "",
      skipDetailing: true,
      skipChannelInvoicing: false,
      invoiceCode: "",
      channelProductIdToTax: "",
    });

    setError("");
    setResult(null);
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
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
        {/* ================================================== */}
        {/* Header */}
        {/* ================================================== */}

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
            Force Dispatch Shipping Package
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            Force a single shipping package
            to dispatched status from an
            intermediary Uniware shipment
            stage.
          </p>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "12px",
            }}
          >
            <span
              style={badgeStyle}
            >
              FACILITY LEVEL
            </span>

            <span
              style={{
                ...badgeStyle,
                background: "#dcfce7",
                color: "#166534",
              }}
            >
              FORCE DISPATCH
            </span>
          </div>
        </div>

        {/* ================================================== */}
        {/* Supported stages */}
        {/* ================================================== */}

        <div
          style={{
            padding: "16px",
            marginBottom: "22px",
            background: "#f8fafc",
            border:
              "1px solid #e2e8f0",
            borderRadius: "8px",
          }}
        >
          <strong>
            Supported dispatch stages
          </strong>

          <div
            style={{
              marginTop: "10px",
              color: "#475569",
              lineHeight: 1.7,
              fontSize: "14px",
            }}
          >
            <div>
              <strong>
                NONE traceability:
              </strong>{" "}
              CREATED → PICKING → PICKED
              → PACKED → READY_TO_SHIP →
              MANIFESTED
            </div>

            <div>
              <strong>
                ITEM_SKU traceability:
              </strong>{" "}
              CREATED → PICKING → PICKED
              → PACKED → READY_TO_SHIP →
              MANIFESTED
            </div>

            <div>
              <strong>
                ITEM traceability:
              </strong>{" "}
              PACKED → READY_TO_SHIP →
              MANIFESTED
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* Form */}
        {/* ================================================== */}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "18px",
            }}
          >
            {/* Facility */}
            <FormField
              label="Facility *"
            >
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
            </FormField>

            {/* Package */}
            <FormField
              label="Shipping Package Code *"
            >
              <input
                type="text"
                name="shippingPackageCode"
                value={
                  form.shippingPackageCode
                }
                onChange={handleChange}
                placeholder="SP-7671"
                style={inputStyle}
              />

              <small
                style={helpStyle}
              >
                Package to force dispatch.
              </small>
            </FormField>

            {/* Provider */}
            <FormField
              label="Shipping Provider Code"
            >
              <input
                type="text"
                name="shippingProviderCode"
                value={
                  form.shippingProviderCode
                }
                onChange={handleChange}
                placeholder="DTDC"
                style={inputStyle}
              />
            </FormField>

            {/* Tracking */}
            <FormField
              label="Tracking Number"
            >
              <input
                type="text"
                name="trackingNumber"
                value={
                  form.trackingNumber
                }
                onChange={handleChange}
                placeholder="12345678"
                style={inputStyle}
              />
            </FormField>

            {/* Invoice */}
            <FormField
              label="Invoice Code"
            >
              <input
                type="text"
                name="invoiceCode"
                value={form.invoiceCode}
                onChange={handleChange}
                placeholder="Sample_1234"
                style={inputStyle}
              />
            </FormField>

            {/* Skip detailing */}
            <FormField
              label="Skip Detailing"
            >
              <label
                style={checkboxContainerStyle}
              >
                <input
                  type="checkbox"
                  name="skipDetailing"
                  checked={
                    form.skipDetailing
                  }
                  onChange={handleChange}
                  style={{
                    width: "18px",
                    height: "18px",
                  }}
                />

                <span>
                  Skip detailing
                </span>
              </label>

              <small
                style={helpStyle}
              >
                Uniware default is true.
              </small>
            </FormField>

            {/* Skip channel invoicing */}
            <FormField
              label="Skip Channel Invoicing"
            >
              <label
                style={checkboxContainerStyle}
              >
                <input
                  type="checkbox"
                  name="skipChannelInvoicing"
                  checked={
                    form.skipChannelInvoicing
                  }
                  onChange={handleChange}
                  style={{
                    width: "18px",
                    height: "18px",
                  }}
                />

                <span>
                  Skip channel invoicing
                </span>
              </label>

              <small
                style={helpStyle}
              >
                Uniware default is false.
              </small>
            </FormField>

            {/* Tax mapping */}
            <FormField
              label="Channel Product ID to Tax"
            >
              <textarea
                name="channelProductIdToTax"
                value={
                  form.channelProductIdToTax
                }
                onChange={handleChange}
                placeholder={`{
  "PRODUCT001": {
    "taxPercentage": 18,
    "centralGst": 9,
    "stateGst": 9
  }
}`}
                rows={7}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily:
                    "Consolas, monospace",
                }}
              />

              <small
                style={helpStyle}
              >
                Optional JSON object. Leave
                empty if tax mapping is not
                required.
              </small>
            </FormField>
          </div>

          {/* ================================================= */}
          {/* Actions */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "25px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px 24px",
                border: "none",
                borderRadius: "7px",
                background: "#dc2626",
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
                ? "Force Dispatching..."
                : "Force Dispatch"}
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

        {/* ================================================== */}
        {/* Error */}
        {/* ================================================== */}

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

        {/* ================================================== */}
        {/* Result */}
        {/* ================================================== */}

        {result && (
          <ForceDispatchResult
            result={result}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Form Field
// ============================================================

function FormField({
  label,
  children,
}) {
  return (
    <div>
      <label
        style={labelStyle}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

// ============================================================
// Result
// ============================================================

function ForceDispatchResult({
  result,
}) {
  const successful =
    result.successful === true;

  return (
    <div
      style={{
        marginTop: "32px",
      }}
    >
      <h3
        style={{
          marginBottom: "16px",
        }}
      >
        Force Dispatch Result
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
            ? "✓ Force Dispatch Successful"
            : "✕ Force Dispatch Failed"}
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

      {/* Package information */}
      {result.shippingPackageCode && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <ResultCard
            label="Shipping Package Code"
            value={
              result.shippingPackageCode
            }
          />
        </div>
      )}

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
                      "11px 0",
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
                      "9px",
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

      {/* Raw */}
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
  fontSize: "12px",
};

const checkboxContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  minHeight: "42px",
  padding: "8px 12px",
  border:
    "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
};

const clearButtonStyle = {
  padding: "13px 24px",
  border:
    "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const badgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "5px",
  background: "#fef3c7",
  color: "#92400e",
  fontSize: "12px",
  fontWeight: 700,
};

export default ForceDispatchShippingPackage;