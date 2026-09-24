import React, {
  useState,
} from "react";
import axios from "axios";

const SERVER_URL =
  "http://localhost:5000";

function UpdateShipmentSealId() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingPackageCode: "",
    shippingPackageTypeCode: "",
    sptItemSealID: "",
    shipmentActualWeightCalculationRequired: true,
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ==========================================================
  // Handle change
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
  // Handle checkbox
  // ==========================================================

  const handleCheckboxChange = (
    event
  ) => {
    setForm((previous) => ({
      ...previous,
      shipmentActualWeightCalculationRequired:
        event.target.checked,
    }));
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
      const facility =
        form.facility.trim();

      const shippingPackageCode =
        form.shippingPackageCode.trim();

      const shippingPackageTypeCode =
        form.shippingPackageTypeCode.trim();

      const sptItemSealID =
        form.sptItemSealID.trim();

      // ------------------------------------------------------
      // Validation
      // ------------------------------------------------------

      if (!facility) {
        throw new Error(
          "Facility is required."
        );
      }

      if (!shippingPackageCode) {
        throw new Error(
          "Shipping Package Code is required."
        );
      }

      if (
        !shippingPackageTypeCode
      ) {
        throw new Error(
          "Shipping Package Type Code is required."
        );
      }

      if (!sptItemSealID) {
        throw new Error(
          "Shipment Seal ID is required."
        );
      }

      // ------------------------------------------------------
      // Request payload
      // ------------------------------------------------------

      const payload = {
        facility,
        shippingPackageCode,
        shippingPackageTypeCode,
        sptItemSealID,
        shipmentActualWeightCalculationRequired:
          form.shipmentActualWeightCalculationRequired,
      };

      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/shipping-packages/update-seal-id`,
          payload
        );

      setResult(
        response.data
      );
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to update shipment seal ID."
      );

      if (responseData) {
        setResult(
          responseData
        );
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
      shippingPackageCode: "",
      shippingPackageTypeCode: "",
      sptItemSealID: "",
      shipmentActualWeightCalculationRequired: true,
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

        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>
              Update Shipment Seal ID
            </h2>

            <p
              style={
                descriptionStyle
              }
            >
              Capture a shipment-level
              Seal ID for a single shipping
              package during the Uniware
              packing workflow.
            </p>
          </div>

          <span
            style={badgeStyle}
          >
            SINGLE
          </span>
        </div>

        {/* ================================================== */}
        {/* API Information */}
        {/* ================================================== */}

        <div
          style={infoStyle}
        >
          <strong>
            Uniware Endpoint:
          </strong>{" "}
          <code>
            /services/rest/v1/package/update
          </code>

          <br />

          <strong>
            Level:
          </strong>{" "}
          Tenant

          <br />

          <strong>
            Facility Header:
          </strong>{" "}
          Required
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
          {/* Package Details */}
          {/* ================================================= */}

          <h3
            style={
              sectionTitleStyle
            }
          >
            Shipping Package
          </h3>

          <div
            style={gridStyle}
          >
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
                style={
                  inputStyle
                }
              />
            </FormField>

            <FormField
              label="Shipping Package Code *"
            >
              <input
                name="shippingPackageCode"
                value={
                  form.shippingPackageCode
                }
                onChange={
                  handleChange
                }
                placeholder="05P1006717"
                style={
                  inputStyle
                }
              />
            </FormField>

            <FormField
              label="Shipping Package Type Code *"
            >
              <input
                name="shippingPackageTypeCode"
                value={
                  form.shippingPackageTypeCode
                }
                onChange={
                  handleChange
                }
                placeholder="BOX"
                style={
                  inputStyle
                }
              />
            </FormField>

            <FormField
              label="Shipment Seal ID *"
            >
              <input
                name="sptItemSealID"
                value={
                  form.sptItemSealID
                }
                onChange={
                  handleChange
                }
                placeholder="123456"
                style={
                  inputStyle
                }
              />
            </FormField>
          </div>

          {/* ================================================= */}
          {/* Weight Calculation */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              border:
                "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#fafafa",
            }}
          >
            <label
              style={
                checkboxLabelStyle
              }
            >
              <input
                type="checkbox"
                checked={
                  form.shipmentActualWeightCalculationRequired
                }
                onChange={
                  handleCheckboxChange
                }
              />

              <span>
                <strong>
                  Shipment Actual Weight
                  Calculation Required
                </strong>

                <br />

                <small
                  style={{
                    color:
                      "#6b7280",
                  }}
                >
                  Enable Uniware's shipment
                  actual-weight calculation
                  logic.
                </small>
              </span>
            </label>
          </div>

          {/* ================================================= */}
          {/* Request Preview */}
          {/* ================================================= */}

          <h3
            style={
              sectionTitleStyle
            }
          >
            Request Preview
          </h3>

          <pre
            style={
              previewStyle
            }
          >
            {JSON.stringify(
              {
                shippingPackageCode:
                  form.shippingPackageCode,
                shippingPackageTypeCode:
                  form.shippingPackageTypeCode,
                sptItemSealID:
                  form.sptItemSealID,
                shipmentActualWeightCalculationRequired:
                  form.shipmentActualWeightCalculationRequired,
              },
              null,
              2
            )}
          </pre>

          {/* ================================================= */}
          {/* Buttons */}
          {/* ================================================= */}

          <div
            style={
              buttonRowStyle
            }
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity:
                  loading
                    ? 0.7
                    : 1,
              }}
            >
              {loading
                ? "Updating..."
                : "Update Seal ID"}
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
          <ResultSection
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
// Result Section
// ============================================================

function ResultSection({
  result,
}) {
  const successful =
    result.successful === true;

  const responses =
    Array.isArray(
      result.responses
    )
      ? result.responses
      : [];

  return (
    <div
      style={{
        marginTop: "35px",
        paddingTop: "25px",
        borderTop:
          "1px solid #e5e7eb",
      }}
    >
      <h3>
        Update Result
      </h3>

      {/* ================================================== */}
      {/* Status */}
      {/* ================================================== */}

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
            ? "✓ Seal ID Updated"
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

      {/* ================================================== */}
      {/* Responses */}
      {/* ================================================== */}

      {responses.length >
        0 && (
        <div
          style={{
            marginTop: "25px",
          }}
        >
          <h4>
            Updated Package Response
          </h4>

          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={
                tableStyle
              }
            >
              <thead>
                <tr>
                  <th
                    style={
                      thStyle
                    }
                  >
                    #
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {responses.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        {index + 1}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace:
                              "pre-wrap",
                          }}
                        >
                          {JSON.stringify(
                            item,
                            null,
                            2
                          )}
                        </pre>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* Errors */}
      {/* ================================================== */}

      {Array.isArray(
        result.errors
      ) &&
        result.errors.length >
          0 && (
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

      {/* ================================================== */}
      {/* Warnings */}
      {/* ================================================== */}

      {Array.isArray(
        result.warnings
      ) &&
        result.warnings.length >
          0 && (
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

      {/* ================================================== */}
      {/* Raw Response */}
      {/* ================================================== */}

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
          style={
            previewStyle
          }
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

const headerStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "flex-start",
  gap: "20px",
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
  padding: "7px 12px",
  background: "#dcfce7",
  color: "#166534",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 700,
};

const infoStyle = {
  marginTop: "22px",
  padding: "15px",
  background: "#eff6ff",
  border:
    "1px solid #bfdbfe",
  borderRadius: "8px",
  color: "#1e40af",
  lineHeight: 1.7,
  fontSize: "14px",
};

const errorStyle = {
  marginTop: "20px",
  padding: "14px",
  background: "#fef2f2",
  border:
    "1px solid #fecaca",
  borderRadius: "8px",
  color: "#b91c1c",
};

const sectionTitleStyle = {
  marginTop: "28px",
  marginBottom: "15px",
  paddingBottom: "9px",
  borderBottom:
    "1px solid #e5e7eb",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
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

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  cursor: "pointer",
  fontSize: "14px",
  lineHeight: 1.5,
};

const previewStyle = {
  padding: "16px",
  background: "#111827",
  color: "#e5e7eb",
  borderRadius: "8px",
  overflowX: "auto",
  fontSize: "13px",
};

const buttonRowStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "25px",
};

const primaryButtonStyle = {
  padding: "13px 24px",
  border: "none",
  borderRadius: "7px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
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

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  background: "#f8fafc",
  borderBottom:
    "1px solid #e5e7eb",
  fontSize: "13px",
};

const tdStyle = {
  padding: "12px",
  borderBottom:
    "1px solid #e5e7eb",
  fontSize: "14px",
};

export default UpdateShipmentSealId;