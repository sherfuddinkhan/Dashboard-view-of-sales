import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateInvoiceAndAllocateShippingProvider() {
  const [form, setForm] = useState({
    shippingPackageCode: "",
    irn: "",
    ackNo: "",
    ackDate: "",
    signedInvoice: "",
    signedQrCode: "",
    fetchInvoiceDetail: false,
  });

  const [taxes, setTaxes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addTax = () => {
    setTaxes((prev) => [
      ...prev,
      {
        channelProductId: "",
        additionalInfo: "",
        taxPercentage: "",
        centralGst: "",
        stateGst: "",
        unionTerritoryGst: "",
        integratedGst: "",
        compensationCess: "",
        customFieldValues: [],
      },
    ]);
  };

  const removeTax = (index) => {
    setTaxes((prev) =>
      prev.filter((_, taxIndex) => taxIndex !== index)
    );
  };

  const updateTax = (index, field, value) => {
    setTaxes((prev) =>
      prev.map((tax, taxIndex) =>
        taxIndex === index
          ? {
              ...tax,
              [field]: value,
            }
          : tax
      )
    );
  };

  const addCustomField = (taxIndex) => {
    setTaxes((prev) =>
      prev.map((tax, index) =>
        index === taxIndex
          ? {
              ...tax,
              customFieldValues: [
                ...(tax.customFieldValues || []),
                {
                  name: "",
                  value: "",
                },
              ],
            }
          : tax
      )
    );
  };

  const updateCustomField = (
    taxIndex,
    fieldIndex,
    field,
    value
  ) => {
    setTaxes((prev) =>
      prev.map((tax, index) => {
        if (index !== taxIndex) {
          return tax;
        }

        return {
          ...tax,
          customFieldValues: (
            tax.customFieldValues || []
          ).map((customField, customIndex) =>
            customIndex === fieldIndex
              ? {
                  ...customField,
                  [field]: value,
                }
              : customField
          ),
        };
      })
    );
  };

  const removeCustomField = (
    taxIndex,
    fieldIndex
  ) => {
    setTaxes((prev) =>
      prev.map((tax, index) => {
        if (index !== taxIndex) {
          return tax;
        }

        return {
          ...tax,
          customFieldValues: (
            tax.customFieldValues || []
          ).filter(
            (_, customIndex) =>
              customIndex !== fieldIndex
          ),
        };
      })
    );
  };

  const buildTaxInformation = () => {
    if (taxes.length === 0) {
      return undefined;
    }

    return {
      productTaxes: taxes.map((tax) => {
        const item = {};

        if (tax.channelProductId.trim()) {
          item.channelProductId =
            tax.channelProductId.trim();
        }

        if (tax.additionalInfo.trim()) {
          item.additionalInfo =
            tax.additionalInfo.trim();
        }

        const numericFields = [
          "taxPercentage",
          "centralGst",
          "stateGst",
          "unionTerritoryGst",
          "integratedGst",
          "compensationCess",
        ];

        numericFields.forEach((field) => {
          if (
            tax[field] !== "" &&
            tax[field] !== null &&
            tax[field] !== undefined
          ) {
            const numberValue = Number(tax[field]);

            if (Number.isFinite(numberValue)) {
              item[field] = numberValue;
            }
          }
        });

        const customFieldValues =
          (tax.customFieldValues || [])
            .filter(
              (field) => field.name.trim() !== ""
            )
            .map((field) => ({
              name: field.name.trim(),
              ...(field.value !== ""
                ? { value: field.value }
                : {}),
            }));

        if (customFieldValues.length > 0) {
          item.customFieldValues =
            customFieldValues;
        }

        return item;
      }),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const shippingPackageCode =
      form.shippingPackageCode.trim();

    if (!shippingPackageCode) {
      setError("Shipping package code is required.");
      return;
    }

    const gstFields = [
      ["IRN", form.irn],
      ["Acknowledgement Number", form.ackNo],
      ["Acknowledgement Date", form.ackDate],
      ["Signed Invoice", form.signedInvoice],
      ["Signed QR Code", form.signedQrCode],
    ];

    const missingField = gstFields.find(
      ([, value]) => !value.trim()
    );

    if (missingField) {
      setError(`${missingField[0]} is required.`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        shippingPackageCode,
        gstEinvoice: {
          irn: form.irn.trim(),
          ackNo: form.ackNo.trim(),
          ackDate: form.ackDate.trim(),
          signedInvoice: form.signedInvoice.trim(),
          signedQrCode: form.signedQrCode.trim(),
        },
        fetchInvoiceDetail: form.fetchInvoiceDetail,
      };

      const taxInformation =
        buildTaxInformation();

      if (
        taxInformation &&
        taxInformation.productTaxes.length > 0
      ) {
        payload.taxInformation =
          taxInformation;
      }

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/create-invoice-allocate-provider`,
        payload
      );

      setResult(response.data || {});
    } catch (err) {
      const responseData = err.response?.data;

      setResult(responseData || null);

      setError(
        responseData?.message ||
          responseData?.errors?.[0]?.message ||
          err.message ||
          "Failed to create invoice and allocate shipping provider."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm({
      shippingPackageCode: "",
      irn: "",
      ackNo: "",
      ackDate: "",
      signedInvoice: "",
      signedQrCode: "",
      fetchInvoiceDetail: false,
    });

    setTaxes([]);
    setResult(null);
    setError("");
  };

  const openShippingLabel = () => {
    if (!result?.shippingLabelLink) {
      return;
    }

    window.open(
      result.shippingLabelLink,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openTracking = () => {
    if (!result?.trackingLink) {
      return;
    }

    window.open(
      result.trackingLink,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const fieldStyle = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "14px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontWeight: 600,
    color: "#374151",
    fontSize: "14px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#1f2937",
            }}
          >
            Create Invoice & Allocate Shipping Provider
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            Create an invoice for a shipping package and
            allocate its configured shipping provider in
            Uniware.
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          {/* Shipping Package */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "20px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1f2937",
              }}
            >
              Shipping Package
            </h2>

            <label style={labelStyle}>
              Shipping Package Code *
            </label>

            <input
              type="text"
              name="shippingPackageCode"
              value={form.shippingPackageCode}
              onChange={handleChange}
              placeholder="SHP-00001"
              style={fieldStyle}
            />
          </div>

          {/* GST E-Invoice */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "20px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1f2937",
              }}
            >
              GST E-Invoice
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              <div>
                <label style={labelStyle}>
                  IRN *
                </label>

                <input
                  type="text"
                  name="irn"
                  value={form.irn}
                  onChange={handleChange}
                  placeholder="Invoice Reference Number"
                  style={fieldStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Acknowledgement Number *
                </label>

                <input
                  type="text"
                  name="ackNo"
                  value={form.ackNo}
                  onChange={handleChange}
                  placeholder="Acknowledgement number"
                  style={fieldStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Acknowledgement Date *
                </label>

                <input
                  type="text"
                  name="ackDate"
                  value={form.ackDate}
                  onChange={handleChange}
                  placeholder="2026-09-24T10:30:00Z"
                  style={fieldStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Signed Invoice *
                </label>

                <textarea
                  name="signedInvoice"
                  value={form.signedInvoice}
                  onChange={handleChange}
                  placeholder="Signed invoice value"
                  rows={4}
                  style={{
                    ...fieldStyle,
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label style={labelStyle}>
                  Signed QR Code *
                </label>

                <textarea
                  name="signedQrCode"
                  value={form.signedQrCode}
                  onChange={handleChange}
                  placeholder="Signed QR code value"
                  rows={4}
                  style={{
                    ...fieldStyle,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "20px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#1f2937",
                  }}
                >
                  Tax Information
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Optional product-level tax details.
                </p>
              </div>

              <button
                type="button"
                onClick={addTax}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                + Add Product Tax
              </button>
            </div>

            {taxes.length === 0 && (
              <div
                style={{
                  padding: "20px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  color: "#6b7280",
                  textAlign: "center",
                }}
              >
                No product tax entries added.
              </div>
            )}

            {taxes.map((tax, taxIndex) => (
              <div
                key={taxIndex}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "15px",
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                  }}
                >
                  <strong>
                    Product Tax #{taxIndex + 1}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      removeTax(taxIndex)
                    }
                    style={{
                      padding: "7px 12px",
                      border: "none",
                      borderRadius: "6px",
                      background: "#dc2626",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "15px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>
                      Channel Product ID
                    </label>

                    <input
                      type="text"
                      value={tax.channelProductId}
                      onChange={(e) =>
                        updateTax(
                          taxIndex,
                          "channelProductId",
                          e.target.value
                        )
                      }
                      style={fieldStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Additional Information
                    </label>

                    <input
                      type="text"
                      value={tax.additionalInfo}
                      onChange={(e) =>
                        updateTax(
                          taxIndex,
                          "additionalInfo",
                          e.target.value
                        )
                      }
                      style={fieldStyle}
                    />
                  </div>

                  {[
                    ["taxPercentage", "Tax Percentage"],
                    ["centralGst", "Central GST"],
                    ["stateGst", "State GST"],
                    [
                      "unionTerritoryGst",
                      "Union Territory GST",
                    ],
                    [
                      "integratedGst",
                      "Integrated GST",
                    ],
                    [
                      "compensationCess",
                      "Compensation Cess",
                    ],
                  ].map(([field, title]) => (
                    <div key={field}>
                      <label style={labelStyle}>
                        {title}
                      </label>

                      <input
                        type="number"
                        step="any"
                        value={tax[field]}
                        onChange={(e) =>
                          updateTax(
                            taxIndex,
                            field,
                            e.target.value
                          )
                        }
                        style={fieldStyle}
                      />
                    </div>
                  ))}
                </div>

                {/* Custom fields */}
                <div
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>
                      Custom Fields
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        addCustomField(taxIndex)
                      }
                      style={{
                        padding: "7px 12px",
                        border: "1px solid #2563eb",
                        borderRadius: "6px",
                        background: "#ffffff",
                        color: "#2563eb",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      + Add Field
                    </button>
                  </div>

                  {(
                    tax.customFieldValues || []
                  ).map(
                    (customField, fieldIndex) => (
                      <div
                        key={fieldIndex}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "1fr 1fr auto",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Name *"
                          value={
                            customField.name
                          }
                          onChange={(e) =>
                            updateCustomField(
                              taxIndex,
                              fieldIndex,
                              "name",
                              e.target.value
                            )
                          }
                          style={fieldStyle}
                        />

                        <input
                          type="text"
                          placeholder="Value"
                          value={
                            customField.value
                          }
                          onChange={(e) =>
                            updateCustomField(
                              taxIndex,
                              fieldIndex,
                              "value",
                              e.target.value
                            )
                          }
                          style={fieldStyle}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeCustomField(
                              taxIndex,
                              fieldIndex
                            )
                          }
                          style={{
                            padding:
                              "0 12px",
                            border: "none",
                            borderRadius:
                              "6px",
                            background:
                              "#dc2626",
                            color:
                              "#ffffff",
                            cursor:
                              "pointer",
                          }}
                        >
                          X
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Options */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              marginBottom: "20px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                name="fetchInvoiceDetail"
                checked={form.fetchInvoiceDetail}
                onChange={handleChange}
                style={{
                  width: "18px",
                  height: "18px",
                }}
              />

              Fetch Invoice Detail
            </label>

            <p
              style={{
                margin:
                  "8px 0 0 28px",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              Set this to true when the API should return
              additional invoice detail information.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                borderRadius: "8px",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "25px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px 24px",
                border: "none",
                borderRadius: "8px",
                background: loading
                  ? "#9ca3af"
                  : "#2563eb",
                color: "#ffffff",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 600,
              }}
            >
              {loading
                ? "Processing..."
                : "Create Invoice & Allocate Provider"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              style={{
                padding: "13px 24px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#374151",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1f2937",
              }}
            >
              Result
            </h2>

            <div
              style={{
                padding: "18px",
                borderRadius: "10px",
                background: result.successful
                  ? "#ecfdf5"
                  : "#fef2f2",
                border: `1px solid ${
                  result.successful
                    ? "#a7f3d0"
                    : "#fecaca"
                }`,
                marginBottom: "20px",
              }}
            >
              <strong
                style={{
                  color: result.successful
                    ? "#047857"
                    : "#b91c1c",
                  fontSize: "18px",
                }}
              >
                {result.successful
                  ? "Successful"
                  : "Failed"}
              </strong>

              {result.message && (
                <div
                  style={{
                    marginTop: "6px",
                    color: "#374151",
                  }}
                >
                  {result.message}
                </div>
              )}
            </div>

            {/* Response details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {[
                ["Invoice Code", result.invoiceCode],
                [
                  "Invoice Display Code",
                  result.invoiceDisplayCode,
                ],
                [
                  "Shipping Package Code",
                  result.shippingPackageCode,
                ],
                [
                  "Shipping Provider",
                  result.shippingProviderCode,
                ],
                [
                  "Shipping Courier",
                  result.shippingCourier,
                ],
                [
                  "Tracking Number",
                  result.trackingNumber,
                ],
                [
                  "Auto Print Enabled",
                  result.autoPrintEnabled
                    ? "Yes"
                    : "No",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: "15px",
                    background: "#f9fafb",
                    borderRadius: "8px",
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

                  <strong>
                    {value !== undefined &&
                    value !== null &&
                    value !== ""
                      ? String(value)
                      : "N/A"}
                  </strong>
                </div>
              ))}
            </div>

            {/* Links */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {result.shippingLabelLink && (
                <button
                  type="button"
                  onClick={openShippingLabel}
                  style={{
                    padding: "11px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Open Shipping Label
                </button>
              )}

              {result.trackingLink && (
                <button
                  type="button"
                  onClick={openTracking}
                  style={{
                    padding: "11px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#7c3aed",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Open Tracking Link
                </button>
              )}
            </div>

            {/* GST response */}
            {result.gstEinvoice && (
              <div
                style={{
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                  }}
                >
                  GST E-Invoice Response
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong>IRN:</strong>{" "}
                    {result.gstEinvoice.irn ||
                      "N/A"}
                  </div>

                  <div>
                    <strong>Ack No:</strong>{" "}
                    {result.gstEinvoice.ackNo ||
                      "N/A"}
                  </div>

                  <div>
                    <strong>Ack Date:</strong>{" "}
                    {result.gstEinvoice.ackDate ||
                      "N/A"}
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors?.length > 0 && (
              <div
                style={{
                  background: "#fee2e2",
                  padding: "15px",
                  borderRadius: "8px",
                  color: "#991b1b",
                  marginBottom: "15px",
                }}
              >
                <strong>Errors</strong>

                <ul
                  style={{
                    marginBottom: 0,
                  }}
                >
                  {result.errors.map(
                    (item, index) => (
                      <li key={index}>
                        {item.message ||
                          item.description ||
                          "Unknown error"}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div
                style={{
                  background: "#fef3c7",
                  padding: "15px",
                  borderRadius: "8px",
                  color: "#92400e",
                  marginBottom: "15px",
                }}
              >
                <strong>Warnings</strong>

                <ul
                  style={{
                    marginBottom: 0,
                  }}
                >
                  {result.warnings.map(
                    (item, index) => (
                      <li key={index}>
                        {item.message ||
                          item.description ||
                          "Unknown warning"}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Raw Response */}
            <details>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                View Raw Response
              </summary>

              <pre
                style={{
                  marginTop: "12px",
                  padding: "15px",
                  background: "#111827",
                  color: "#e5e7eb",
                  borderRadius: "8px",
                  overflowX: "auto",
                  fontSize: "12px",
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
        )}
      </div>
    </div>
  );
}

export default CreateInvoiceAndAllocateShippingProvider;