import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateShippingManifest() {
  const [form, setForm] = useState({
    channel: "",
    shippingProviderCode: "",
    shippingProviderName: "",
    shippingMethodCode: "",
    comments: "",
    thirdPartyShipping: true,
    shippingProviderIsAggregator: false,
    shippingCourier: "",
  });

  const [customFields, setCustomFields] = useState([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Handle normal fields
  // ----------------------------------------------------------
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ----------------------------------------------------------
  // Custom fields
  // ----------------------------------------------------------
  const addCustomField = () => {
    setCustomFields((previous) => [
      ...previous,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const updateCustomField = (index, field, value) => {
    setCustomFields((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeCustomField = (index) => {
    setCustomFields((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    // Required channel
    if (!form.channel.trim()) {
      setError("Channel is required.");
      return;
    }

    // thirdPartyShipping is mandatory boolean.
    // It always has a value because of the checkbox.
    const cleanedCustomFields = customFields
      .filter((field) => field.name.trim())
      .map((field) => {
        const item = {
          name: field.name.trim(),
        };

        if (field.value !== "") {
          item.value = field.value;
        }

        return item;
      });

    setLoading(true);

    try {
      const payload = {
        channel: form.channel.trim(),
        thirdPartyShipping: form.thirdPartyShipping,
      };

      if (form.shippingProviderCode.trim()) {
        payload.shippingProviderCode =
          form.shippingProviderCode.trim();
      }

      if (form.shippingProviderName.trim()) {
        payload.shippingProviderName =
          form.shippingProviderName.trim();
      }

      if (form.shippingMethodCode.trim()) {
        payload.shippingMethodCode =
          form.shippingMethodCode.trim();
      }

      if (form.comments.trim()) {
        payload.comments = form.comments.trim();
      }

      if (cleanedCustomFields.length > 0) {
        payload.customFieldValues =
          cleanedCustomFields;
      }

      payload.shippingProviderIsAggregator =
        form.shippingProviderIsAggregator;

      if (form.shippingCourier.trim()) {
        payload.shippingCourier =
          form.shippingCourier.trim();
      }

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-manifests/create`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          err.message ||
          "Failed to create shipping manifest."
      );

      if (data) {
        setResult(data);
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
      channel: "",
      shippingProviderCode: "",
      shippingProviderName: "",
      shippingMethodCode: "",
      comments: "",
      thirdPartyShipping: true,
      shippingProviderIsAggregator: false,
      shippingCourier: "",
    });

    setCustomFields([]);
    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "24px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "26px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "26px",
            }}
          >
            Create Shipping Manifest
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            Create a shipping manifest for a channel and
            shipping provider in Uniware.
          </p>

          <div
            style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "6px 10px",
              borderRadius: "5px",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            TENANT LEVEL — NO FACILITY REQUIRED
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ------------------------------------------------ */}
          {/* Channel */}
          {/* ------------------------------------------------ */}
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>
              Manifest Details
            </h3>

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
                  Channel *
                </label>

                <input
                  type="text"
                  name="channel"
                  value={form.channel}
                  onChange={handleChange}
                  placeholder="AMAZON"
                  style={inputStyle}
                />

                <small style={helpStyle}>
                  Channel from which the order was booked.
                </small>
              </div>

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
                  Shipping Provider Name
                </label>

                <input
                  type="text"
                  name="shippingProviderName"
                  value={form.shippingProviderName}
                  onChange={handleChange}
                  placeholder="Delhivery"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Shipping Method Code
                </label>

                <input
                  type="text"
                  name="shippingMethodCode"
                  value={form.shippingMethodCode}
                  onChange={handleChange}
                  placeholder="STD"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Comments */}
            <div style={{ marginTop: "18px" }}>
              <label style={labelStyle}>
                Comments
              </label>

              <textarea
                name="comments"
                value={form.comments}
                onChange={handleChange}
                placeholder="Manifest comments..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* Shipping Options */}
          {/* ------------------------------------------------ */}
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>
              Shipping Options
            </h3>

            <label style={checkboxLabel}>
              <input
                type="checkbox"
                name="thirdPartyShipping"
                checked={form.thirdPartyShipping}
                onChange={handleChange}
              />

              <span>
                Third Party Shipping
              </span>
            </label>

            <div
              style={{
                marginTop: "7px",
                marginBottom: "18px",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              Enable when shipping to the end customer is
              handled by the marketplace.
            </div>

            <label style={checkboxLabel}>
              <input
                type="checkbox"
                name="shippingProviderIsAggregator"
                checked={
                  form.shippingProviderIsAggregator
                }
                onChange={handleChange}
              />

              <span>
                Shipping Provider Is Aggregator
              </span>
            </label>

            {form.shippingProviderIsAggregator && (
              <div
                style={{
                  marginTop: "16px",
                  maxWidth: "500px",
                }}
              >
                <label style={labelStyle}>
                  Shipping Courier
                </label>

                <input
                  type="text"
                  name="shippingCourier"
                  value={form.shippingCourier}
                  onChange={handleChange}
                  placeholder="DELHIVERY"
                  style={inputStyle}
                />

                <small style={helpStyle}>
                  Required when the shipping provider is an
                  aggregator according to the API documentation.
                </small>
              </div>
            )}
          </div>

          {/* ------------------------------------------------ */}
          {/* Custom Fields */}
          {/* ------------------------------------------------ */}
          <div style={sectionStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <h3
                style={{
                  ...sectionTitle,
                  marginBottom: 0,
                }}
              >
                Custom Fields
              </h3>

              <button
                type="button"
                onClick={addCustomField}
                style={secondaryButtonStyle}
              >
                + Add Custom Field
              </button>
            </div>

            {customFields.length === 0 && (
              <div
                style={{
                  marginTop: "15px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                No custom fields added.
              </div>
            )}

            {customFields.map((field, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr auto",
                  gap: "12px",
                  marginTop: "15px",
                  alignItems: "end",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Name *
                  </label>

                  <input
                    type="text"
                    value={field.name}
                    onChange={(event) =>
                      updateCustomField(
                        index,
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Custom field name"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Value
                  </label>

                  <input
                    type="text"
                    value={field.value}
                    onChange={(event) =>
                      updateCustomField(
                        index,
                        "value",
                        event.target.value
                      )
                    }
                    placeholder="Custom field value"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeCustomField(index)
                  }
                  style={deleteButtonStyle}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* ------------------------------------------------ */}
          {/* Buttons */}
          {/* ------------------------------------------------ */}
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
                padding: "12px 22px",
                border: "none",
                borderRadius: "7px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Creating..."
                : "Create Shipping Manifest"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "12px 22px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>
        </form>

        {/* -------------------------------------------------- */}
        {/* Error */}
        {/* -------------------------------------------------- */}
        {error && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* Result */}
        {/* -------------------------------------------------- */}
        {result && (
          <div style={{ marginTop: "30px" }}>
            <h3>Manifest Result</h3>

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
              <div>
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

              <div style={{ marginTop: "8px" }}>
                <strong>Message:</strong>{" "}
                {result.message || "N/A"}
              </div>
            </div>

            {/* Manifest details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              <ResultCard
                label="Shipping Manifest ID"
                value={result.shippingManifestId}
              />

              <ResultCard
                label="Shipping Manifest Code"
                value={result.shippingManifestCode}
              />
            </div>

            {/* Errors */}
            {Array.isArray(result.errors) &&
              result.errors.length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    Uniware Errors
                  </h4>

                  {result.errors.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        paddingBottom: "12px",
                        marginBottom: "12px",
                        borderBottom:
                          "1px solid #fee2e2",
                      }}
                    >
                      <div>
                        <strong>Code:</strong>{" "}
                        {item.code ?? "N/A"}
                      </div>

                      <div>
                        <strong>Field:</strong>{" "}
                        {item.fieldName || "N/A"}
                      </div>

                      <div>
                        <strong>Message:</strong>{" "}
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
                    borderRadius: "8px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    Uniware Warnings
                  </h4>

                  {result.warnings.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "8px",
                      }}
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

            {/* Raw response */}
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
        padding: "15px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        background: "#f9fafb",
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
          fontWeight: 700,
          wordBreak: "break-word",
        }}
      >
        {value === undefined ||
        value === null ||
        value === ""
          ? "N/A"
          : value}
      </div>
    </div>
  );
}

const sectionStyle = {
  marginBottom: "24px",
  padding: "20px",
  border: "1px solid #e5e7eb",
  borderRadius: "9px",
  background: "#fafafa",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
  fontSize: "14px",
};

const helpStyle = {
  display: "block",
  marginTop: "5px",
  color: "#6b7280",
  fontSize: "12px",
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "9px 14px",
  border: "1px solid #2563eb",
  borderRadius: "6px",
  background: "#fff",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};

const deleteButtonStyle = {
  padding: "10px 13px",
  border: "1px solid #dc2626",
  borderRadius: "6px",
  background: "#fff",
  color: "#dc2626",
  cursor: "pointer",
};

export default CreateShippingManifest;