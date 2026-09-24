import React, {
  useState,
} from "react";
import axios from "axios";

const SERVER_URL =
  "http://localhost:5000";

const RETURN_REASON =
  "editSaleOrder:ReturnReason";

const CANCEL_REASON =
  "editSaleOrder:CancelReason";

function EnableCustomReasonDropdown() {
  const [form, setForm] = useState({
    facility: "MAIN",
    reasonType: RETURN_REASON,
  });

  const [reasons, setReasons] =
    useState([
      {
        key: "Value1",
        value: "Value1",
      },
      {
        key: "Value2",
        value: "Value2",
      },
      {
        key: "Others",
        value: "Others",
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ==========================================================
  // Form change
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
  // Reason change
  // ==========================================================

  const handleReasonChange = (
    index,
    field,
    value
  ) => {
    setReasons((previous) =>
      previous.map(
        (reason, reasonIndex) =>
          reasonIndex === index
            ? {
                ...reason,
                [field]: value,
              }
            : reason
      )
    );
  };

  // ==========================================================
  // Add reason
  // ==========================================================

  const addReason = () => {
    setReasons((previous) => [
      ...previous,
      {
        key: "",
        value: "",
      },
    ]);
  };

  // ==========================================================
  // Remove reason
  // ==========================================================

  const removeReason = (
    index
  ) => {
    setReasons((previous) =>
      previous.filter(
        (_, reasonIndex) =>
          reasonIndex !== index
      )
    );
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
      // Facility
      // ------------------------------------------------------

      if (!form.facility.trim()) {
        throw new Error(
          "Facility is required."
        );
      }

      // ------------------------------------------------------
      // Reasons
      // ------------------------------------------------------

      if (
        reasons.length === 0
      ) {
        throw new Error(
          "Add at least one reason."
        );
      }

      const cleanedReasons = {};

      for (
        let index = 0;
        index < reasons.length;
        index++
      ) {
        const reason =
          reasons[index];

        const key =
          reason.key.trim();

        const value =
          reason.value.trim();

        if (!key) {
          throw new Error(
            `Reason ${index + 1}: key is required.`
          );
        }

        if (!value) {
          throw new Error(
            `Reason ${index + 1}: value is required.`
          );
        }

        if (
          Object.prototype.hasOwnProperty.call(
            cleanedReasons,
            key
          )
        ) {
          throw new Error(
            `Duplicate reason key: "${key}".`
          );
        }

        cleanedReasons[key] =
          value;
      }

      // ------------------------------------------------------
      // Build payload
      // ------------------------------------------------------

      const payload = {
        facility:
          form.facility.trim(),

        name:
          form.reasonType,

        reasons:
          cleanedReasons,
      };

      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/ui-custom-list/create-or-update`,
          payload
        );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to update custom reason dropdown."
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
      reasonType:
        RETURN_REASON,
    });

    setReasons([
      {
        key: "Value1",
        value: "Value1",
      },
      {
        key: "Value2",
        value: "Value2",
      },
      {
        key: "Others",
        value: "Others",
      },
    ]);

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
            Enable Custom Reason Dropdown
          </h2>

          <p
            style={
              descriptionStyle
            }
          >
            Configure custom Return or
            Cancellation reasons that
            sellers can select in Uniware.
          </p>

          <span
            style={badgeStyle}
          >
            FACILITY LEVEL
          </span>
        </div>

        {/* ================================================== */}
        {/* Info */}
        {/* ================================================== */}

        <div
          style={infoStyle}
        >
          <strong>
            Important:
          </strong>{" "}
          Uniware requires the same
          key-value reason pairs for
          Return Reason and Cancellation
          Reason. Only the configuration
          name changes.
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
          {/* Configuration */}
          {/* ================================================= */}

          <SectionTitle>
            Dropdown Configuration
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
              label="Reason Type *"
            >
              <select
                name="reasonType"
                value={
                  form.reasonType
                }
                onChange={
                  handleChange
                }
                style={inputStyle}
              >
                <option
                  value={
                    RETURN_REASON
                  }
                >
                  Return Reason
                </option>

                <option
                  value={
                    CANCEL_REASON
                  }
                >
                  Cancellation Reason
                </option>
              </select>
            </FormField>
          </div>

          {/* ================================================= */}
          {/* Uniware Name */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: "15px",
              padding: "12px 14px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
              borderRadius: "7px",
              fontSize: "13px",
            }}
          >
            <strong>
              Uniware Name:
            </strong>{" "}
            {form.reasonType}
          </div>

          {/* ================================================= */}
          {/* Reasons */}
          {/* ================================================= */}

          <SectionTitle>
            Reason Values
          </SectionTitle>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              marginTop: "-5px",
              marginBottom: "18px",
            }}
          >
            The key and value are both
            sent to Uniware. For example,
            <strong>
              {" "}
              Damaged Product →
              Damaged Product
            </strong>
            .
          </p>

          <div
            style={{
              border:
                "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr 100px",
                gap: "10px",
                padding:
                  "12px 15px",
                background:
                  "#f8fafc",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              <div>
                Reason Key
              </div>

              <div>
                Reason Value
              </div>

              <div>
                Action
              </div>
            </div>

            {reasons.map(
              (
                reason,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr 100px",
                    gap: "10px",
                    padding:
                      "12px 15px",
                    borderTop:
                      "1px solid #e5e7eb",
                    alignItems:
                      "center",
                  }}
                >
                  <input
                    value={
                      reason.key
                    }
                    onChange={(
                      event
                    ) =>
                      handleReasonChange(
                        index,
                        "key",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Damaged Product"
                    style={
                      inputStyle
                    }
                  />

                  <input
                    value={
                      reason.value
                    }
                    onChange={(
                      event
                    ) =>
                      handleReasonChange(
                        index,
                        "value",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Damaged Product"
                    style={
                      inputStyle
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeReason(
                        index
                      )
                    }
                    disabled={
                      reasons.length ===
                      1
                    }
                    style={{
                      ...removeButtonStyle,
                      opacity:
                        reasons.length ===
                        1
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
              addReason
            }
            style={
              addButtonStyle
            }
          >
            + Add Reason
          </button>

          {/* ================================================= */}
          {/* Preview */}
          {/* ================================================= */}

          <SectionTitle>
            Uniware Payload Preview
          </SectionTitle>

          <pre
            style={
              previewStyle
            }
          >
            {JSON.stringify(
              {
                name:
                  form.reasonType,
                value: JSON.stringify(
                  Object.fromEntries(
                    reasons
                      .filter(
                        (reason) =>
                          reason.key.trim()
                      )
                      .map(
                        (reason) => [
                          reason.key.trim(),
                          reason.value.trim(),
                        ]
                      )
                  )
                ),
              },
              null,
              2
            )}
          </pre>

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
                ? "Saving..."
                : "Enable / Update Dropdown"}
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
          <CustomReasonResult
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
// Result
// ============================================================

function CustomReasonResult({
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
        Update Result
      </h3>

      <div
        style={{
          marginTop: "15px",
          padding: "18px",
          background:
            successful
              ? "#f0fdf4"
              : "#fef2f2",
          border:
            successful
              ? "1px solid #bbf7d0"
              : "1px solid #fecaca",
          borderRadius: "8px",
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
            ? "✓ Dropdown Updated"
            : "✕ Update Failed"}
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
          style={previewStyle}
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
  maxWidth: "1100px",
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

const infoStyle = {
  marginBottom: "20px",
  padding: "15px",
  background: "#eff6ff",
  border:
    "1px solid #bfdbfe",
  borderRadius: "8px",
  color: "#1e40af",
  lineHeight: 1.6,
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
  marginTop: "12px",
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
  padding: "9px 10px",
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

const previewStyle = {
  marginTop: "12px",
  padding: "16px",
  background: "#111827",
  color: "#e5e7eb",
  borderRadius: "8px",
  overflowX: "auto",
  fontSize: "13px",
};

export default EnableCustomReasonDropdown;