import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function AllocateShippingProvider() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingPackageCode: "",
    shippingLabelMandatory: false,
    shippingProviderCode: "",
    shippingCourier: "",
    trackingNumber: "",
    trackingLink: "",
    generateUniwareShippingLabel: false,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!form.facility.trim()) {
      setError("Facility Code is required.");
      return;
    }

    if (!form.shippingPackageCode.trim()) {
      setError("Shipping Package Code is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        facility: form.facility.trim(),
        shippingPackageCode: form.shippingPackageCode.trim(),
        shippingLabelMandatory: form.shippingLabelMandatory,
        generateUniwareShippingLabel:
          form.generateUniwareShippingLabel,
      };

      if (form.shippingProviderCode.trim()) {
        payload.shippingProviderCode =
          form.shippingProviderCode.trim();
      }

      if (form.shippingCourier.trim()) {
        payload.shippingCourier = form.shippingCourier.trim();
      }

      if (form.trackingNumber.trim()) {
        payload.trackingNumber = form.trackingNumber.trim();
      }

      if (form.trackingLink.trim()) {
        payload.trackingLink = form.trackingLink.trim();
      }

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/allocate-provider`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          err.message ||
          "Failed to allocate shipping provider."
      );

      if (data) {
        setResult(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      facility: "MAIN",
      shippingPackageCode: "",
      shippingLabelMandatory: false,
      shippingProviderCode: "",
      shippingCourier: "",
      trackingNumber: "",
      trackingLink: "",
      generateUniwareShippingLabel: false,
    });

    setResult(null);
    setError("");
  };

  const openLink = (url) => {
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Allocate Shipping Provider
        </h2>

        <p style={{ color: "#6b7280", marginBottom: "24px" }}>
          Allocate a shipping provider or aggregator to a Uniware
          shipping package.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Facility */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Facility Code *
            </label>

            <input
              type="text"
              name="facility"
              value={form.facility}
              onChange={handleChange}
              placeholder="MAIN"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Uniware Facility header value.
            </small>
          </div>

          {/* Shipping Package */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Shipping Package Code *
            </label>

            <input
              type="text"
              name="shippingPackageCode"
              value={form.shippingPackageCode}
              onChange={handleChange}
              placeholder="SP000123"
              style={inputStyle}
            />
          </div>

          {/* Provider fields */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <label style={labelStyle}>
                Shipping Provider Code
              </label>

              <input
                type="text"
                name="shippingProviderCode"
                value={form.shippingProviderCode}
                onChange={handleChange}
                placeholder="DELHIVERY"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Shipping Courier
              </label>

              <input
                type="text"
                name="shippingCourier"
                value={form.shippingCourier}
                onChange={handleChange}
                placeholder="Delhivery"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Tracking Number
              </label>

              <input
                type="text"
                name="trackingNumber"
                value={form.trackingNumber}
                onChange={handleChange}
                placeholder="1234567890"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Tracking Link
              </label>

              <input
                type="url"
                name="trackingLink"
                value={form.trackingLink}
                onChange={handleChange}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* Options */}
          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              background: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="shippingLabelMandatory"
                checked={form.shippingLabelMandatory}
                onChange={handleChange}
              />

              <span>
                Shipping Label Mandatory
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="generateUniwareShippingLabel"
                checked={form.generateUniwareShippingLabel}
                onChange={handleChange}
              />

              <span>
                Generate Uniware Shipping Label
              </span>
            </label>

            <div
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              <div>
                <strong>Shipping Label Mandatory:</strong>{" "}
                requests a shipping label link.
              </div>

              <div style={{ marginTop: "5px" }}>
                <strong>Generate Uniware Shipping Label:</strong>{" "}
                controls whether the Uniware label is generated
                instead of using the provider's label link.
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 22px",
                border: "none",
                borderRadius: "7px",
                background: "#2563eb",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {loading
                ? "Allocating..."
                : "Allocate Shipping Provider"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "11px 22px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "24px",
              padding: "14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: "8px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginTop: "30px" }}>
            <h3>Allocation Result</h3>

            <div
              style={{
                padding: "18px",
                borderRadius: "8px",
                background: result.successful
                  ? "#f0fdf4"
                  : "#fef2f2",
                border: `1px solid ${
                  result.successful
                    ? "#bbf7d0"
                    : "#fecaca"
                }`,
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <strong>Status: </strong>

                <span
                  style={{
                    color: result.successful
                      ? "#15803d"
                      : "#b91c1c",
                    fontWeight: 700,
                  }}
                >
                  {result.successful
                    ? "SUCCESS"
                    : "FAILED"}
                </span>
              </div>

              <div>
                <strong>Message:</strong>{" "}
                {result.message || "N/A"}
              </div>
            </div>

            {/* Response Details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              <ResultCard
                label="Shipping Package"
                value={result.shippingPackageCode}
              />

              <ResultCard
                label="Provider Code"
                value={result.shippingProviderCode}
              />

              <ResultCard
                label="Shipping Courier"
                value={result.shippingCourier}
              />

              <ResultCard
                label="Tracking Number"
                value={result.trackingNumber}
              />

              <ResultCard
                label="Shipment Label Format"
                value={result.shipmentLabelFormat}
              />

              <ResultCard
                label="Shipping Managed By"
                value={result.shippingManagedBy}
              />

              <ResultCard
                label="Status Code"
                value={result.statusCode}
              />

              <ResultCard
                label="Auto Print Enabled"
                value={
                  result.autoPrintEnabled === undefined
                    ? "N/A"
                    : result.autoPrintEnabled
                      ? "Yes"
                      : "No"
                }
              />
            </div>

            {/* Links */}
            {(result.shippingLabelLink ||
              result.trackingLink) && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              >
                <h4 style={{ marginTop: 0 }}>
                  Shipment Links
                </h4>

                {result.shippingLabelLink && (
                  <button
                    type="button"
                    onClick={() =>
                      openLink(result.shippingLabelLink)
                    }
                    style={linkButtonStyle}
                  >
                    Open Shipping Label
                  </button>
                )}

                {result.trackingLink && (
                  <button
                    type="button"
                    onClick={() =>
                      openLink(result.trackingLink)
                    }
                    style={{
                      ...linkButtonStyle,
                      marginLeft: "10px",
                    }}
                  >
                    Open Tracking Link
                  </button>
                )}
              </div>
            )}

            {/* Errors */}
            {Array.isArray(result.errors) &&
              result.errors.length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    Uniware Errors
                  </h4>

                  {result.errors.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "12px",
                        paddingBottom: "12px",
                        borderBottom:
                          "1px solid #fee2e2",
                      }}
                    >
                      <div>
                        <strong>
                          Code:
                        </strong>{" "}
                        {item.code ?? "N/A"}
                      </div>

                      <div>
                        <strong>
                          Field:
                        </strong>{" "}
                        {item.fieldName || "N/A"}
                      </div>

                      <div>
                        <strong>
                          Message:
                        </strong>{" "}
                        {item.message ||
                          item.description ||
                          "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Warnings */}
            {Array.isArray(result.warnings) &&
              result.warnings.length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    Uniware Warnings
                  </h4>

                  {result.warnings.map((item, index) => (
                    <div
                      key={index}
                      style={{ marginBottom: "8px" }}
                    >
                      <strong>
                        {item.code ?? "Warning"}:
                      </strong>{" "}
                      {item.message ||
                        item.description ||
                        "N/A"}
                    </div>
                  ))}
                </div>
              )}

            {/* Raw Response */}
            <details style={{ marginTop: "20px" }}>
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
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div
      style={{
        padding: "14px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {value || "N/A"}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: 600,
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "14px",
  outline: "none",
};

const helpStyle = {
  display: "block",
  marginTop: "5px",
  color: "#6b7280",
  fontSize: "12px",
};

const linkButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

export default AllocateShippingProvider;