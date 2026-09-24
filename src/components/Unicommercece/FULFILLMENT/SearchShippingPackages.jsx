import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const INITIAL_FORM = {
  facility: "MAIN",

  shippingPackageCode: "",
  saleOrderCode: "",
  channelCode: "",

  statuses: "",

  createStart: "",
  createEnd: "",
  createTextRange: "",

  dispatchStart: "",
  dispatchEnd: "",
  dispatchTextRange: "",

  containsCancelledItems: "",
  onHold: "",

  shippingProvider: "",
  shippingMethod: "",
  trackingNumber: "",
  invoiceCode: "",

  cashOnDelivery: "",
  paymentReconciled: "",

  itemTypeSkuCode: "",
  updatedSinceInMinutes: "",

  searchKey: "",
  displayLength: 20,
  displayStart: 0,
  sortDirection: "",
  columnNames: "",
  getCount: true,
};

function SearchShippingPackages() {
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

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setResponse(null);
    setError("");
  };

  const toIsoDate = (value) => {
    if (!value) return undefined;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date.toISOString();
  };

  const buildDateRange = (start, end, textRange) => {
    const range = {};

    if (start) {
      const value = toIsoDate(start);

      if (value) {
        range.start = value;
      }
    }

    if (end) {
      const value = toIsoDate(end);

      if (value) {
        range.end = value;
      }
    }

    if (textRange) {
      range.textRange = textRange;
    }

    return Object.keys(range).length > 0 ? range : undefined;
  };

  const buildBoolean = (value) => {
    if (value === "") return undefined;

    return value === "true";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    const facility = form.facility.trim();
    const shippingPackageCode = form.shippingPackageCode.trim();
    const saleOrderCode = form.saleOrderCode.trim();

    if (!facility) {
      setError("Facility code is required.");
      return;
    }

    if (!shippingPackageCode && !saleOrderCode) {
      setError(
        "Enter either Shipping Package Code or Sale Order Code."
      );
      return;
    }

    if (
      form.createStart &&
      form.createEnd &&
      new Date(form.createStart) > new Date(form.createEnd)
    ) {
      setError(
        "Create Time start must be before or equal to end."
      );
      return;
    }

    if (
      form.dispatchStart &&
      form.dispatchEnd &&
      new Date(form.dispatchStart) >
        new Date(form.dispatchEnd)
    ) {
      setError(
        "Dispatch Time start must be before or equal to end."
      );
      return;
    }

    if (form.updatedSinceInMinutes !== "") {
      const minutes = Number(form.updatedSinceInMinutes);

      if (!Number.isInteger(minutes) || minutes < 0) {
        setError(
          "Updated Since In Minutes must be a non-negative integer."
        );
        return;
      }
    }

    const payload = {
      facility,
    };

    if (shippingPackageCode) {
      payload.shippingPackageCode = shippingPackageCode;
    }

    if (saleOrderCode) {
      payload.saleOrderCode = saleOrderCode;
    }

    if (form.channelCode.trim()) {
      payload.channelCode = form.channelCode.trim();
    }

    const statusList = form.statuses
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (statusList.length > 0) {
      payload.statuses = statusList;
    }

    const createTime = buildDateRange(
      form.createStart,
      form.createEnd,
      form.createTextRange
    );

    if (createTime) {
      payload.createTime = createTime;
    }

    const dispatchTime = buildDateRange(
      form.dispatchStart,
      form.dispatchEnd,
      form.dispatchTextRange
    );

    if (dispatchTime) {
      payload.dispatchTime = dispatchTime;
    }

    const booleanFields = [
      "containsCancelledItems",
      "onHold",
      "cashOnDelivery",
      "paymentReconciled",
    ];

    booleanFields.forEach((field) => {
      const value = buildBoolean(form[field]);

      if (value !== undefined) {
        payload[field] = value;
      }
    });

    if (form.shippingProvider.trim()) {
      payload.shippingProvider =
        form.shippingProvider.trim();
    }

    if (form.shippingMethod.trim()) {
      payload.shippingMethod =
        form.shippingMethod.trim();
    }

    if (form.trackingNumber.trim()) {
      payload.trackingNumber =
        form.trackingNumber.trim();
    }

    if (form.invoiceCode.trim()) {
      payload.invoiceCode = form.invoiceCode.trim();
    }

    if (form.itemTypeSkuCode.trim()) {
      payload.itemTypeSkuCode =
        form.itemTypeSkuCode.trim();
    }

    if (form.updatedSinceInMinutes !== "") {
      payload.updatedSinceInMinutes = Number(
        form.updatedSinceInMinutes
      );
    }

    const searchOptions = {};

    if (form.searchKey.trim()) {
      searchOptions.searchKey = form.searchKey.trim();
    }

    if (form.displayLength !== "") {
      searchOptions.displayLength = Number(
        form.displayLength
      );
    }

    if (form.displayStart !== "") {
      searchOptions.displayStart = Number(
        form.displayStart
      );
    }

    if (form.sortDirection.trim()) {
      searchOptions.sortDirection =
        form.sortDirection.trim();
    }

    if (form.columnNames.trim()) {
      searchOptions.columnNames =
        form.columnNames.trim();
    }

    searchOptions.getCount = form.getCount;

    if (Object.keys(searchOptions).length > 0) {
      payload.searchOptions = searchOptions;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/search`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResponse(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to search shipping packages."
      );
    } finally {
      setLoading(false);
    }
  };

  const elements = Array.isArray(response?.elements)
    ? response.elements
    : [];

  const errors = Array.isArray(response?.errors)
    ? response.errors
    : [];

  const warnings = Array.isArray(response?.warnings)
    ? response.warnings
    : [];

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const getItemList = (items) => {
    if (!items || typeof items !== "object") {
      return [];
    }

    return Object.entries(items).map(
      ([key, item]) => ({
        key,
        ...item,
      })
    );
  };

  return (
    <div
      style={{
        maxWidth: "1500px",
        margin: "30px auto",
        padding: "0 20px 40px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
          }}
        >
          Search Shipping Packages
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: "8px",
          }}
        >
          Search Uniware shipping package details
          using a shipping package code or sale
          order code.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "24px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "20px",
          }}
        >
          Search Criteria
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <Field
            label="Facility Code *"
            value={form.facility}
            onChange={(value) =>
              updateField("facility", value)
            }
            placeholder="MAIN"
          />

          <Field
            label="Shipping Package Code"
            value={form.shippingPackageCode}
            onChange={(value) =>
              updateField(
                "shippingPackageCode",
                value
              )
            }
            placeholder="e.g. SMP000123"
          />

          <Field
            label="Sale Order Code"
            value={form.saleOrderCode}
            onChange={(value) =>
              updateField("saleOrderCode", value)
            }
            placeholder="e.g. SO1231100023"
          />

          <Field
            label="Channel Code"
            value={form.channelCode}
            onChange={(value) =>
              updateField("channelCode", value)
            }
            placeholder="AMAZON"
          />

          <Field
            label="Shipping Provider"
            value={form.shippingProvider}
            onChange={(value) =>
              updateField(
                "shippingProvider",
                value
              )
            }
            placeholder="DELHIVERY"
          />

          <Field
            label="Shipping Method"
            value={form.shippingMethod}
            onChange={(value) =>
              updateField(
                "shippingMethod",
                value
              )
            }
            placeholder="STD"
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
            label="Invoice Code"
            value={form.invoiceCode}
            onChange={(value) =>
              updateField("invoiceCode", value)
            }
            placeholder="Invoice code"
          />

          <Field
            label="Item Type SKU Code"
            value={form.itemTypeSkuCode}
            onChange={(value) =>
              updateField(
                "itemTypeSkuCode",
                value
              )
            }
            placeholder="SKU"
          />

          <Field
            label="Statuses"
            value={form.statuses}
            onChange={(value) =>
              updateField("statuses", value)
            }
            placeholder="PACKED,DISPATCHED"
          />

          <SelectField
            label="Contains Cancelled Items"
            value={form.containsCancelledItems}
            onChange={(value) =>
              updateField(
                "containsCancelledItems",
                value
              )
            }
          />

          <SelectField
            label="On Hold"
            value={form.onHold}
            onChange={(value) =>
              updateField("onHold", value)
            }
          />

          <SelectField
            label="Cash On Delivery"
            value={form.cashOnDelivery}
            onChange={(value) =>
              updateField(
                "cashOnDelivery",
                value
              )
            }
          />

          <SelectField
            label="Payment Reconciled"
            value={form.paymentReconciled}
            onChange={(value) =>
              updateField(
                "paymentReconciled",
                value
              )
            }
          />

          <Field
            label="Updated Since (Minutes)"
            type="number"
            value={form.updatedSinceInMinutes}
            onChange={(value) =>
              updateField(
                "updatedSinceInMinutes",
                value
              )
            }
            placeholder="0"
          />
        </div>

        <SectionTitle>
          Create Time
        </SectionTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <Field
            label="Start"
            type="datetime-local"
            value={form.createStart}
            onChange={(value) =>
              updateField("createStart", value)
            }
          />

          <Field
            label="End"
            type="datetime-local"
            value={form.createEnd}
            onChange={(value) =>
              updateField("createEnd", value)
            }
          />

          <SelectField
            label="Preset Range"
            value={form.createTextRange}
            onChange={(value) =>
              updateField(
                "createTextRange",
                value
              )
            }
            options={[
              ["", "None"],
              ["TODAY", "TODAY"],
            ]}
          />
        </div>

        <SectionTitle>
          Dispatch Time
        </SectionTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <Field
            label="Start"
            type="datetime-local"
            value={form.dispatchStart}
            onChange={(value) =>
              updateField(
                "dispatchStart",
                value
              )
            }
          />

          <Field
            label="End"
            type="datetime-local"
            value={form.dispatchEnd}
            onChange={(value) =>
              updateField(
                "dispatchEnd",
                value
              )
            }
          />

          <SelectField
            label="Preset Range"
            value={form.dispatchTextRange}
            onChange={(value) =>
              updateField(
                "dispatchTextRange",
                value
              )
            }
            options={[
              ["", "None"],
              ["TODAY", "TODAY"],
            ]}
          />
        </div>

        <SectionTitle>
          Search Options
        </SectionTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <Field
            label="Search Key"
            value={form.searchKey}
            onChange={(value) =>
              updateField("searchKey", value)
            }
            placeholder="Search keyword"
          />

          <Field
            label="Display Length"
            type="number"
            value={form.displayLength}
            onChange={(value) =>
              updateField(
                "displayLength",
                value
              )
            }
          />

          <Field
            label="Display Start"
            type="number"
            value={form.displayStart}
            onChange={(value) =>
              updateField(
                "displayStart",
                value
              )
            }
          />

          <Field
            label="Sort Direction"
            value={form.sortDirection}
            onChange={(value) =>
              updateField(
                "sortDirection",
                value
              )
            }
            placeholder="asc / desc"
          />

          <Field
            label="Column Names"
            value={form.columnNames}
            onChange={(value) =>
              updateField(
                "columnNames",
                value
              )
            }
            placeholder="code,saleOrderCode,status"
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "25px",
            }}
          >
            <input
              type="checkbox"
              checked={form.getCount}
              onChange={(event) =>
                updateField(
                  "getCount",
                  event.target.checked
                )
              }
            />
            Get Count
          </label>
        </div>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#ffebee",
              border: "1px solid #ef9a9a",
              borderRadius: "6px",
              color: "#b71c1c",
            }}
          >
            {error}
          </div>
        )}

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
            style={buttonStyle}
          >
            {loading
              ? "Searching..."
              : "Search Shipping Packages"}
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
              background:
                response.successful
                  ? "#e8f5e9"
                  : "#ffebee",
              border: "1px solid",
              borderColor:
                response.successful
                  ? "#a5d6a7"
                  : "#ef9a9a",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <strong>
              {response.successful
                ? "Search Successful"
                : "Search Failed"}
            </strong>

            {response.message && (
              <div style={{ marginTop: "6px" }}>
                {response.message}
              </div>
            )}

            <div
              style={{
                marginTop: "8px",
                fontSize: "14px",
              }}
            >
              Total Records:{" "}
              <strong>
                {response.totalRecords ?? 0}
              </strong>
            </div>
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

          {elements.length > 0 && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                overflow: "auto",
              }}
            >
              <h2
                style={{
                  padding: "18px",
                  margin: 0,
                  borderBottom:
                    "1px solid #ddd",
                  fontSize: "20px",
                }}
              >
                Shipping Packages
              </h2>

              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth: "1400px",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Package Code",
                      "Sale Order",
                      "Channel",
                      "Status",
                      "Package Type",
                      "Provider",
                      "Method",
                      "Tracking",
                      "Tracking Status",
                      "Courier Status",
                      "Est. Weight (gm)",
                      "Actual Weight",
                      "Customer",
                      "City",
                      "Items",
                      "Collectable",
                      "Collected",
                      "Payment Reconciled",
                      "Invoice",
                      "Invoice Code",
                      "Invoice Display",
                      "Return Invoice",
                      "POD",
                      "Manifest",
                      "Created",
                      "Updated",
                      "Dispatched",
                      "Delivered",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={tableHeaderStyle}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {elements.map(
                    (item, index) => (
                      <React.Fragment
                        key={
                          item.code ||
                          index
                        }
                      >
                        <tr>
                          <td style={tableCellStyle}>
                            {item.code ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.saleOrderCode ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.channel ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.status ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.shippingPackageType ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.shippingProvider ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.shippingMethod ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.trackingNumber ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.trackingStatus ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.courierStatus ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.estimatedWeight ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.actualWeight ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.customer ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.city || "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.noOfItems ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.collectableAmount ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.collectedAmount ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.paymentReconciled
                              ? "Yes"
                              : "No"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.invoice ?? "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.invoiceCode ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.invoiceDisplayCode ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.returnInvoiceDisplayCode ||
                              item.returnInvoiceCode ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.podCode ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.shippingManifestCode ||
                              "-"}
                          </td>

                          <td style={tableCellStyle}>
                            {formatDate(
                              item.created
                            )}
                          </td>

                          <td style={tableCellStyle}>
                            {formatDate(
                              item.updated
                            )}
                          </td>

                          <td style={tableCellStyle}>
                            {formatDate(
                              item.dispatched
                            )}
                          </td>

                          <td style={tableCellStyle}>
                            {formatDate(
                              item.delivered
                            )}
                          </td>
                        </tr>

                        {getItemList(
                          item.items
                        ).map(
                          (
                            packageItem
                          ) => (
                            <tr
                              key={`${item.code}-${packageItem.key}`}
                              style={{
                                background:
                                  "#fafafa",
                              }}
                            >
                              <td
                                colSpan={2}
                                style={{
                                  ...tableCellStyle,
                                  textAlign:
                                    "right",
                                  fontWeight:
                                    "bold",
                                }}
                              >
                                Item
                              </td>

                              <td
                                colSpan={4}
                                style={
                                  tableCellStyle
                                }
                              >
                                SKU:{" "}
                                {packageItem.itemSku ||
                                  "-"}
                              </td>

                              <td
                                colSpan={7}
                                style={
                                  tableCellStyle
                                }
                              >
                                Name:{" "}
                                {packageItem.itemName ||
                                  "-"}
                              </td>

                              <td
                                colSpan={3}
                                style={
                                  tableCellStyle
                                }
                              >
                                Qty:{" "}
                                {packageItem.quantity ??
                                  0}
                              </td>

                              <td
                                colSpan={4}
                                style={
                                  tableCellStyle
                                }
                              >
                                Image:{" "}
                                {packageItem.itemTypeImageUrl
                                  ? "Available"
                                  : "-"}
                              </td>

                              <td
                                colSpan={4}
                                style={
                                  tableCellStyle
                                }
                              >
                                Page:{" "}
                                {packageItem.itemTypePageUrl
                                  ? "Available"
                                  : "-"}
                              </td>
                            </tr>
                          )
                        )}
                      </React.Fragment>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {elements.length === 0 &&
            response.successful && (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  background: "#fafafa",
                  borderRadius: "8px",
                  border:
                    "1px solid #ddd",
                }}
              >
                No shipping packages found.
              </div>
            )}

          <details
            style={{
              marginTop: "24px",
              background: "#f8f9fa",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Raw API Response
            </summary>

            <pre
              style={{
                marginTop: "15px",
                overflow: "auto",
                whiteSpace:
                  "pre-wrap",
                wordBreak:
                  "break-word",
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
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
  options,
}) {
  const selectOptions = options || [
    ["", "Any"],
    ["true", "True"],
    ["false", "False"],
  ];

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
        {selectOptions.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function SectionTitle({ children }) {
  return (
    <h3
      style={{
        marginTop: "28px",
        marginBottom: "16px",
        paddingBottom: "8px",
        borderBottom: "1px solid #ddd",
      }}
    >
      {children}
    </h3>
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
      <h3
        style={{
          marginTop: 0,
        }}
      >
        {title}
      </h3>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            padding: "8px 0",
            borderBottom:
              index < items.length - 1
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
                fontSize: "13px",
                color: "#666",
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

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  background: "#fff",
};

const buttonStyle = {
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

const tableHeaderStyle = {
  padding: "12px",
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

export default SearchShippingPackages;