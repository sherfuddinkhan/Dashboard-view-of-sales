import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateCompleteManifest() {
  const [form, setForm] = useState({
    facility: "MAIN",
    channel: "",
    shippingProviderCode: "",
    shippingProviderName: "",
    shippingMethodCode: "",
    comments: "",
    thirdPartyShipping: true,
    shippingProviderIsAggregator: false,
    shippingCourier: "",
  });

  const [shippingPackageCodes, setShippingPackageCodes] =
    useState([""]);

  const [customFields, setCustomFields] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // ----------------------------------------------------------
  // Form change
  // ----------------------------------------------------------

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ----------------------------------------------------------
  // Shipping package
  // ----------------------------------------------------------

  const handlePackageChange = (index, value) => {
    setShippingPackageCodes((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? value
          : item
      )
    );
  };

  const addPackage = () => {
    setShippingPackageCodes((previous) => [
      ...previous,
      "",
    ]);
  };

  const removePackage = (index) => {
    setShippingPackageCodes((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // ----------------------------------------------------------
  // Custom fields
  // ----------------------------------------------------------

  const addCustomField = () => {
    setCustomFields((previous) => [
      ...previous,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const updateCustomField = (
    index,
    field,
    value
  ) => {
    setCustomFields((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeCustomField = (index) => {
    setCustomFields((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!form.facility.trim()) {
      setError("Facility is required.");
      return;
    }

    const packageCodes =
      shippingPackageCodes
        .map((code) => code.trim())
        .filter(Boolean);

    if (packageCodes.length === 0) {
      setError(
        "At least one Shipping Package Code is required."
      );
      return;
    }

    const invalidCustomField =
      customFields.some(
        (field) => !field.name.trim()
      );

    if (invalidCustomField) {
      setError(
        "Every custom field must have a name."
      );
      return;
    }

    if (
      form.shippingProviderIsAggregator &&
      !form.shippingCourier.trim()
    ) {
      setError(
        "Shipping Courier is required when Shipping Provider Is Aggregator is enabled."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        facility: form.facility.trim(),

        ...(form.channel.trim()
          ? {
              channel:
                form.channel.trim(),
            }
          : {}),

        ...(form.shippingProviderCode.trim()
          ? {
              shippingProviderCode:
                form.shippingProviderCode.trim(),
            }
          : {}),

        ...(form.shippingProviderName.trim()
          ? {
              shippingProviderName:
                form.shippingProviderName.trim(),
            }
          : {}),

        ...(form.shippingMethodCode.trim()
          ? {
              shippingMethodCode:
                form.shippingMethodCode.trim(),
            }
          : {}),

        ...(form.comments.trim()
          ? {
              comments:
                form.comments.trim(),
            }
          : {}),

        // Preserve false
        thirdPartyShipping:
          form.thirdPartyShipping,

        shippingPackageCodes:
          packageCodes,

        // Preserve false
        shippingProviderIsAggregator:
          form.shippingProviderIsAggregator,

        ...(form.shippingCourier.trim()
          ? {
              shippingCourier:
                form.shippingCourier.trim(),
            }
          : {}),

        ...(customFields.length > 0
          ? {
              customFieldValues:
                customFields
                  .filter(
                    (field) =>
                      field.name.trim()
                  )
                  .map((field) => ({
                    name: field.name.trim(),
                    ...(field.value !==
                    undefined
                      ? {
                          value:
                            field.value,
                        }
                      : {}),
                  })),
            }
          : {}),
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-manifests/create-complete`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to create and complete manifest."
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
      channel: "",
      shippingProviderCode: "",
      shippingProviderName: "",
      shippingMethodCode: "",
      comments: "",
      thirdPartyShipping: true,
      shippingProviderIsAggregator: false,
      shippingCourier: "",
    });

    setShippingPackageCodes([""]);
    setCustomFields([]);
    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "24px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "28px",
          boxShadow:
            "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "27px",
            }}
          >
            Create & Complete Shipping Manifest
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            Create a Uniware shipping manifest,
            add shipping packages, and complete
            the manifest in one API request.
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

        <form onSubmit={handleSubmit}>
          {/* Facility & Channel */}
          <section style={sectionStyle}>
            <h3 style={sectionTitle}>
              Manifest Configuration
            </h3>

            <div style={gridStyle}>
              <Field
                label="Facility *"
                name="facility"
                value={form.facility}
                onChange={handleChange}
                placeholder="MAIN"
              />

              <Field
                label="Channel"
                name="channel"
                value={form.channel}
                onChange={handleChange}
                placeholder="AMAZON"
              />

              <Field
                label="Shipping Provider Code"
                name="shippingProviderCode"
                value={
                  form.shippingProviderCode
                }
                onChange={handleChange}
                placeholder="DELHIVERY"
              />

              <Field
                label="Shipping Provider Name"
                name="shippingProviderName"
                value={
                  form.shippingProviderName
                }
                onChange={handleChange}
                placeholder="Delhivery"
              />

              <Field
                label="Shipping Method Code"
                name="shippingMethodCode"
                value={
                  form.shippingMethodCode
                }
                onChange={handleChange}
                placeholder="STD"
              />

              <Field
                label="Shipping Courier"
                name="shippingCourier"
                value={form.shippingCourier}
                onChange={handleChange}
                placeholder="DELHIVERY"
              />
            </div>

            <div
              style={{
                marginTop: "18px",
              }}
            >
              <label style={labelStyle}>
                Comments
              </label>

              <textarea
                name="comments"
                value={form.comments}
                onChange={handleChange}
                placeholder="Manifest comments"
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>
          </section>

          {/* Shipping options */}
          <section style={sectionStyle}>
            <h3 style={sectionTitle}>
              Shipping Options
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <Checkbox
                name="thirdPartyShipping"
                checked={
                  form.thirdPartyShipping
                }
                onChange={handleChange}
                label="Third Party Shipping"
                description="Enable when shipping to the end customer is handled by the marketplace."
              />

              <Checkbox
                name="shippingProviderIsAggregator"
                checked={
                  form.shippingProviderIsAggregator
                }
                onChange={handleChange}
                label="Shipping Provider Is Aggregator"
                description="Enable when the shipping provider is an aggregator."
              />
            </div>
          </section>

          {/* Packages */}
          <section style={sectionStyle}>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "18px",
                gap: "15px",
              }}
            >
              <div>
                <h3
                  style={{
                    ...sectionTitle,
                    marginBottom: "5px",
                  }}
                >
                  Shipping Packages
                </h3>

                <small
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Packages that will be added to
                  the newly created manifest.
                </small>
              </div>

              <button
                type="button"
                onClick={addPackage}
                style={addButtonStyle}
              >
                + Add Package
              </button>
            </div>

            {shippingPackageCodes.map(
              (code, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      color: "#6b7280",
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}.
                  </div>

                  <input
                    type="text"
                    value={code}
                    onChange={(event) =>
                      handlePackageChange(
                        index,
                        event.target.value
                      )
                    }
                    placeholder="SP000001"
                    style={{
                      ...inputStyle,
                      flex: 1,
                    }}
                  />

                  {shippingPackageCodes.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removePackage(index)
                      }
                      style={
                        removeButtonStyle
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              )
            )}
          </section>

          {/* Custom fields */}
          <section style={sectionStyle}>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div>
                <h3
                  style={{
                    ...sectionTitle,
                    marginBottom: "5px",
                  }}
                >
                  Custom Fields
                </h3>

                <small
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Optional manifest custom fields.
                </small>
              </div>

              <button
                type="button"
                onClick={addCustomField}
                style={addButtonStyle}
              >
                + Add Field
              </button>
            </div>

            {customFields.length === 0 && (
              <div
                style={{
                  padding: "14px",
                  background: "#f9fafb",
                  borderRadius: "7px",
                  color: "#6b7280",
                }}
              >
                No custom fields added.
              </div>
            )}

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
                  }}
                >
                  <input
                    type="text"
                    value={field.name}
                    onChange={(event) =>
                      updateCustomField(
                        index,
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Field name"
                    style={inputStyle}
                  />

                  <input
                    type="text"
                    value={field.value}
                    onChange={(event) =>
                      updateCustomField(
                        index,
                        "value",
                        event.target.value
                      )
                    }
                    placeholder="Field value"
                    style={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeCustomField(index)
                    }
                    style={
                      removeButtonStyle
                    }
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </section>

          {/* Actions */}
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
                padding: "13px 22px",
                border: "none",
                borderRadius: "7px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Creating Manifest..."
                : "Create & Complete Manifest"}
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
              border: "1px solid #fecaca",
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
// Reusable field
// ============================================================

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

// ============================================================
// Checkbox
// ============================================================

function Checkbox({
  name,
  checked,
  onChange,
  label,
  description,
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{
          marginTop: "3px",
        }}
      />

      <span>
        <strong>{label}</strong>

        <span
          style={{
            display: "block",
            color: "#6b7280",
            fontSize: "12px",
            marginTop: "3px",
          }}
        >
          {description}
        </span>
      </span>
    </label>
  );
}

// ============================================================
// Result
// ============================================================

function ManifestResult({ result }) {
  const manifestItems = Array.isArray(
    result.manifestItems
  )
    ? result.manifestItems
    : [];

  const manifestStatus =
    result.shippingManifestStatus || {};

  const failedPackages =
    Array.isArray(
      manifestStatus.failedShippingPackages
    )
      ? manifestStatus.failedShippingPackages
      : [];

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Manifest Result</h3>

      {/* Overall status */}
      <div
        style={{
          padding: "18px",
          borderRadius: "9px",
          background: result.successful
            ? "#f0fdf4"
            : "#fef2f2",
          border: `1px solid ${
            result.successful
              ? "#bbf7d0"
              : "#fecaca"
          }`,
        }}
      >
        <div>
          <strong>Request: </strong>

          <span
            style={{
              color: result.successful
                ? "#15803d"
                : "#b91c1c",
              fontWeight: 700,
            }}
          >
            {result.successful
              ? "SUCCESS"
              : "FAILED"}
          </span>
        </div>

        <div style={{ marginTop: "8px" }}>
          <strong>Message:</strong>{" "}
          {result.message || "N/A"}
        </div>
      </div>

      {/* Manifest summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginTop: "20px",
        }}
      >
        <ResultCard
          label="Manifest ID"
          value={result.shippingManifestId}
        />

        <ResultCard
          label="Manifest Code"
          value={
            result.shippingManifestCode
          }
        />

        <ResultCard
          label="Packages"
          value={manifestItems.length}
        />

        <ResultCard
          label="Manifest Status"
          value={
            manifestStatus.currentStatus
          }
        />

        <ResultCard
          label="Completed"
          value={
            manifestStatus.completed ===
            undefined
              ? "N/A"
              : manifestStatus.completed
                ? "Yes"
                : "No"
          }
        />

        <ResultCard
          label="Status Successful"
          value={
            manifestStatus.successful ===
            undefined
              ? "N/A"
              : manifestStatus.successful
                ? "Yes"
                : "No"
          }
        />

        <ResultCard
          label="Progress"
          value={
            manifestStatus.percentageComplete ===
            undefined
              ? "N/A"
              : `${manifestStatus.percentageComplete}%`
          }
        />

        <ResultCard
          label="Milestone"
          value={
            manifestStatus.currentMileStone ===
              undefined ||
            manifestStatus.mileStoneCount ===
              undefined
              ? "N/A"
              : `${manifestStatus.currentMileStone} / ${manifestStatus.mileStoneCount}`
          }
        />
      </div>

      {/* Manifest link */}
      {manifestStatus.shippingManifestLink && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
          }}
        >
          <strong>
            Shipping Manifest Link:
          </strong>{" "}
          <a
            href={
              manifestStatus.shippingManifestLink
            }
            target="_blank"
            rel="noreferrer"
          >
            Open Manifest
          </a>
        </div>
      )}

      {/* Manifest items */}
      {manifestItems.length > 0 && (
        <div style={{ marginTop: "25px" }}>
          <h4>Manifest Items</h4>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth: "1200px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Package
                  </th>
                  <th style={thStyle}>
                    Status
                  </th>
                  <th style={thStyle}>
                    Invoice
                  </th>
                  <th style={thStyle}>
                    Tracking
                  </th>
                  <th style={thStyle}>
                    Qty
                  </th>
                  <th style={thStyle}>
                    Boxes
                  </th>
                  <th style={thStyle}>
                    Weight
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
                    Order
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
                  (item, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>
                        {item.shippingPackageCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.shippingPackageStatusCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.invoiceDisplayCode ||
                          item.invoiceCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.trackingNumber ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.quantity ??
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.noOfBoxes ??
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.weight ??
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.totalAmount ??
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.shippingCharges ??
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.collectableAmount ??
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.displayOrderCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.cashOnDelivery ===
                        undefined
                          ? "N/A"
                          : item.cashOnDelivery
                            ? "Yes"
                            : "No"}
                      </td>

                      <td style={tdStyle}>
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

          {/* Item details */}
          {manifestItems.map(
            (item, index) => (
              <PackageDetails
                key={index}
                item={item}
                index={index}
              />
            )
          )}
        </div>
      )}

      {/* Failed packages */}
      {failedPackages.length > 0 && (
        <div
          style={{
            marginTop: "22px",
            padding: "18px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
          }}
        >
          <h4
            style={{
              marginTop: 0,
            }}
          >
            Failed Shipping Packages
          </h4>

          {failedPackages.map(
            (item, index) => (
              <div
                key={index}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    "1px solid #fee2e2",
                }}
              >
                <strong>
                  {item.code ||
                    "Unknown Package"}
                </strong>

                <div>
                  Sale Order:{" "}
                  {item.saleOrderCode ||
                    "N/A"}
                </div>

                <div>
                  Failure Reason:{" "}
                  {item.failureReason ||
                    "N/A"}
                </div>

                <div>
                  Cancelled:{" "}
                  {item.cancelled
                    ? "Yes"
                    : "No"}
                </div>
              </div>
            )
          )}

          {manifestStatus.failedShipmentsBatchCode && (
            <div
              style={{
                marginTop: "12px",
              }}
            >
              <strong>
                Failed Shipment Batch:
              </strong>{" "}
              {
                manifestStatus.failedShipmentsBatchCode
              }
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {Array.isArray(result.errors) &&
        result.errors.length > 0 && (
          <div
            style={{
              marginTop: "22px",
              padding: "18px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                marginTop: 0,
              }}
            >
              Uniware Errors
            </h4>

            {result.errors.map(
              (item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "12px",
                    paddingBottom:
                      "12px",
                    borderBottom:
                      "1px solid #fee2e2",
                  }}
                >
                  <div>
                    <strong>
                      Code:
                    </strong>{" "}
                    {item.code ?? "N/A"}
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
      {Array.isArray(result.warnings) &&
        result.warnings.length > 0 && (
          <div
            style={{
              marginTop: "22px",
              padding: "18px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                marginTop: 0,
              }}
            >
              Uniware Warnings
            </h4>

            {result.warnings.map(
              (item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "8px",
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

      {/* Raw */}
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
// Package details
// ============================================================

function PackageDetails({
  item,
  index,
}) {
  const address =
    item.shippingAddress || {};

  const packageType =
    item.shippingPackageType || {};

  const lineItems = Array.isArray(
    item.manifestLineItems
  )
    ? item.manifestLineItems
    : [];

  return (
    <details
      style={{
        marginTop: "15px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "14px",
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
      <div style={{ marginTop: "18px" }}>
        <h4>Shipping Address</h4>

        <div style={gridStyle}>
          <ResultCard
            label="Name"
            value={address.name}
          />

          <ResultCard
            label="Address Line 1"
            value={address.addressLine1}
          />

          <ResultCard
            label="Address Line 2"
            value={address.addressLine2}
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
      <div style={{ marginTop: "20px" }}>
        <h4>Package Type</h4>

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
      {lineItems.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Manifest Line Items</h4>

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
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Line Identifier
                  </th>

                  <th style={thStyle}>
                    Item
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
                      <td style={tdStyle}>
                        {
                          lineItem.lineItemIdentifier
                        }
                      </td>

                      <td style={tdStyle}>
                        {
                          lineItem.itemName
                        }
                      </td>

                      <td style={tdStyle}>
                        {
                          lineItem.sellerSkuCode
                        }
                      </td>

                      <td style={tdStyle}>
                        {lineItem.quantity ??
                          0}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
// Styles
// ============================================================

const sectionStyle = {
  marginBottom: "24px",
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
  background: "#fff",
  fontSize: "14px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "14px",
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
  padding: "9px 13px",
  border:
    "1px solid #dc2626",
  borderRadius: "6px",
  background: "#fff",
  color: "#dc2626",
  cursor: "pointer",
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

export default CreateCompleteManifest;