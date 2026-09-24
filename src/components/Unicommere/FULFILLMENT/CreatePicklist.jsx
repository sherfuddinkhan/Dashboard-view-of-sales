import React, {
  useState,
} from "react";
import axios from "axios";

const SERVER_URL =
  "http://localhost:5000";

function CreatePicklist() {
  const [form, setForm] = useState({
    facility: "MAIN",
    mode: "STAGING_TO_INVOICING",
    destination: "INVOICING",
    shippingPackageCodes: [""],
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ==========================================================
  // Normal field change
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
  // Mode change
  // ==========================================================

  const handleModeChange = (
    event
  ) => {
    const mode =
      event.target.value;

    setForm((previous) => ({
      ...previous,
      mode,
      destination:
        mode ===
        "STAGING_TO_INVOICING"
          ? "INVOICING"
          : previous.destination,
    }));
  };

  // ==========================================================
  // Package code change
  // ==========================================================

  const handlePackageCodeChange = (
    index,
    value
  ) => {
    setForm((previous) => {
      const codes = [
        ...previous.shippingPackageCodes,
      ];

      codes[index] = value;

      return {
        ...previous,
        shippingPackageCodes:
          codes,
      };
    });
  };

  // ==========================================================
  // Add package
  // ==========================================================

  const addPackageCode = () => {
    setForm((previous) => ({
      ...previous,
      shippingPackageCodes: [
        ...previous.shippingPackageCodes,
        "",
      ],
    }));
  };

  // ==========================================================
  // Remove package
  // ==========================================================

  const removePackageCode = (
    index
  ) => {
    setForm((previous) => {
      const codes =
        previous.shippingPackageCodes.filter(
          (_, itemIndex) =>
            itemIndex !== index
        );

      return {
        ...previous,
        shippingPackageCodes:
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
      // Facility
      // ------------------------------------------------------

      if (!form.facility.trim()) {
        throw new Error(
          "Facility is required."
        );
      }

      // ------------------------------------------------------
      // Package codes
      // ------------------------------------------------------

      const packageCodes =
        form.shippingPackageCodes
          .map((code) =>
            code.trim()
          )
          .filter(Boolean);

      if (
        packageCodes.length === 0
      ) {
        throw new Error(
          "At least one Shipping Package Code is required."
        );
      }

      // ------------------------------------------------------
      // Build local request
      // ------------------------------------------------------

      const payload = {
        facility:
          form.facility.trim(),

        shippingPackageCodes:
          packageCodes,
      };

      // ------------------------------------------------------
      // Endpoint 2
      // ------------------------------------------------------

      if (
        form.mode ===
        "DIRECT"
      ) {
        if (
          ![
            "INVOICING",
            "STAGING",
          ].includes(
            form.destination
          )
        ) {
          throw new Error(
            "Destination must be INVOICING or STAGING."
          );
        }

        payload.destination =
          form.destination;
      }

      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/picklists/create`,
          payload
        );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to create picklist."
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
      mode: "STAGING_TO_INVOICING",
      destination: "INVOICING",
      shippingPackageCodes: [""],
    });

    setError("");
    setResult(null);
  };

  const picklist =
    result?.picklist;

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
            Create Picklist
          </h2>

          <p
            style={
              descriptionStyle
            }
          >
            Create a Uniware picklist
            from one or more shipping
            packages.
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
            text="Shipping Packages"
          />

          <span>→</span>

          <WorkflowStep
            text="Create Picklist"
          />

          <span>→</span>

          <WorkflowStep
            text="Picking"
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
          {/* Facility */}
          {/* ================================================= */}

          <SectionTitle>
            Picklist Configuration
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
              label="Picklist Creation Mode *"
            >
              <select
                name="mode"
                value={form.mode}
                onChange={
                  handleModeChange
                }
                style={inputStyle}
              >
                <option value="STAGING_TO_INVOICING">
                  Staging → Invoicing
                </option>

                <option value="DIRECT">
                  Direct Destination
                </option>
              </select>
            </FormField>

            {form.mode ===
              "DIRECT" && (
              <FormField
                label="Destination *"
              >
                <select
                  name="destination"
                  value={
                    form.destination
                  }
                  onChange={
                    handleChange
                  }
                  style={
                    inputStyle
                  }
                >
                  <option value="INVOICING">
                    INVOICING
                  </option>

                  <option value="STAGING">
                    STAGING
                  </option>
                </select>
              </FormField>
            )}
          </div>

          {/* ================================================= */}
          {/* Endpoint information */}
          {/* ================================================= */}

          <div
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#475569",
            }}
          >
            <strong>
              Uniware Endpoint:
            </strong>{" "}
            {form.mode ===
            "STAGING_TO_INVOICING"
              ? "/oms/picker/picklist/staging/manual/create"
              : "/oms/picker/picklist/manual/create"}
          </div>

          {/* ================================================= */}
          {/* Shipping Packages */}
          {/* ================================================= */}

          <SectionTitle>
            Shipping Package Codes
          </SectionTitle>

          <p
            style={{
              marginTop: "-5px",
              marginBottom: "18px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Add the shipping package
            codes that should be included
            in this picklist.
          </p>

          {form.shippingPackageCodes.map(
            (
              code,
              index
            ) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  marginBottom:
                    "12px",
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
                  onChange={(
                    event
                  ) =>
                    handlePackageCodeChange(
                      index,
                      event.target
                        .value
                    )
                  }
                  placeholder="SP345400820"
                  style={{
                    ...inputStyle,
                    flex: 1,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    removePackageCode(
                      index
                    )
                  }
                  disabled={
                    form
                      .shippingPackageCodes
                      .length === 1
                  }
                  style={{
                    ...removeButtonStyle,
                    opacity:
                      form
                        .shippingPackageCodes
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

          <button
            type="button"
            onClick={
              addPackageCode
            }
            style={
              addButtonStyle
            }
          >
            + Add Shipping Package
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
                ? "Creating..."
                : "Create Picklist"}
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
          <PicklistResult
            result={result}
            picklist={
              picklist
            }
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

function PicklistResult({
  result,
  picklist,
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
        Picklist Result
      </h3>

      {/* ---------------------------------------------------- */}
      {/* Status */}
      {/* ---------------------------------------------------- */}

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
            ? "✓ Picklist Created"
            : "✕ Picklist Creation Failed"}
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

      {/* ---------------------------------------------------- */}
      {/* Picklist summary */}
      {/* ---------------------------------------------------- */}

      {picklist && (
        <>
          <SectionTitle>
            Picklist Details
          </SectionTitle>

          <div
            style={detailsGridStyle}
          >
            <DetailCard
              label="Picklist ID"
              value={
                picklist.id ??
                "N/A"
              }
            />

            <DetailCard
              label="Picklist Code"
              value={
                picklist.code ||
                "N/A"
              }
            />

            <DetailCard
              label="Username"
              value={
                picklist.username ||
                "N/A"
              }
            />

            <DetailCard
              label="Destination"
              value={
                picklist.destination ||
                "N/A"
              }
            />

            <DetailCard
              label="Status"
              value={
                picklist.status ||
                "N/A"
              }
            />

            <DetailCard
              label="Created"
              value={
                picklist.created
                  ? formatDate(
                      picklist.created
                    )
                  : "N/A"
              }
            />
          </div>

          {/* ------------------------------------------------ */}
          {/* Picklist Items */}
          {/* ------------------------------------------------ */}

          {Array.isArray(
            picklist.picklistItems
          ) &&
            picklist
              .picklistItems
              .length > 0 && (
              <>
                <SectionTitle>
                  Picklist Items
                </SectionTitle>

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
                      {picklist.picklistItems.map(
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
                              {index +
                                1}
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
              </>
            )}

          {/* ------------------------------------------------ */}
          {/* Address */}
          {/* ------------------------------------------------ */}

          {picklist.address && (
            <>
              <SectionTitle>
                Picklist Address
              </SectionTitle>

              <pre
                style={
                  jsonBoxStyle
                }
              >
                {JSON.stringify(
                  picklist.address,
                  null,
                  2
                )}
              </pre>
            </>
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* Errors */}
      {/* ==================================================== */}

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

      {/* ==================================================== */}
      {/* Warnings */}
      {/* ==================================================== */}

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

      {/* ==================================================== */}
      {/* Raw */}
      {/* ==================================================== */}

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
          style={jsonBoxStyle}
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
// Detail card
// ============================================================

function DetailCard({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "15px",
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
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================
// Date formatting
// ============================================================

function formatDate(value) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString();
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

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
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

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  background: "#f8fafc",
  borderBottom:
    "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "12px",
  borderBottom:
    "1px solid #e5e7eb",
  verticalAlign: "top",
};

const jsonBoxStyle = {
  marginTop: "12px",
  padding: "16px",
  background: "#111827",
  color: "#e5e7eb",
  borderRadius: "8px",
  overflowX: "auto",
  fontSize: "13px",
};

export default CreatePicklist;