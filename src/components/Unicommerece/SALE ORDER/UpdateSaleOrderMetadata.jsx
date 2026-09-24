import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function UpdateSaleOrderMetadata() {
  const [saleOrderCode, setSaleOrderCode] = useState("");
  const [priority, setPriority] = useState("");

  const [customFields, setCustomFields] = useState([
    {
      name: "",
      value: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Custom field handlers
  // ---------------------------------------------------------
  const addCustomField = () => {
    setCustomFields((prev) => [
      ...prev,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const removeCustomField = (index) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCustomField = (index, field, value) => {
    setCustomFields((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

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

    if (
      priority !== "" &&
      !Number.isInteger(Number(priority))
    ) {
      setError("Priority must be an integer.");
      return;
    }

    // Remove completely empty custom fields.
    const validCustomFields = customFields
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

    const payload = {
      saleOrderCode: trimmedCode,
    };

    // Important: priority 0 must be preserved.
    if (priority !== "") {
      payload.priority = Number(priority);
    }

    if (validCustomFields.length > 0) {
      payload.customFieldValues = validCustomFields;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/update-metadata`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResult(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to update sale order metadata."
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
    setPriority("");

    setCustomFields([
      {
        name: "",
        value: "",
      },
    ]);

    setResult(null);
    setError("");
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
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: "8px",
          }}
        >
          Update Sale Order Metadata
        </h2>

        <p
          style={{
            margin: 0,
            color: "#666",
          }}
        >
          Update priority and custom fields for an existing
          Uniware sale order.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* -------------------------------------------------
            Sale Order Information
        -------------------------------------------------- */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            background: "#fff",
          }}
        >
          <h3
            style={{
              marginTop: 0,
            }}
          >
            Sale Order
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
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
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                Priority
              </label>

              <input
                type="number"
                step="1"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
                placeholder="Example: 10"
                style={inputStyle}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#777",
                }}
              >
                Optional. Higher values indicate higher
                fulfillment priority.
              </small>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            Custom Fields
        -------------------------------------------------- */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                }}
              >
                Custom Fields
              </h3>

              <small
                style={{
                  color: "#777",
                }}
              >
                Add optional sale order metadata fields.
              </small>
            </div>

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
                gridTemplateColumns: "1fr 1fr auto",
                gap: "12px",
                marginBottom: "12px",
                alignItems: "end",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Field Name *
                </label>

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
                  placeholder="Example: source"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Value
                </label>

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
                  placeholder="Example: Amazon"
                  style={inputStyle}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  removeCustomField(index)
                }
                disabled={customFields.length === 1}
                style={{
                  ...dangerButtonStyle,
                  opacity:
                    customFields.length === 1 ? 0.5 : 1,
                  cursor:
                    customFields.length === 1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* -------------------------------------------------
            Error
        -------------------------------------------------- */}
        {error && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #ffb3b3",
              color: "#b00020",
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* -------------------------------------------------
            Buttons
        -------------------------------------------------- */}
        <div
          style={{
            display: "flex",
            gap: "12px",
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
              ? "Updating..."
              : "Update Metadata"}
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

      {/* ---------------------------------------------------
          Result
      ---------------------------------------------------- */}
      {result && (
        <div
          style={{
            marginTop: "30px",
          }}
        >
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
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              {result.successful
                ? "✓ Update Successful"
                : "✕ Update Failed"}
            </h3>

            <div>
              <strong>Message:</strong>{" "}
              {result.message || "No message"}
            </div>
          </div>

          {/* Errors */}
          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <h3>Errors</h3>

                {result.errors.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #ffcccc",
                      background: "#fff5f5",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>
                      {item.fieldName || "Error"}
                    </strong>

                    <div>
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
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <h3>Warnings</h3>

                {result.warnings.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #ffe0a3",
                      background: "#fffaf0",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>
                      {item.message || "Warning"}
                    </strong>

                    {item.description && (
                      <div>
                        {item.description}
                      </div>
                    )}

                    {item.code !== undefined && (
                      <small>
                        Code: {item.code}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            )}

          {/* Raw response */}
          <details>
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
              {JSON.stringify(result, null, 2)}
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

const dangerButtonStyle = {
  padding: "10px 14px",
  border: "1px solid #dc3545",
  borderRadius: "5px",
  background: "#fff",
  color: "#dc3545",
  cursor: "pointer",
  fontWeight: "600",
};

export default UpdateSaleOrderMetadata;