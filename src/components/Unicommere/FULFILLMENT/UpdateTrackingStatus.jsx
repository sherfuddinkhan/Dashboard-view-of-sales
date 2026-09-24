import React, {
  useState,
} from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function UpdateTrackingStatus() {
  const [form, setForm] = useState({
    facility: "MAIN",
    providerCode: "",
    trackingNumber: "",
    trackingStatus: "",
    statusDate: "",
    shipmentTrackingStatusName: "",
    rtoTrackingNumber: "",
    rtoReason: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ==========================================================
  // Handle input
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
  // Submit
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setResult(null);

    try {
      if (!form.facility.trim()) {
        throw new Error(
          "Facility is required."
        );
      }

      if (
        !form.providerCode.trim()
      ) {
        throw new Error(
          "Provider Code is required."
        );
      }

      if (
        !form.trackingNumber.trim()
      ) {
        throw new Error(
          "Tracking Number is required."
        );
      }

      if (
        !form.trackingStatus.trim()
      ) {
        throw new Error(
          "Tracking Status is required."
        );
      }

      if (
        !form.shipmentTrackingStatusName.trim()
      ) {
        throw new Error(
          "Shipment Tracking Status Name is required."
        );
      }

      const payload = {
        facility:
          form.facility.trim(),

        providerCode:
          form.providerCode.trim(),

        trackingNumber:
          form.trackingNumber.trim(),

        trackingStatus:
          form.trackingStatus.trim(),

        shipmentTrackingStatusName:
          form.shipmentTrackingStatusName.trim(),
      };

      // ------------------------------------------------------
      // Optional status date
      // ------------------------------------------------------

      if (form.statusDate) {
        const date =
          new Date(
            form.statusDate
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          throw new Error(
            "Status Date is invalid."
          );
        }

        payload.statusDate =
          date.toISOString();
      }

      // ------------------------------------------------------
      // Optional RTO fields
      // ------------------------------------------------------

      if (
        form.rtoTrackingNumber.trim()
      ) {
        payload.rtoTrackingNumber =
          form.rtoTrackingNumber.trim();
      }

      if (
        form.rtoReason.trim()
      ) {
        payload.rtoReason =
          form.rtoReason.trim();
      }

      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/shipping-packages/update-tracking-status`,
          payload
        );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to update tracking status."
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
      providerCode: "",
      trackingNumber: "",
      trackingStatus: "",
      statusDate: "",
      shipmentTrackingStatusName: "",
      rtoTrackingNumber: "",
      rtoReason: "",
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
            Update Tracking Status
          </h2>

          <p
            style={
              descriptionStyle
            }
          >
            Post the latest shipment
            tracking status to Uniware
            using the shipping provider
            and tracking number.
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
            text="Shipping Provider"
          />

          <span>→</span>

          <WorkflowStep
            text="Tracking Number"
          />

          <span>→</span>

          <WorkflowStep
            text="Tracking Status"
          />

          <span>→</span>

          <WorkflowStep
            text="Uniware"
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
          {/* Shipment Information */}
          {/* ================================================= */}

          <SectionTitle>
            Shipment Information
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
              label="Provider Code *"
            >
              <input
                name="providerCode"
                value={
                  form.providerCode
                }
                onChange={
                  handleChange
                }
                placeholder="DTDC"
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="Tracking Number *"
            >
              <input
                name="trackingNumber"
                value={
                  form.trackingNumber
                }
                onChange={
                  handleChange
                }
                placeholder="1234567890"
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="Tracking Status *"
            >
              <input
                name="trackingStatus"
                value={
                  form.trackingStatus
                }
                onChange={
                  handleChange
                }
                placeholder="IN_TRANSIT"
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="Shipment Tracking Status Name *"
            >
              <input
                name="shipmentTrackingStatusName"
                value={
                  form.shipmentTrackingStatusName
                }
                onChange={
                  handleChange
                }
                placeholder="In Transit"
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="Status Date"
            >
              <input
                type="datetime-local"
                name="statusDate"
                value={
                  form.statusDate
                }
                onChange={
                  handleChange
                }
                style={inputStyle}
              />
            </FormField>
          </div>

          {/* ================================================= */}
          {/* RTO Information */}
          {/* ================================================= */}

          <SectionTitle>
            RTO Information
          </SectionTitle>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              marginTop: "-5px",
              marginBottom: "18px",
            }}
          >
            Use these fields when the
            RTO shipment has a different
            tracking number or you need
            to provide an RTO reason.
          </p>

          <div style={gridStyle}>
            <FormField
              label="RTO Tracking Number"
            >
              <input
                name="rtoTrackingNumber"
                value={
                  form.rtoTrackingNumber
                }
                onChange={
                  handleChange
                }
                placeholder="RTO123456"
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="RTO Reason"
            >
              <input
                name="rtoReason"
                value={
                  form.rtoReason
                }
                onChange={
                  handleChange
                }
                placeholder="Customer refused delivery"
                style={inputStyle}
              />
            </FormField>
          </div>

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
                : "Update Tracking Status"}
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
          <TrackingResult
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
// Workflow step
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

function TrackingResult({
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
        Tracking Update Result
      </h3>

      {/* Summary */}
      <div
        style={{
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
            ? "✓ Tracking Status Updated"
            : "✕ Tracking Update Failed"}
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

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <StatCard
          label="Total Polled"
          value={
            result.totalPolled ??
            0
          }
        />

        <StatCard
          label="Failures"
          value={
            result.failures ??
            0
          }
        />

        <StatCard
          label="Total Changed"
          value={
            result.totalChanged ??
            0
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
// Statistic card
// ============================================================

function StatCard({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "18px",
        background: "#f8fafc",
        border:
          "1px solid #e2e8f0",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
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

const errorStyle = {
  marginBottom: "20px",
  padding: "14px",
  background: "#fef2f2",
  border:
    "1px solid #fecaca",
  borderRadius: "8px",
  color: "#b91c1c",
};

export default UpdateTrackingStatus;