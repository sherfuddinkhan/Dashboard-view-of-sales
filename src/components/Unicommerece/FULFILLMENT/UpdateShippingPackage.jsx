import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const createCustomField = () => ({
  name: "",
  value: "",
});

const INITIAL_FORM = {
  facility: "MAIN",
  shippingPackageCode: "",
  shippingProviderCode: "",
  trackingNumber: "",
  shippingPackageTypeCode: "",
  forcedCancelOnCourier: "",
  actualWeight: "",
  length: "",
  width: "",
  height: "",
  noOfBoxes: "",
  customFieldValues: [createCustomField()],
};

function UpdateShippingPackage() {
  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCustomField = (
    index,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      customFieldValues:
        prev.customFieldValues.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  };

  const addCustomField = () => {
    setForm((prev) => ({
      ...prev,
      customFieldValues: [
        ...prev.customFieldValues,
        createCustomField(),
      ],
    }));
  };

  const removeCustomField = (index) => {
    setForm((prev) => {
      const fields =
        prev.customFieldValues.filter(
          (_, itemIndex) =>
            itemIndex !== index
        );

      return {
        ...prev,
        customFieldValues:
          fields.length > 0
            ? fields
            : [createCustomField()],
      };
    });
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setResponse(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    const facility = form.facility.trim();
    const shippingPackageCode =
      form.shippingPackageCode.trim();

    if (!facility) {
      setError("Facility code is required.");
      return;
    }

    if (!shippingPackageCode) {
      setError(
        "Shipping package code is required."
      );
      return;
    }

    // --------------------------------------------------------
    // Validate numeric fields
    // --------------------------------------------------------
    const numericFields = [
      ["actualWeight", form.actualWeight],
      ["noOfBoxes", form.noOfBoxes],
    ];

    for (const [field, value] of numericFields) {
      if (value === "") continue;

      const number = Number(value);

      if (
        !Number.isInteger(number) ||
        number < 0
      ) {
        setError(
          `${field} must be a non-negative integer.`
        );
        return;
      }
    }

    // --------------------------------------------------------
    // Shipping box validation
    // If one dimension is supplied, require all three
    // --------------------------------------------------------
    const hasAnyDimension =
      form.length !== "" ||
      form.width !== "" ||
      form.height !== "";

    if (hasAnyDimension) {
      if (
        form.length === "" ||
        form.width === "" ||
        form.height === ""
      ) {
        setError(
          "Length, width and height are all required when shipping box details are supplied."
        );
        return;
      }

      const dimensions = [
        ["length", form.length],
        ["width", form.width],
        ["height", form.height],
      ];

      for (const [field, value] of dimensions) {
        const number = Number(value);

        if (
          !Number.isInteger(number) ||
          number < 0
        ) {
          setError(
            `${field} must be a non-negative integer.`
          );
          return;
        }
      }
    }

    // --------------------------------------------------------
    // Build payload
    // --------------------------------------------------------
    const payload = {
      facility,
      shippingPackageCode,
    };

    if (form.shippingProviderCode.trim()) {
      payload.shippingProviderCode =
        form.shippingProviderCode.trim();
    }

    if (form.trackingNumber.trim()) {
      payload.trackingNumber =
        form.trackingNumber.trim();
    }

    if (
      form.shippingPackageTypeCode.trim()
    ) {
      payload.shippingPackageTypeCode =
        form.shippingPackageTypeCode.trim();
    }

    if (form.forcedCancelOnCourier !== "") {
      payload.forcedCancelOnCourier =
        form.forcedCancelOnCourier === "true";
    }

    if (form.actualWeight !== "") {
      payload.actualWeight = Number(
        form.actualWeight
      );
    }

    if (form.noOfBoxes !== "") {
      payload.noOfBoxes = Number(
        form.noOfBoxes
      );
    }

    if (hasAnyDimension) {
      payload.shippingBox = {
        length: Number(form.length),
        width: Number(form.width),
        height: Number(form.height),
      };
    }

    const customFields =
      form.customFieldValues
        .filter((field) => field.name.trim())
        .map((field) => {
          const item = {
            name: field.name.trim(),
          };

          if (field.value.trim()) {
            item.value =
              field.value.trim();
          }

          return item;
        });

    if (customFields.length > 0) {
      payload.customFieldValues =
        customFields;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/update`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResponse(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to update shipping package."
      );
    } finally {
      setLoading(false);
    }
  };

  const errors = Array.isArray(response?.errors)
    ? response.errors
    : [];

  const warnings = Array.isArray(response?.warnings)
    ? response.warnings
    : [];

  const packageData =
    response?.shippingPackageFullDTO;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  return (
    <div
      style={{
        maxWidth: "1450px",
        margin: "30px auto",
        padding: "0 20px 50px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ marginBottom: "25px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
          }}
        >
          Update Shipping Package
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: "8px",
          }}
        >
          Update shipping provider, tracking
          number, package dimensions, weight,
          boxes and custom fields in Uniware.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={cardStyle}
      >
        <h2 style={sectionHeadingStyle}>
          Shipping Package Details
        </h2>

        <div style={gridStyle}>
          <Field
            label="Facility Code *"
            value={form.facility}
            onChange={(value) =>
              updateField("facility", value)
            }
            placeholder="MAIN"
          />

          <Field
            label="Shipping Package Code *"
            value={
              form.shippingPackageCode
            }
            onChange={(value) =>
              updateField(
                "shippingPackageCode",
                value
              )
            }
            placeholder="SP000123"
          />

          <Field
            label="Shipping Provider Code"
            value={
              form.shippingProviderCode
            }
            onChange={(value) =>
              updateField(
                "shippingProviderCode",
                value
              )
            }
            placeholder="DELHIVERY"
          />

          <Field
            label="Tracking Number"
            value={form.trackingNumber}
            onChange={(value) =>
              updateField(
                "trackingNumber",
                value
              )
            }
            placeholder="Tracking number"
          />

          <Field
            label="Shipping Package Type Code"
            value={
              form.shippingPackageTypeCode
            }
            onChange={(value) =>
              updateField(
                "shippingPackageTypeCode",
                value
              )
            }
            placeholder="BOX"
          />

          <SelectField
            label="Forced Cancel On Courier"
            value={
              form.forcedCancelOnCourier
            }
            onChange={(value) =>
              updateField(
                "forcedCancelOnCourier",
                value
              )
            }
          />

          <Field
            label="Actual Weight (gm)"
            type="number"
            min="0"
            value={form.actualWeight}
            onChange={(value) =>
              updateField(
                "actualWeight",
                value
              )
            }
            placeholder="1000"
          />

          <Field
            label="No. Of Boxes"
            type="number"
            min="0"
            value={form.noOfBoxes}
            onChange={(value) =>
              updateField(
                "noOfBoxes",
                value
              )
            }
            placeholder="1"
          />
        </div>

        <h2 style={sectionHeadingStyle}>
          Shipping Box Dimensions
        </h2>

        <p style={helpTextStyle}>
          Dimensions are in millimetres. If
          shipping box details are supplied,
          length, width and height are all
          required.
        </p>

        <div style={gridStyle}>
          <Field
            label="Length (mm)"
            type="number"
            min="0"
            value={form.length}
            onChange={(value) =>
              updateField(
                "length",
                value
              )
            }
            placeholder="300"
          />

          <Field
            label="Width (mm)"
            type="number"
            min="0"
            value={form.width}
            onChange={(value) =>
              updateField(
                "width",
                value
              )
            }
            placeholder="200"
          />

          <Field
            label="Height (mm)"
            type="number"
            min="0"
            value={form.height}
            onChange={(value) =>
              updateField(
                "height",
                value
              )
            }
            placeholder="150"
          />
        </div>

        <h2 style={sectionHeadingStyle}>
          Custom Fields
        </h2>

        {form.customFieldValues.map(
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
              <Field
                label={`Field Name ${
                  index + 1
                }`}
                value={field.name}
                onChange={(value) =>
                  updateCustomField(
                    index,
                    "name",
                    value
                  )
                }
                placeholder="ReferenceNumber"
              />

              <Field
                label="Value"
                value={field.value}
                onChange={(value) =>
                  updateCustomField(
                    index,
                    "value",
                    value
                  )
                }
                placeholder="ABC123"
              />

              <button
                type="button"
                onClick={() =>
                  removeCustomField(
                    index
                  )
                }
                style={
                  dangerButtonStyle
                }
              >
                Remove
              </button>
            </div>
          )
        )}

        <button
          type="button"
          onClick={addCustomField}
          style={secondaryButtonStyle}
        >
          + Add Custom Field
        </button>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px 15px",
              background: "#ffebee",
              border:
                "1px solid #ef9a9a",
              color: "#b71c1c",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "25px",
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
              : "Update Shipping Package"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            style={secondaryButtonStyle}
          >
            Reset
          </button>
        </div>
      </form>

      {response && (
        <div style={{ marginTop: "28px" }}>
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              background:
                response.successful
                  ? "#e8f5e9"
                  : "#ffebee",
              border:
                "1px solid " +
                (response.successful
                  ? "#a5d6a7"
                  : "#ef9a9a"),
              marginBottom: "20px",
            }}
          >
            <strong
              style={{
                fontSize: "17px",
              }}
            >
              {response.successful
                ? "Update Successful"
                : "Update Failed"}
            </strong>

            {response.message && (
              <div
                style={{
                  marginTop: "7px",
                }}
              >
                {response.message}
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <ResponseList
              title="Errors"
              items={errors}
              background="#ffebee"
            />
          )}

          {warnings.length > 0 && (
            <ResponseList
              title="Warnings"
              items={warnings}
              background="#fff8e1"
            />
          )}

          {packageData && (
            <ShippingPackageDetails
              data={packageData}
              formatDate={formatDate}
            />
          )}

          <details
            style={{
              marginTop: "24px",
              background: "#f8f9fa",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Raw API Response
            </summary>

            <pre
              style={{
                marginTop: "15px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflow: "auto",
              }}
            >
              {JSON.stringify(
                response,
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

function ShippingPackageDetails({
  data,
  formatDate,
}) {
  const items = Array.isArray(
    data.shippingPackageItems
  )
    ? data.shippingPackageItems
    : [];

  return (
    <div style={cardStyle}>
      <h2 style={sectionHeadingStyle}>
        Updated Shipping Package
      </h2>

      <div style={gridStyle}>
        <Info
          label="Package Code"
          value={data.code}
        />

        <Info
          label="Shipping Provider"
          value={
            data.shippingProviderCode
          }
        />

        <Info
          label="Shipping Method"
          value={
            data.shippingMethodCode
          }
        />

        <Info
          label="Package Type"
          value={
            data.shippingPackageType
          }
        />

        <Info
          label="Tracking Number"
          value={
            data.trackingNumber
          }
        />

        <Info
          label="Tracking Status"
          value={
            data.trackingStatus
          }
        />

        <Info
          label="Courier Status"
          value={
            data.courierStatus
          }
        />

        <Info
          label="Zone"
          value={data.zone}
        />

        <Info
          label="Estimated Weight (gm)"
          value={
            data.estimatedWeight
          }
        />

        <Info
          label="Actual Weight"
          value={
            data.actualWeight
          }
        />

        <Info
          label="Length (mm)"
          value={data.length}
        />

        <Info
          label="Width (mm)"
          value={data.width}
        />

        <Info
          label="Height (mm)"
          value={data.height}
        />

        <Info
          label="No. Of Items"
          value={data.noOfItems}
        />

        <Info
          label="No. Of Boxes"
          value={data.noOfBoxes}
        />

        <Info
          label="Order Number"
          value={data.orderNumber}
        />

        <Info
          label="Display Order Number"
          value={
            data.displayOrderNumber
          }
        />

        <Info
          label="Order Status"
          value={data.orderStatus}
        />

        <Info
          label="Invoice Code"
          value={data.invoiceCode}
        />

        <Info
          label="Invoice Display Code"
          value={
            data.invoiceDisplayCode
          }
        />

        <Info
          label="Return Invoice Code"
          value={
            data.returnInvoiceCode
          }
        />

        <Info
          label="Shipping Manifest"
          value={
            data.shippingManifestCode
          }
        />

        <Info
          label="Picklist Number"
          value={
            data.picklistNumber
          }
        />

        <Info
          label="Total Price"
          value={data.totalPrice}
        />

        <Info
          label="Collectable Amount"
          value={
            data.collectableAmount
          }
        />

        <Info
          label="Third Party Shipping"
          value={
            data.thirdPartyShipping
              ? "Yes"
              : "No"
          }
        />

        <Info
          label="Provider Editable"
          value={
            data.providerEditable
              ? "Yes"
              : "No"
          }
        />

        <Info
          label="Repackageable"
          value={
            data.repackageable
              ? "Yes"
              : "No"
          }
        />

        <Info
          label="Splittable"
          value={
            data.splittable
              ? "Yes"
              : "No"
          }
        />

        <Info
          label="Created"
          value={formatDate(
            data.created
          )}
        />

        <Info
          label="Dispatch Time"
          value={formatDate(
            data.dispatchTime
          )}
        />

        <Info
          label="Delivery Time"
          value={formatDate(
            data.deliveryTime
          )}
        />
      </div>

      {data.shippingAddress && (
        <>
          <h3
            style={{
              marginTop: "28px",
              borderBottom:
                "1px solid #ddd",
              paddingBottom: "8px",
            }}
          >
            Shipping Address
          </h3>

          <div style={gridStyle}>
            <Info
              label="Name"
              value={
                data.shippingAddress
                  .name
              }
            />

            <Info
              label="Address"
              value={
                data.shippingAddress
                  .addressLine1
              }
            />

            <Info
              label="Address Line 2"
              value={
                data.shippingAddress
                  .addressLine2
              }
            />

            <Info
              label="City"
              value={
                data.shippingAddress
                  .city
              }
            />

            <Info
              label="State"
              value={
                data.shippingAddress
                  .state
              }
            />

            <Info
              label="Pincode"
              value={
                data.shippingAddress
                  .pincode
              }
            />

            <Info
              label="Phone"
              value={
                data.shippingAddress
                  .phone
              }
            />
          </div>
        </>
      )}

      {items.length > 0 && (
        <>
          <h3
            style={{
              marginTop: "28px",
              borderBottom:
                "1px solid #ddd",
              paddingBottom: "8px",
            }}
          >
            Shipping Package Items
          </h3>

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
                minWidth: "1000px",
              }}
            >
              <thead>
                <tr>
                  {[
                    "SO Item Code",
                    "Item SKU",
                    "Item Name",
                    "Item Code",
                    "Shelf",
                    "Status",
                    "On Hold",
                    "Gift Wrap",
                    "Gift Message",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={
                        tableHeaderStyle
                      }
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (item, index) => (
                    <tr
                      key={
                        item.saleOrderItemCode ||
                        item.code ||
                        index
                      }
                    >
                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          item.saleOrderItemCode
                        }
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {item.itemSku}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {item.itemName}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {item.itemCode}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {item.shelfCode}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {item.statusCode}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {item.onHold
                          ? "Yes"
                          : "No"}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {item.giftWrap
                          ? "Yes"
                          : "No"}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {item.giftMessage ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
      }}
    >
      <span
        style={{
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        min={min}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={inputStyle}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
      }}
    >
      <span
        style={{
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={inputStyle}
      >
        <option value="">
          Not specified
        </option>
        <option value="true">
          True
        </option>
        <option value="false">
          False
        </option>
      </select>
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div
      style={{
        padding: "12px",
        background: "#f8f9fa",
        border: "1px solid #e5e5e5",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#666",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: "600",
          wordBreak: "break-word",
        }}
      >
        {value !== undefined &&
        value !== null &&
        value !== ""
          ? String(value)
          : "-"}
      </div>
    </div>
  );
}

function ResponseList({
  title,
  items,
  background,
}) {
  return (
    <div
      style={{
        background,
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "18px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        {title}
      </h3>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            padding: "9px 0",
            borderBottom:
              index <
              items.length - 1
                ? "1px solid #ddd"
                : "none",
          }}
        >
          <strong>
            {item.fieldName ||
              `#${index + 1}`}
          </strong>

          {item.message && (
            <div>{item.message}</div>
          )}

          {item.description && (
            <div
              style={{
                color: "#666",
                fontSize: "13px",
              }}
            >
              {item.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "24px",
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.05)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  background: "#fff",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: "6px",
  padding: "11px 20px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryButtonStyle = {
  border: "1px solid #bbb",
  borderRadius: "6px",
  padding: "11px 20px",
  background: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const dangerButtonStyle = {
  border: "1px solid #d32f2f",
  borderRadius: "6px",
  padding: "10px 14px",
  background: "#fff",
  color: "#d32f2f",
  cursor: "pointer",
  fontWeight: "600",
};

const tableHeaderStyle = {
  padding: "11px 12px",
  borderBottom: "1px solid #ddd",
  background: "#f5f5f5",
  textAlign: "left",
  whiteSpace: "nowrap",
  fontSize: "13px",
};

const tableCellStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
  fontSize: "13px",
};

const sectionHeadingStyle = {
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "20px",
};

const helpTextStyle = {
  color: "#666",
  fontSize: "13px",
  marginTop: "-8px",
  marginBottom: "18px",
};

export default UpdateShippingPackage;