import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetShippingManifest() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingManifestCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // ----------------------------------------------------------
  // Form change
  // ----------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const facility =
      form.facility.trim();

    const manifestCode =
      form.shippingManifestCode.trim();

    if (!facility) {
      setError("Facility is required.");
      return;
    }

    if (!manifestCode) {
      setError(
        "Shipping Manifest Code is required."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-manifests/get`,
        {
          facility,
          shippingManifestCode:
            manifestCode,
        }
      );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to get shipping manifest."
      );

      if (responseData) {
        setResult(responseData);
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
      facility: "MAIN",
      shippingManifestCode: "",
    });

    setError("");
    setResult(null);
  };

  return (
    <div
      style={{
        maxWidth: "1250px",
        margin: "30px auto",
        padding: "24px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "28px",
          boxShadow:
            "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "26px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "27px",
            }}
          >
            Get Shipping Manifest
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            Fetch complete shipping manifest
            details from Uniware using the
            shipping manifest code.
          </p>

          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "5px",
              background: "#fef3c7",
              color: "#92400e",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            FACILITY LEVEL — FACILITY HEADER REQUIRED
          </span>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
              padding: "20px",
              background: "#fafafa",
              border:
                "1px solid #e5e7eb",
              borderRadius: "9px",
            }}
          >
            {/* Facility */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Facility *
              </label>

              <input
                type="text"
                name="facility"
                value={form.facility}
                onChange={handleChange}
                placeholder="MAIN"
                style={inputStyle}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#6b7280",
                }}
              >
                Uniware facility code.
              </small>
            </div>

            {/* Manifest Code */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Shipping Manifest Code *
              </label>

              <input
                type="text"
                name="shippingManifestCode"
                value={
                  form.shippingManifestCode
                }
                onChange={handleChange}
                placeholder="MANIFEST00001"
                style={inputStyle}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#6b7280",
                }}
              >
                Code of the manifest you
                want to retrieve.
              </small>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "22px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px 22px",
                border: "none",
                borderRadius: "7px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? "Loading Manifest..."
                : "Get Shipping Manifest"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={clearButtonStyle}
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#fef2f2",
              border:
                "1px solid #fecaca",
              borderRadius: "8px",
              color: "#b91c1c",
            }}
          >
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <ManifestResult result={result} />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Manifest Result
// ============================================================

function ManifestResult({ result }) {
  const manifest =
    result.shippingManifest || {};

  const status =
    manifest.shippingManifestStatus ||
    {};

  const manifestItems =
    Array.isArray(
      manifest.manifestItems
    )
      ? manifest.manifestItems
      : [];

  const customFields =
    Array.isArray(
      manifest.customFieldValues
    )
      ? manifest.customFieldValues
      : [];

  const failedPackages =
    Array.isArray(
      status.failedShippingPackages
    )
      ? status.failedShippingPackages
      : [];

  return (
    <div
      style={{
        marginTop: "32px",
      }}
    >
      <h3
        style={{
          marginBottom: "16px",
        }}
      >
        Shipping Manifest Details
      </h3>

      {/* Request status */}
      <div
        style={{
          padding: "18px",
          borderRadius: "9px",
          background:
            result.successful
              ? "#f0fdf4"
              : "#fef2f2",
          border: `1px solid ${
            result.successful
              ? "#bbf7d0"
              : "#fecaca"
          }`,
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color:
              result.successful
                ? "#15803d"
                : "#b91c1c",
          }}
        >
          {result.successful
            ? "✓ Manifest Retrieved"
            : "✕ Request Failed"}
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

      {/* Basic manifest information */}
      <section style={sectionStyle}>
        <h4 style={sectionTitle}>
          Manifest Information
        </h4>

        <div style={gridStyle}>
          <ResultCard
            label="Manifest ID"
            value={manifest.id}
          />

          <ResultCard
            label="Manifest Code"
            value={manifest.code}
          />

          <ResultCard
            label="Username"
            value={manifest.username}
          />

          <ResultCard
            label="Shipping Provider"
            value={
              manifest.shippingProvider
            }
          />

          <ResultCard
            label="Provider Code"
            value={
              manifest.shippingProviderCode
            }
          />

          <ResultCard
            label="Shipping Method"
            value={
              manifest.shippingMethod
            }
          />

          <ResultCard
            label="Channel"
            value={manifest.channel}
          />

          <ResultCard
            label="Shipping Courier"
            value={
              manifest.shippingCourier
            }
          />

          <ResultCard
            label="Status"
            value={manifest.status}
          />

          <ResultCard
            label="Cash On Delivery"
            value={
              manifest.cashOnDelivery ===
              undefined
                ? "N/A"
                : manifest.cashOnDelivery
                  ? "Yes"
                  : "No"
            }
          />

          <ResultCard
            label="Created"
            value={formatDate(
              manifest.created
            )}
          />

          <ResultCard
            label="Updated"
            value={formatDate(
              manifest.updated
            )}
          />

          <ResultCard
            label="Fetch Current Channel Manifest"
            value={
              manifest.fetchCurrentChannelManifestEnabled ===
              undefined
                ? "N/A"
                : manifest.fetchCurrentChannelManifestEnabled
                  ? "Enabled"
                  : "Disabled"
            }
          />
        </div>

        {/* Manifest links */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "18px",
          }}
        >
          {manifest.shippingManfestLink && (
            <a
              href={
                manifest.shippingManfestLink
              }
              target="_blank"
              rel="noreferrer"
              style={linkButtonStyle}
            >
              Open Shipping Manifest
            </a>
          )}

          {manifest.signatureLink && (
            <a
              href={
                manifest.signatureLink
              }
              target="_blank"
              rel="noreferrer"
              style={linkButtonStyle}
            >
              Open Signature
            </a>
          )}
        </div>
      </section>

      {/* Manifest status */}
      <section style={sectionStyle}>
        <h4 style={sectionTitle}>
          Manifest Processing Status
        </h4>

        <div style={gridStyle}>
          <ResultCard
            label="Current Status"
            value={
              status.currentStatus
            }
          />

          <ResultCard
            label="Completed"
            value={
              status.completed ===
              undefined
                ? "N/A"
                : status.completed
                  ? "Yes"
                  : "No"
            }
          />

          <ResultCard
            label="Successful"
            value={
              status.successful ===
              undefined
                ? "N/A"
                : status.successful
                  ? "Yes"
                  : "No"
            }
          />

          <ResultCard
            label="Progress"
            value={
              status.percentageComplete ===
              undefined
                ? "N/A"
                : `${status.percentageComplete}%`
            }
          />

          <ResultCard
            label="Current Milestone"
            value={
              status.currentMileStone
            }
          />

          <ResultCard
            label="Milestone Count"
            value={
              status.mileStoneCount
            }
          />

          <ResultCard
            label="Status ID"
            value={status.id}
          />

          <ResultCard
            label="Failed Shipment Batch"
            value={
              status.failedShipmentsBatchCode
            }
          />

          <ResultCard
            label="Created"
            value={formatDate(
              status.created
            )}
          />

          <ResultCard
            label="Updated"
            value={formatDate(
              status.updated
            )}
          />
        </div>

        {status.shippingManifestLink && (
          <div
            style={{
              marginTop: "18px",
            }}
          >
            <a
              href={
                status.shippingManifestLink
              }
              target="_blank"
              rel="noreferrer"
              style={linkButtonStyle}
            >
              Open Manifest Status Link
            </a>
          </div>
        )}
      </section>

      {/* Manifest items */}
      <section style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h4
            style={{
              ...sectionTitle,
              marginBottom: 0,
            }}
          >
            Manifest Items
          </h4>

          <span
            style={{
              padding: "5px 10px",
              borderRadius: "20px",
              background: "#e0e7ff",
              color: "#3730a3",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {manifestItems.length} Package
            {manifestItems.length !==
            1
              ? "s"
              : ""}
          </span>
        </div>

        {manifestItems.length === 0 ? (
          <EmptyState text="No manifest items returned." />
        ) : (
          <div
            style={{
              overflowX: "auto",
              border:
                "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: "1350px",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Package Code
                  </th>

                  <th style={thStyle}>
                    Package Status
                  </th>

                  <th style={thStyle}>
                    Invoice
                  </th>

                  <th style={thStyle}>
                    Tracking
                  </th>

                  <th style={thStyle}>
                    Order
                  </th>

                  <th style={thStyle}>
                    Qty
                  </th>

                  <th style={thStyle}>
                    Boxes
                  </th>

                  <th style={thStyle}>
                    Weight (gm)
                  </th>

                  <th style={thStyle}>
                    Total
                  </th>

                  <th style={thStyle}>
                    Shipping
                  </th>

                  <th style={thStyle}>
                    Collectable
                  </th>

                  <th style={thStyle}>
                    COD
                  </th>

                  <th style={thStyle}>
                    Provider
                  </th>
                </tr>
              </thead>

              <tbody>
                {manifestItems.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={index}
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.shippingPackageCode ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.shippingPackageStatusCode ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.invoiceDisplayCode ||
                          item.invoiceCode ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.trackingNumber ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.displayOrderCode ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.quantity ??
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.noOfBoxes ??
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.weight ??
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.totalAmount ??
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.shippingCharges ??
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.collectableAmount ??
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.cashOnDelivery ===
                        undefined
                          ? "N/A"
                          : item.cashOnDelivery
                            ? "Yes"
                            : "No"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.shippingProviderName ||
                          item.shippingProviderCode ||
                          "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Package details */}
        {manifestItems.map(
          (item, index) => (
            <ManifestPackageDetails
              key={index}
              item={item}
              index={index}
            />
          )
        )}
      </section>

      {/* Custom fields */}
      <section style={sectionStyle}>
        <h4 style={sectionTitle}>
          Custom Fields
        </h4>

        {customFields.length === 0 ? (
          <EmptyState text="No custom fields returned." />
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Field Name
                  </th>

                  <th style={thStyle}>
                    Display Name
                  </th>

                  <th style={thStyle}>
                    Value
                  </th>

                  <th style={thStyle}>
                    Type
                  </th>

                  <th style={thStyle}>
                    Required
                  </th>

                  <th style={thStyle}>
                    Possible Values
                  </th>
                </tr>
              </thead>

              <tbody>
                {customFields.map(
                  (
                    field,
                    index
                  ) => (
                    <tr
                      key={index}
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        {field.fieldName ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {field.displayName ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {formatValue(
                          field.fieldValue
                        )}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {field.valueType ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {field.required ===
                        undefined
                          ? "N/A"
                          : field.required
                            ? "Yes"
                            : "No"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {Array.isArray(
                          field.possibleValues
                        )
                          ? field.possibleValues.join(
                              ", "
                            )
                          : "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Failed packages */}
      {failedPackages.length > 0 && (
        <section
          style={{
            ...sectionStyle,
            background: "#fff7f7",
            borderColor: "#fecaca",
          }}
        >
          <h4
            style={{
              ...sectionTitle,
              color: "#b91c1c",
            }}
          >
            Failed Shipping Packages
          </h4>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Package Code
                  </th>

                  <th style={thStyle}>
                    Sale Order
                  </th>

                  <th style={thStyle}>
                    Failure Reason
                  </th>

                  <th style={thStyle}>
                    Cancelled
                  </th>
                </tr>
              </thead>

              <tbody>
                {failedPackages.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={index}
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.code ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.saleOrderCode ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.failureReason ||
                          "N/A"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.cancelled ===
                        undefined
                          ? "N/A"
                          : item.cancelled
                            ? "Yes"
                            : "No"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Errors */}
      {Array.isArray(
        result.errors
      ) &&
        result.errors.length > 0 && (
          <section
            style={{
              ...sectionStyle,
              background: "#fef2f2",
              borderColor:
                "#fecaca",
            }}
          >
            <h4
              style={{
                ...sectionTitle,
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
                      "12px 0",
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
          </section>
        )}

      {/* Warnings */}
      {Array.isArray(
        result.warnings
      ) &&
        result.warnings.length > 0 && (
          <section
            style={{
              ...sectionStyle,
              background: "#fffbeb",
              borderColor:
                "#fde68a",
            }}
          >
            <h4
              style={{
                ...sectionTitle,
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
                      "9px",
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
          </section>
        )}

      {/* Raw response */}
      <details
        style={{
          marginTop: "22px",
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
            background: "#111827",
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
// Package Details
// ============================================================

function ManifestPackageDetails({
  item,
  index,
}) {
  const address =
    item.shippingAddress || {};

  const packageType =
    item.shippingPackageType || {};

  const lineItems =
    Array.isArray(
      item.manifestLineItems
    )
      ? item.manifestLineItems
      : [];

  return (
    <details
      style={{
        marginTop: "16px",
        border:
          "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "15px",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Package {index + 1}:{" "}
        {item.shippingPackageCode ||
          "N/A"}
      </summary>

      {/* Address */}
      <div
        style={{
          marginTop: "18px",
        }}
      >
        <h4>Shipping Address</h4>

        <div style={gridStyle}>
          <ResultCard
            label="Name"
            value={address.name}
          />

          <ResultCard
            label="Address Line 1"
            value={
              address.addressLine1
            }
          />

          <ResultCard
            label="Address Line 2"
            value={
              address.addressLine2
            }
          />

          <ResultCard
            label="City"
            value={address.city}
          />

          <ResultCard
            label="State"
            value={address.state}
          />

          <ResultCard
            label="Pincode"
            value={address.pincode}
          />

          <ResultCard
            label="Phone"
            value={address.phone}
          />
        </div>
      </div>

      {/* Package type */}
      <div
        style={{
          marginTop: "20px",
        }}
      >
        <h4>Shipping Package Type</h4>

        <div style={gridStyle}>
          <ResultCard
            label="Code"
            value={packageType.code}
          />

          <ResultCard
            label="Length (mm)"
            value={
              packageType.boxLength
            }
          />

          <ResultCard
            label="Width (mm)"
            value={
              packageType.boxWidth
            }
          />

          <ResultCard
            label="Height (mm)"
            value={
              packageType.boxHeight
            }
          />

          <ResultCard
            label="Box Weight"
            value={
              packageType.boxWeight
            }
          />

          <ResultCard
            label="Packing Cost"
            value={
              packageType.packingCost
            }
          />

          <ResultCard
            label="Enabled"
            value={
              packageType.enabled ===
              undefined
                ? "N/A"
                : packageType.enabled
                  ? "Yes"
                  : "No"
            }
          />

          <ResultCard
            label="Editable"
            value={
              packageType.editable ===
              undefined
                ? "N/A"
                : packageType.editable
                  ? "Yes"
                  : "No"
            }
          />
        </div>
      </div>

      {/* Line items */}
      <div
        style={{
          marginTop: "20px",
        }}
      >
        <h4>Manifest Line Items</h4>

        {lineItems.length === 0 ? (
          <EmptyState text="No line items returned." />
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Identifier
                  </th>

                  <th style={thStyle}>
                    Item Name
                  </th>

                  <th style={thStyle}>
                    Seller SKU
                  </th>

                  <th style={thStyle}>
                    Quantity
                  </th>
                </tr>
              </thead>

              <tbody>
                {lineItems.map(
                  (
                    lineItem,
                    lineIndex
                  ) => (
                    <tr
                      key={
                        lineIndex
                      }
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        {
                          lineItem.lineItemIdentifier
                        }
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {
                          lineItem.itemName
                        }
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {
                          lineItem.sellerSkuCode
                        }
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {lineItem.quantity ??
                          0}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </details>
  );
}

// ============================================================
// Result Card
// ============================================================

function ResultCard({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "13px",
        background: "#f9fafb",
        border:
          "1px solid #e5e7eb",
        borderRadius: "7px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 600,
          wordBreak:
            "break-word",
        }}
      >
        {value ===
          undefined ||
        value === null ||
        value === ""
          ? "N/A"
          : value}
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function formatValue(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "N/A";
  }

  if (
    typeof value === "object"
  ) {
    return JSON.stringify(value);
  }

  return String(value);
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        padding: "15px",
        background: "#f9fafb",
        border:
          "1px solid #e5e7eb",
        borderRadius: "7px",
        color: "#6b7280",
      }}
    >
      {text}
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const sectionStyle = {
  marginTop: "24px",
  padding: "20px",
  border:
    "1px solid #e5e7eb",
  borderRadius: "9px",
  background: "#fafafa",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "18px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border:
    "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
  fontSize: "14px",
};

const clearButtonStyle = {
  padding: "13px 22px",
  border:
    "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const linkButtonStyle = {
  display: "inline-block",
  padding: "9px 14px",
  background: "#eff6ff",
  border:
    "1px solid #bfdbfe",
  borderRadius: "6px",
  color: "#1d4ed8",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "13px",
};

const thStyle = {
  textAlign: "left",
  padding: "11px",
  background: "#f3f4f6",
  borderBottom:
    "1px solid #d1d5db",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "11px",
  borderBottom:
    "1px solid #e5e7eb",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

export default GetShippingManifest;