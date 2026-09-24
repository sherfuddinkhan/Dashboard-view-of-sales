import React, {
  useState,
} from "react";
import axios from "axios";

const SERVER_URL =
  "http://localhost:5000";

function UpdateShipmentSealIdBulk() {
  const [form, setForm] = useState({
    facility: "MAIN",
  });

  const [packages, setPackages] =
    useState([
      {
        shippingPackageCode:
          "05P1006717",
        shippingPackageTypeCode:
          "BOX",
        sptItemSealID:
          "123456",
        shipmentActualWeightCalculationRequired:
          true,
      },
      {
        shippingPackageCode:
          "02P1001772",
        shippingPackageTypeCode:
          "BOX",
        sptItemSealID:
          "123457",
        shipmentActualWeightCalculationRequired:
          true,
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ==========================================================
  // Facility change
  // ==========================================================

  const handleFacilityChange = (
    event
  ) => {
    setForm({
      facility:
        event.target.value,
    });
  };

  // ==========================================================
  // Package field change
  // ==========================================================

  const handlePackageChange = (
    index,
    field,
    value
  ) => {
    setPackages((previous) =>
      previous.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  // ==========================================================
  // Add package
  // ==========================================================

  const addPackage = () => {
    setPackages((previous) => [
      ...previous,
      {
        shippingPackageCode:
          "",
        shippingPackageTypeCode:
          "",
        sptItemSealID: "",
        shipmentActualWeightCalculationRequired:
          true,
      },
    ]);
  };

  // ==========================================================
  // Remove package
  // ==========================================================

  const removePackage = (
    index
  ) => {
    setPackages((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
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
      // Facility validation
      // ------------------------------------------------------

      if (!form.facility.trim()) {
        throw new Error(
          "Facility is required."
        );
      }

      // ------------------------------------------------------
      // Package validation
      // ------------------------------------------------------

      if (
        packages.length === 0
      ) {
        throw new Error(
          "Add at least one shipping package."
        );
      }

      const packageCodes =
        new Set();

      const sealIds =
        new Set();

      const cleanedPackages =
        [];

      packages.forEach(
        (item, index) => {
          const shippingPackageCode =
            item.shippingPackageCode.trim();

          const shippingPackageTypeCode =
            item.shippingPackageTypeCode.trim();

          const sptItemSealID =
            item.sptItemSealID.trim();

          if (
            !shippingPackageCode
          ) {
            throw new Error(
              `Package ${index + 1}: Shipping Package Code is required.`
            );
          }

          if (
            !shippingPackageTypeCode
          ) {
            throw new Error(
              `Package ${index + 1}: Shipping Package Type Code is required.`
            );
          }

          if (!sptItemSealID) {
            throw new Error(
              `Package ${index + 1}: Seal ID is required.`
            );
          }

          if (
            packageCodes.has(
              shippingPackageCode
            )
          ) {
            throw new Error(
              `Duplicate Shipping Package Code: ${shippingPackageCode}`
            );
          }

          if (
            sealIds.has(
              sptItemSealID
            )
          ) {
            throw new Error(
              `Duplicate Seal ID: ${sptItemSealID}`
            );
          }

          packageCodes.add(
            shippingPackageCode
          );

          sealIds.add(
            sptItemSealID
          );

          cleanedPackages.push({
            shippingPackageCode,
            shippingPackageTypeCode,
            sptItemSealID,
            shipmentActualWeightCalculationRequired:
              Boolean(
                item.shipmentActualWeightCalculationRequired
              ),
          });
        }
      );

      // ------------------------------------------------------
      // Local request
      // ------------------------------------------------------

      const payload = {
        facility:
          form.facility.trim(),
        packages:
          cleanedPackages,
      };

      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/shipping-packages/update-seal-id-bulk`,
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
          "Failed to update shipment seal IDs."
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
    });

    setPackages([
      {
        shippingPackageCode: "",
        shippingPackageTypeCode:
          "",
        sptItemSealID: "",
        shipmentActualWeightCalculationRequired:
          true,
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
              Update shipment-level Seal
              IDs for multiple shipping
              packages during the Uniware
              packing workflow.
            </p>
          </div>

          <span
            style={badgeStyle}
          >
            BULK
          </span>
        </div>

        {/* ================================================== */}
        {/* API Information */}
        {/* ================================================== */}

        <div
          style={infoStyle}
        >
          <strong>
            Uniware API:
          </strong>{" "}
          <code>
            /services/rest/v1/package/updateMultiple
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
          Required by Uniware documentation
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

          <div
            style={{
              maxWidth: "400px",
              marginBottom:
                "25px",
            }}
          >
            <label
              style={labelStyle}
            >
              Facility *
            </label>

            <input
              value={
                form.facility
              }
              onChange={
                handleFacilityChange
              }
              placeholder="MAIN"
              style={inputStyle}
            />
          </div>

          {/* ================================================= */}
          {/* Package Section */}
          {/* ================================================= */}

          <div
            style={sectionHeaderStyle}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                }}
              >
                Shipping Packages
              </h3>

              <span
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                Each package must have
                a unique Seal ID.
              </span>
            </div>

            <button
              type="button"
              onClick={
                addPackage
              }
              style={
                addButtonStyle
              }
            >
              + Add Package
            </button>
          </div>

          {/* ================================================= */}
          {/* Package Cards */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "15px",
            }}
          >
            {packages.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  style={
                    packageCardStyle
                  }
                >
                  <div
                    style={
                      packageHeaderStyle
                    }
                  >
                    <strong>
                      Package #
                      {index + 1}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removePackage(
                          index
                        )
                      }
                      disabled={
                        packages.length ===
                        1
                      }
                      style={{
                        ...removeButtonStyle,
                        opacity:
                          packages.length ===
                          1
                            ? 0.5
                            : 1,
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div
                    style={
                      gridStyle
                    }
                  >
                    <FormField
                      label="Shipping Package Code *"
                    >
                      <input
                        value={
                          item.shippingPackageCode
                        }
                        onChange={(
                          event
                        ) =>
                          handlePackageChange(
                            index,
                            "shippingPackageCode",
                            event
                              .target
                              .value
                          )
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
                        value={
                          item.shippingPackageTypeCode
                        }
                        onChange={(
                          event
                        ) =>
                          handlePackageChange(
                            index,
                            "shippingPackageTypeCode",
                            event
                              .target
                              .value
                          )
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
                        value={
                          item.sptItemSealID
                        }
                        onChange={(
                          event
                        ) =>
                          handlePackageChange(
                            index,
                            "sptItemSealID",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="123456"
                        style={
                          inputStyle
                        }
                      />
                    </FormField>

                    <FormField
                      label="Actual Weight Calculation"
                    >
                      <label
                        style={
                          checkboxLabelStyle
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            item.shipmentActualWeightCalculationRequired
                          }
                          onChange={(
                            event
                          ) =>
                            handlePackageChange(
                              index,
                              "shipmentActualWeightCalculationRequired",
                              event
                                .target
                                .checked
                            )
                          }
                        />

                        Calculate shipment
                        actual weight
                      </label>
                    </FormField>
                  </div>
                </div>
              )
            )}
          </div>

          {/* ================================================= */}
          {/* Payload Preview */}
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
                packages:
                  packages.map(
                    (
                      item
                    ) => ({
                      shippingPackageCode:
                        item.shippingPackageCode,
                      shippingPackageTypeCode:
                        item.shippingPackageTypeCode,
                      sptItemSealID:
                        item.sptItemSealID,
                      shipmentActualWeightCalculationRequired:
                        item.shipmentActualWeightCalculationRequired,
                    })
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
                : "Update Seal IDs"}
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
// Result
// ============================================================

function ResultSection({
  result,
}) {
  const successful =
    result.successful === true;

  const updatedPackages =
    Array.isArray(
      result.shippingPackageFullDTO
    )
      ? result.shippingPackageFullDTO
      : result.shippingPackageFullDTO
        ? [result.shippingPackageFullDTO]
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

      <div
        style={{
          padding: "18px",
          marginTop: "15px",
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
            ? "✓ Seal IDs Updated"
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
      {/* Updated Packages */}
      {/* ================================================== */}

      {updatedPackages.length >
        0 && (
        <div
          style={{
            marginTop: "25px",
          }}
        >
          <h4>
            Updated Shipping Packages
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
                    Package Code
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Package Type
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Seal ID
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {updatedPackages.map(
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
                        {item.shippingPackageCode ||
                          item.code ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.shippingPackageTypeCode ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.sptItemSealID ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        Updated
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
  maxWidth: "1150px",
  margin: "30px auto",
  padding: "20px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const cardStyle = {
  background: "#ffffff",
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
  background: "#dbeafe",
  color: "#1d4ed8",
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: "15px",
  marginBottom: "15px",
};

const packageCardStyle = {
  border:
    "1px solid #e5e7eb",
  borderRadius: "9px",
  padding: "18px",
  background: "#fafafa",
};

const packageHeaderStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  minHeight: "42px",
  fontSize: "14px",
};

const addButtonStyle = {
  padding: "10px 16px",
  border:
    "1px solid #2563eb",
  borderRadius: "7px",
  background: "#fff",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};

const removeButtonStyle = {
  padding: "8px 12px",
  border:
    "1px solid #dc2626",
  borderRadius: "6px",
  background: "#fff",
  color: "#dc2626",
  cursor: "pointer",
  fontWeight: 600,
};

const sectionTitleStyle = {
  marginTop: "30px",
  marginBottom: "12px",
  paddingBottom: "9px",
  borderBottom:
    "1px solid #e5e7eb",
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

export default UpdateShipmentSealIdBulk;