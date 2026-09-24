import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const initialForm = {
  channelCode: "CUSTOM",
  channelProductId: "",
  sellerSkuCode: "",
  skuCode: "",
  blockedInventory: 0,
  live: false,
  verified: false,
  disabled: false,
};

const ChannelItemTypeCreateOrEdit = () => {
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    if (!form.channelCode.trim()) {
      setError("Channel Code is required.");
      return;
    }

    if (!form.channelProductId.trim()) {
      setError("Channel Product ID is required.");
      return;
    }

    if (!form.sellerSkuCode.trim()) {
      setError("Seller SKU Code is required.");
      return;
    }

    if (!form.skuCode.trim()) {
      setError("Uniware SKU Code is required.");
      return;
    }

    if (Number(form.blockedInventory) < 0) {
      setError("Blocked Inventory cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        channelCode: form.channelCode.trim(),
        channelProductId: form.channelProductId.trim(),
        sellerSkuCode: form.sellerSkuCode.trim(),
        skuCode: form.skuCode.trim(),
        blockedInventory: Number(form.blockedInventory) || 0,
        live: form.live,
        verified: form.verified,
        disabled: form.disabled,
      };

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/channel-item-types/create-or-edit`,
        payload
      );

      setResponse(res.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResponse(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to create/update channel item type."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(initialForm);
    setResponse(null);
    setError("");
  };

  const errors = response?.errors || [];
  const warnings = response?.warnings || [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              color: "#1f2937",
            }}
          >
            Create / Update Channel Item Type
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#6b7280",
            }}
          >
            Link a Uniware product SKU with a channel SKU.
          </p>

          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              background: "#eef6ff",
              borderRadius: "8px",
              color: "#1d4ed8",
              fontSize: "14px",
            }}
          >
            Uniware Endpoint:
            <strong style={{ marginLeft: "6px" }}>
              /services/rest/v1/channel/createChannelItemType
            </strong>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#374151",
              fontSize: "20px",
            }}
          >
            Channel Item Mapping
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            {/* Channel Code */}
            <div>
              <label style={labelStyle}>
                Channel Code <span style={requiredStyle}>*</span>
              </label>

              <input
                type="text"
                name="channelCode"
                value={form.channelCode}
                onChange={handleChange}
                placeholder="CUSTOM"
                style={inputStyle}
              />
            </div>

            {/* Channel Product ID */}
            <div>
              <label style={labelStyle}>
                Channel Product ID <span style={requiredStyle}>*</span>
              </label>

              <input
                type="text"
                name="channelProductId"
                value={form.channelProductId}
                onChange={handleChange}
                placeholder="SKUD2"
                style={inputStyle}
              />

              <small style={helpStyle}>
                Unique product ID used by the channel.
              </small>
            </div>

            {/* Seller SKU */}
            <div>
              <label style={labelStyle}>
                Seller SKU Code <span style={requiredStyle}>*</span>
              </label>

              <input
                type="text"
                name="sellerSkuCode"
                value={form.sellerSkuCode}
                onChange={handleChange}
                placeholder="SKUD2"
                style={inputStyle}
              />
            </div>

            {/* Uniware SKU */}
            <div>
              <label style={labelStyle}>
                Uniware SKU Code <span style={requiredStyle}>*</span>
              </label>

              <input
                type="text"
                name="skuCode"
                value={form.skuCode}
                onChange={handleChange}
                placeholder="SKUD2"
                style={inputStyle}
              />

              <small style={helpStyle}>
                SKU must already exist in Uniware.
              </small>
            </div>

            {/* Blocked Inventory */}
            <div>
              <label style={labelStyle}>Blocked Inventory</label>

              <input
                type="number"
                name="blockedInventory"
                min="0"
                value={form.blockedInventory}
                onChange={handleChange}
                style={inputStyle}
              />

              <small style={helpStyle}>
                Inventory reserved from being sold on this channel.
              </small>
            </div>
          </div>

          {/* Status */}
          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "15px",
                color: "#374151",
              }}
            >
              Listing Status
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "15px",
              }}
            >
              <label style={checkboxStyle}>
                <input
                  type="checkbox"
                  name="live"
                  checked={form.live}
                  onChange={handleChange}
                />

                <span>
                  <strong>Live</strong>
                  <small style={checkboxHelpStyle}>
                    Activate channel listing
                  </small>
                </span>
              </label>

              <label style={checkboxStyle}>
                <input
                  type="checkbox"
                  name="verified"
                  checked={form.verified}
                  onChange={handleChange}
                />

                <span>
                  <strong>Verified</strong>
                  <small style={checkboxHelpStyle}>
                    Mark listing as verified
                  </small>
                </span>
              </label>

              <label style={checkboxStyle}>
                <input
                  type="checkbox"
                  name="disabled"
                  checked={form.disabled}
                  onChange={handleChange}
                />

                <span>
                  <strong>Disabled</strong>
                  <small style={checkboxHelpStyle}>
                    Disable channel inventory
                  </small>
                </span>
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "20px",
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
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background: loading ? "#9ca3af" : "#2563eb",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {loading
                ? "Saving..."
                : "Create / Update Channel Item Type"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "12px 24px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "#fff",
                color: "#374151",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>
        </form>

        {/* Response */}
        {response && (
          <div
            style={{
              marginTop: "20px",
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#374151",
              }}
            >
              Uniware Response
            </h2>

            {/* Success */}
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                background: response.successful
                  ? "#ecfdf5"
                  : "#fef2f2",
                color: response.successful
                  ? "#047857"
                  : "#b91c1c",
                marginBottom: "18px",
              }}
            >
              <strong>
                {response.successful ? "Successful" : "Failed"}
              </strong>

              {response.message && (
                <div style={{ marginTop: "5px" }}>
                  {response.message}
                </div>
              )}
            </div>

            {/* Channel Product ID */}
            {response.channelProductId && (
              <div style={responseBoxStyle}>
                <strong>Channel Product ID:</strong>{" "}
                {response.channelProductId}
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div style={{ marginTop: "18px" }}>
                <h3 style={{ color: "#b91c1c" }}>
                  Errors
                </h3>

                {errors.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      marginBottom: "10px",
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
                      {item.message || "N/A"}
                    </div>

                    {item.description && (
                      <div>
                        <strong>Description:</strong>{" "}
                        {item.description}
                      </div>
                    )}

                    {item.errorParams && (
                      <pre
                        style={{
                          marginTop: "10px",
                          whiteSpace: "pre-wrap",
                          fontSize: "12px",
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
                ))}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div style={{ marginTop: "18px" }}>
                <h3 style={{ color: "#92400e" }}>
                  Warnings
                </h3>

                {warnings.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <strong>Code:</strong>{" "}
                      {item.code ?? "N/A"}
                    </div>

                    <div>
                      <strong>Message:</strong>{" "}
                      {item.message || "N/A"}
                    </div>

                    {item.description && (
                      <div>
                        <strong>Description:</strong>{" "}
                        {item.description}
                      </div>
                    )}
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
                View Raw Response
              </summary>

              <pre
                style={{
                  marginTop: "12px",
                  padding: "15px",
                  background: "#111827",
                  color: "#e5e7eb",
                  borderRadius: "8px",
                  overflowX: "auto",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: 600,
  color: "#374151",
};

const requiredStyle = {
  color: "#dc2626",
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const helpStyle = {
  display: "block",
  marginTop: "5px",
  color: "#6b7280",
  fontSize: "12px",
};

const checkboxStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "12px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  cursor: "pointer",
};

const checkboxHelpStyle = {
  display: "block",
  marginTop: "4px",
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: 400,
};

const responseBoxStyle = {
  padding: "12px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

export default ChannelItemTypeCreateOrEdit;