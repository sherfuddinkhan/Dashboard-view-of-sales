import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function UpdateSaleOrderItemMetadata() {
  const [saleOrderCode, setSaleOrderCode] = useState("");
  const [saleOrderItemCode, setSaleOrderItemCode] = useState("");

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
  // Add custom field
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

  // ---------------------------------------------------------
  // Remove custom field
  // ---------------------------------------------------------
  const removeCustomField = (index) => {
    setCustomFields((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ---------------------------------------------------------
  // Update custom field
  // ---------------------------------------------------------
  const updateCustomField = (
    index,
    field,
    value
  ) => {
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

    const trimmedSaleOrderCode =
      saleOrderCode.trim();

    const trimmedSaleOrderItemCode =
      saleOrderItemCode.trim();

    // Required validation
    if (!trimmedSaleOrderCode) {
      setError("Sale order code is required.");
      return;
    }

    if (!trimmedSaleOrderItemCode) {
      setError("Sale order item code is required.");
      return;
    }

    // Build custom fields
    const validCustomFields = customFields
      .filter(
        (field) => field.name.trim()
      )
      .map((field) => {
        const item = {
          name: field.name.trim(),
        };

        if (field.value !== "") {
          item.value = field.value;
        }

        return item;
      });

    // -------------------------------------------------------
    // Build request
    // -------------------------------------------------------
    const payload = {
      saleOrderCode: trimmedSaleOrderCode,
      saleOrderItemCode:
        trimmedSaleOrderItemCode,
    };

    if (validCustomFields.length > 0) {
      payload.customFieldValues =
        validCustomFields;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/update-item-metadata`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResult(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to update sale order item metadata."
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
    setSaleOrderItemCode("");

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
          Update Sale Order Item Metadata
        </h2>

        <p
          style={{
            margin: 0,
            color: "#666",
          }}
        >
          Update custom metadata for a specific
          sale order item in Uniware.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ===================================================
            SALE ORDER DETAILS
        ==================================================== */}
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
              marginBottom: "18px",
            }}
          >
            Sale Order Item
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "16px",
            }}
          >
            {/* Sale Order Code */}
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
                  setSaleOrderCode(
                    e.target.value
                  )
                }
                placeholder="Example: SO1231100023"
                style={inputStyle}
              />
            </div>

            {/* Sale Order Item Code */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                Sale Order Item Code *
              </label>

              <input
                type="text"
                value={saleOrderItemCode}
                onChange={(e) =>
                  setSaleOrderItemCode(
                    e.target.value
                  )
                }
                placeholder="Example: SO1231100023-1"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* ===================================================
            CUSTOM FIELDS
        ==================================================== */}
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
              justifyContent:
                "space-between",
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
                Add metadata fields for this
                sale order item.
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

          {customFields.map(
            (field, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr auto",
                  gap: "12px",
                  marginBottom: "12px",
                  alignItems: "end",
                }}
              >
                {/* Name */}
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
                    placeholder="Example: warehouse"
                    style={inputStyle}
                  />
                </div>

                {/* Value */}
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
                    placeholder="Example: MAIN"
                    style={inputStyle}
                  />
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() =>
                    removeCustomField(
                      index
                    )
                  }
                  disabled={
                    customFields.length ===
                    1
                  }
                  style={{
                    ...dangerButtonStyle,
                    opacity:
                      customFields.length ===
                      1
                        ? 0.5
                        : 1,
                    cursor:
                      customFields.length ===
                      1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            )
          )}
        </div>

        {/* ===================================================
            ERROR
        ==================================================== */}
        {error && (
          <div
            style={{
              background: "#fff0f0",
              border:
                "1px solid #ffb3b3",
              color: "#b00020",
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "20px",
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
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading
                ? 0.7
                : 1,
            }}
          >
            {loading
              ? "Updating..."
              : "Update Item Metadata"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            style={
              secondaryButtonStyle
            }
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
          {/* Result Summary */}
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              border:
                result.successful
                  ? "1px solid #b7dfb9"
                  : "1px solid #ffb3b3",
              background:
                result.successful
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
              <strong>
                Message:
              </strong>{" "}
              {result.message ||
                "No message"}
            </div>
          </div>

          {/* Errors */}
          {Array.isArray(
            result.errors
          ) &&
            result.errors.length >
              0 && (
              <div
                style={{
                  marginBottom:
                    "20px",
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
          {Array.isArray(
            result.warnings
          ) &&
            result.warnings.length >
              0 && (
              <div
                style={{
                  marginBottom:
                    "20px",
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

          {/* Raw Response */}
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
                background:
                  "#f5f5f5",
                borderRadius: "6px",
                overflowX:
                  "auto",
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

const dangerButtonStyle = {
  padding: "10px 14px",
  border: "1px solid #dc3545",
  borderRadius: "5px",
  background: "#fff",
  color: "#dc3545",
  cursor: "pointer",
  fontWeight: "600",
};

export default UpdateSaleOrderItemMetadata;