import React, {
  useState,
} from "react";
import axios from "axios";

const SERVER_URL =
  "http://localhost:5000";

function MarkItemDelivered() {
  const [form, setForm] = useState({
    facility: "MAIN",
    saleOrderCode: "",
    podCode: "",
    saleOrderItemCodes: [""],
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ==========================================================
  // Handle normal fields
  // ==========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // Handle item code
  // ==========================================================

  const handleItemCodeChange = (
    index,
    value
  ) => {
    setForm((previous) => {
      const codes = [
        ...previous.saleOrderItemCodes,
      ];

      codes[index] = value;

      return {
        ...previous,
        saleOrderItemCodes:
          codes,
      };
    });
  };

  // ==========================================================
  // Add item code
  // ==========================================================

  const addItemCode = () => {
    setForm((previous) => ({
      ...previous,
      saleOrderItemCodes: [
        ...previous.saleOrderItemCodes,
        "",
      ],
    }));
  };

  // ==========================================================
  // Remove item code
  // ==========================================================

  const removeItemCode = (
    index
  ) => {
    setForm((previous) => {
      const codes =
        previous.saleOrderItemCodes.filter(
          (_, itemIndex) =>
            itemIndex !== index
        );

      return {
        ...previous,
        saleOrderItemCodes:
          codes.length > 0
            ? codes
            : [""],
      };
    });
  };

  // ==========================================================
  // Submit
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setResult(null);

    try {
      // ------------------------------------------------------
      // Validate facility
      // ------------------------------------------------------

      if (!form.facility.trim()) {
        throw new Error(
          "Facility is required."
        );
      }

      // ------------------------------------------------------
      // Validate sale order
      // ------------------------------------------------------

      if (
        !form.saleOrderCode.trim()
      ) {
        throw new Error(
          "Sale Order Code is required."
        );
      }

      // ------------------------------------------------------
      // Clean item codes
      // ------------------------------------------------------

      const itemCodes =
        form.saleOrderItemCodes
          .map((code) =>
            code.trim()
          )
          .filter(Boolean);

      if (
        itemCodes.length === 0
      ) {
        throw new Error(
          "At least one Sale Order Item Code is required."
        );
      }

      // ------------------------------------------------------
      // Build payload
      // ------------------------------------------------------

      const payload = {
        facility:
          form.facility.trim(),

        saleOrderCode:
          form.saleOrderCode.trim(),

        saleOrderItemCodes:
          itemCodes,
      };

      // ------------------------------------------------------
      // Optional POD code
      // ------------------------------------------------------

      if (form.podCode.trim()) {
        payload.podCode =
          form.podCode.trim();
      }

      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/sale-orders/items/mark-delivered`,
          payload
        );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to mark item(s) as delivered."
      );

      if (responseData) {
        setResult(responseData);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Clear
  // ==========================================================

  const handleClear = () => {
    setForm({
      facility: "MAIN",
      saleOrderCode: "",
      podCode: "",
      saleOrderItemCodes: [""],
    });

    setError("");
    setResult(null);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* ================================================== */}
        {/* Header */}
        {/* ================================================== */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <h2 style={titleStyle}>
            Mark Item Delivered
          </h2>

          <p
            style={
              descriptionStyle
            }
          >
            Update one or more Sale Order
            Items as delivered in Uniware.
          </p>

          <span
            style={badgeStyle}
          >
            FACILITY LEVEL
          </span>
        </div>

        {/* ================================================== */}
        {/* Workflow */}
        {/* ================================================== */}

        <div
          style={workflowStyle}
        >
          <WorkflowStep
            text="Sale Order"
          />

          <span>→</span>

          <WorkflowStep
            text="Sale Order Items"
          />

          <span>→</span>

          <WorkflowStep
            text="Delivered"
          />
        </div>

        {/* ================================================== */}
        {/* Error */}
        {/* ================================================== */}

        {error && (
          <div style={errorStyle}>
            <strong>
              Error:
            </strong>{" "}
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
          {/* ================================================= */}
          {/* Sale Order Details */}
          {/* ================================================= */}

          <SectionTitle>
            Sale Order Details
          </SectionTitle>

          <div style={gridStyle}>
            <FormField
              label="Facility *"
            >
              <input
                name="facility"
                value={
                  form.facility
                }
                onChange={
                  handleChange
                }
                placeholder="MAIN"
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="Sale Order Code *"
            >
              <input
                name="saleOrderCode"
                value={
                  form.saleOrderCode
                }
                onChange={
                  handleChange
                }
                placeholder="SO-00001"
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="POD Code"
            >
              <input
                name="podCode"
                value={
                  form.podCode
                }
                onChange={
                  handleChange
                }
                placeholder="POD-12345"
                style={inputStyle}
              />
            </FormField>
          </div>

          {/* ================================================= */}
          {/* Sale Order Item Codes */}
          {/* ================================================= */}

          <SectionTitle>
            Sale Order Item Codes
          </SectionTitle>

          <p
            style={{
              marginTop: "-5px",
              marginBottom: "18px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Add one or more Sale Order
            Item Codes that should be
            marked as delivered.
          </p>

          <div>
            {form.saleOrderItemCodes.map(
              (
                code,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom:
                      "12px",
                    alignItems:
                      "center",
                  }}
                >
                  <div
                    style={{
                      width: "35px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  >
                    {index + 1}.
                  </div>

                  <input
                    value={code}
                    onChange={(event) =>
                      handleItemCodeChange(
                        index,
                        event.target
                          .value
                      )
                    }
                    placeholder="SOI-00001"
                    style={{
                      ...inputStyle,
                      flex: 1,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeItemCode(
                        index
                      )
                    }
                    disabled={
                      form
                        .saleOrderItemCodes
                        .length === 1
                    }
                    style={{
                      ...removeButtonStyle,
                      opacity:
                        form
                          .saleOrderItemCodes
                          .length === 1
                          ? 0.5
                          : 1,
                    }}
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={
              addItemCode
            }
            style={
              addButtonStyle
            }
          >
            + Add Item Code
          </button>

          {/* ================================================= */}
          {/* Buttons */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "30px",
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
                : "Mark as Delivered"}
            </button>

            <button
              type="button"
              onClick={
                handleClear
              }
              style={
                clearButtonStyle
              }
            >
              Clear
            </button>
          </div>
        </form>

        {/* ================================================== */}
        {/* Result */}
        {/* ================================================== */}

        {result && (
          <DeliveredResult
            result={result}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Section title
// ============================================================

function SectionTitle({
  children,
}) {
  return (
    <h3
      style={{
        marginTop: "28px",
        marginBottom: "15px",
        paddingBottom: "9px",
        borderBottom:
          "1px solid #e5e7eb",
        fontSize: "18px",
      }}
    >
      {children}
    </h3>
  );
}

// ============================================================
// Form field
// ============================================================

function FormField({
  label,
  children,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      {children}
    </div>
  );
}

// ============================================================
// Workflow
// ============================================================

function WorkflowStep({
  text,
}) {
  return (
    <span
      style={{
        padding: "7px 11px",
        background: "#fff",
        border:
          "1px solid #cbd5e1",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
}

// ============================================================
// Result
// ============================================================

function DeliveredResult({
  result,
}) {
  const successful =
    result.successful === true;

  return (
    <div
      style={{
        marginTop: "32px",
        paddingTop: "25px",
        borderTop:
          "1px solid #e5e7eb",
      }}
    >
      <h3>
        Delivery Update Result
      </h3>

      <div
        style={{
          marginTop: "15px",
          padding: "18px",
          borderRadius: "8px",
          background:
            successful
              ? "#f0fdf4"
              : "#fef2f2",
          border:
            successful
              ? "1px solid #bbf7d0"
              : "1px solid #fecaca",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color:
              successful
                ? "#15803d"
                : "#b91c1c",
          }}
        >
          {successful
            ? "✓ Items Marked Delivered"
            : "✕ Delivery Update Failed"}
        </div>

        <div
          style={{
            marginTop: "7px",
            color: "#374151",
          }}
        >
          {result.message ||
            "N/A"}
        </div>
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
              background:
                "#fef2f2",
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
              background:
                "#fffbeb",
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
          marginTop: "20px",
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
            background:
              "#111827",
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
// Styles
// ============================================================

const pageStyle = {
  maxWidth: "1050px",
  margin: "30px auto",
  padding: "20px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const cardStyle = {
  background: "#fff",
  border:
    "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "28px",
  boxShadow:
    "0 2px 12px rgba(0,0,0,0.08)",
};

const titleStyle = {
  margin: 0,
  fontSize: "27px",
};

const descriptionStyle = {
  marginTop: "8px",
  color: "#6b7280",
  lineHeight: 1.6,
};

const badgeStyle = {
  display: "inline-block",
  marginTop: "10px",
  padding: "6px 10px",
  borderRadius: "5px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 700,
};

const workflowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
  padding: "15px",
  marginBottom: "25px",
  background: "#f8fafc",
  border:
    "1px solid #e2e8f0",
  borderRadius: "8px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "18px",
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
  border:
    "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "14px",
};

const primaryButtonStyle = {
  padding: "13px 24px",
  border: "none",
  borderRadius: "7px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
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

const addButtonStyle = {
  padding: "9px 15px",
  border:
    "1px solid #2563eb",
  borderRadius: "6px",
  background: "#fff",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};

const removeButtonStyle = {
  padding: "9px 12px",
  border:
    "1px solid #dc2626",
  borderRadius: "6px",
  background: "#fff",
  color: "#dc2626",
  cursor: "pointer",
  fontWeight: 600,
};

const errorStyle = {
  marginBottom: "20px",
  padding: "14px",
  background: "#fef2f2",
  border:
    "1px solid #fecaca",
  borderRadius: "8px",
  color: "#b91c1c",
};

export default MarkItemDelivered;