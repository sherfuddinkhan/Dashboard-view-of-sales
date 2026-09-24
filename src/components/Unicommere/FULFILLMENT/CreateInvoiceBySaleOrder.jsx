import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const createEmptyTax = () => ({
  channelProductId: "",
  additionalInfo: "",
  taxPercentage: "",
  centralGst: "",
  stateGst: "",
  unionTerritoryGst: "",
  integratedGst: "",
  compensationCess: "",
  customFieldValues: [],
});

const createEmptyCustomField = () => ({
  name: "",
  value: "",
});

function CreateInvoiceBySaleOrder() {
  const [form, setForm] = useState({
    facility: "MAIN",
    saleOrderCode: "",
    saleOrderItemCodes: [""],
    commitBlockedInventory: true,
    includeTaxInformation: false,
    productTaxes: [],
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ==========================================================
  // Sale Order Item Codes
  // ==========================================================

  const addItemCode = () => {
    setForm((prev) => ({
      ...prev,
      saleOrderItemCodes: [
        ...prev.saleOrderItemCodes,
        "",
      ],
    }));
  };

  const updateItemCode = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.saleOrderItemCodes];
      updated[index] = value;

      return {
        ...prev,
        saleOrderItemCodes: updated,
      };
    });
  };

  const removeItemCode = (index) => {
    setForm((prev) => {
      const updated = prev.saleOrderItemCodes.filter(
        (_, i) => i !== index
      );

      return {
        ...prev,
        saleOrderItemCodes:
          updated.length > 0 ? updated : [""],
      };
    });
  };

  // ==========================================================
  // Product Taxes
  // ==========================================================

  const addProductTax = () => {
    setForm((prev) => ({
      ...prev,
      productTaxes: [
        ...prev.productTaxes,
        createEmptyTax(),
      ],
    }));
  };

  const updateProductTax = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.productTaxes];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        productTaxes: updated,
      };
    });
  };

  const removeProductTax = (index) => {
    setForm((prev) => ({
      ...prev,
      productTaxes: prev.productTaxes.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // ==========================================================
  // Tax Custom Fields
  // ==========================================================

  const addTaxCustomField = (taxIndex) => {
    setForm((prev) => {
      const updatedTaxes = [...prev.productTaxes];

      updatedTaxes[taxIndex] = {
        ...updatedTaxes[taxIndex],
        customFieldValues: [
          ...(updatedTaxes[taxIndex].customFieldValues || []),
          createEmptyCustomField(),
        ],
      };

      return {
        ...prev,
        productTaxes: updatedTaxes,
      };
    });
  };

  const updateTaxCustomField = (
    taxIndex,
    fieldIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const updatedTaxes = [...prev.productTaxes];

      const customFields = [
        ...(updatedTaxes[taxIndex].customFieldValues || []),
      ];

      customFields[fieldIndex] = {
        ...customFields[fieldIndex],
        [field]: value,
      };

      updatedTaxes[taxIndex] = {
        ...updatedTaxes[taxIndex],
        customFieldValues: customFields,
      };

      return {
        ...prev,
        productTaxes: updatedTaxes,
      };
    });
  };

  const removeTaxCustomField = (
    taxIndex,
    fieldIndex
  ) => {
    setForm((prev) => {
      const updatedTaxes = [...prev.productTaxes];

      updatedTaxes[taxIndex] = {
        ...updatedTaxes[taxIndex],
        customFieldValues: (
          updatedTaxes[taxIndex].customFieldValues || []
        ).filter((_, i) => i !== fieldIndex),
      };

      return {
        ...prev,
        productTaxes: updatedTaxes,
      };
    });
  };

  // ==========================================================
  // Build Request
  // ==========================================================

  const buildPayload = () => {
    const payload = {
      facility: form.facility.trim(),
      saleOrderCode: form.saleOrderCode.trim(),
      saleOrderItemCodes: form.saleOrderItemCodes
        .map((code) => code.trim())
        .filter(Boolean),
      commitBlockedInventory:
        form.commitBlockedInventory,
    };

    if (form.includeTaxInformation) {
      payload.taxInformation = {
        productTaxes: form.productTaxes
          .filter(
            (tax) =>
              tax.channelProductId.trim() !== ""
          )
          .map((tax) => {
            const productTax = {
              channelProductId:
                tax.channelProductId.trim(),
            };

            if (tax.additionalInfo.trim()) {
              productTax.additionalInfo =
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
                const value = Number(tax[field]);

                if (Number.isFinite(value)) {
                  productTax[field] = value;
                }
              }
            });

            const customFieldValues = (
              tax.customFieldValues || []
            )
              .filter(
                (field) => field.name.trim() !== ""
              )
              .map((field) => ({
                name: field.name.trim(),
                value: field.value ?? "",
              }));

            if (customFieldValues.length > 0) {
              productTax.customFieldValues =
                customFieldValues;
            }

            return productTax;
          }),
      };
    }

    return payload;
  };

  // ==========================================================
  // Submit
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    const cleanedItemCodes =
      form.saleOrderItemCodes
        .map((code) => code.trim())
        .filter(Boolean);

    if (!form.facility.trim()) {
      setError("Facility code is required.");
      return;
    }

    if (!form.saleOrderCode.trim()) {
      setError("Sale order code is required.");
      return;
    }

    if (cleanedItemCodes.length === 0) {
      setError(
        "At least one sale order item code is required."
      );
      return;
    }

    if (
      form.includeTaxInformation &&
      form.productTaxes.some(
        (tax) => !tax.channelProductId.trim()
      )
    ) {
      setError(
        "Every product tax entry must have a channel product ID."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/invoices/create-by-sale-order`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(result.data);
    } catch (err) {
      setResponse(
        err.response?.data || {
          successful: false,
          message:
            err.message ||
            "Failed to create invoice.",
          errors: [],
          warnings: [],
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Reset
  // ==========================================================

  const handleReset = () => {
    setForm({
      facility: "MAIN",
      saleOrderCode: "",
      saleOrderItemCodes: [""],
      commitBlockedInventory: true,
      includeTaxInformation: false,
      productTaxes: [],
    });

    setResponse(null);
    setError("");
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "30px auto",
        padding: "0 20px 40px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
          }}
        >
          Create Invoice by Sale Order
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: 8,
          }}
        >
          Create a Uniware invoice using a sale
          order code and sale order item codes.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ================================================== */}
        {/* Basic Details */}
        {/* ================================================== */}

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 20,
            marginBottom: 20,
            background: "#fff",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 20,
            }}
          >
            Invoice Details
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <label>Facility Code *</label>

              <input
                type="text"
                value={form.facility}
                onChange={(e) =>
                  handleChange(
                    "facility",
                    e.target.value
                  )
                }
                placeholder="MAIN"
                style={inputStyle}
              />

              <small
                style={{
                  color: "#777",
                  display: "block",
                  marginTop: 5,
                }}
              >
                Sent as the Uniware Facility header.
              </small>
            </div>

            <div>
              <label>Sale Order Code *</label>

              <input
                type="text"
                value={form.saleOrderCode}
                onChange={(e) =>
                  handleChange(
                    "saleOrderCode",
                    e.target.value
                  )
                }
                placeholder="SO1231100023"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Sale Order Item Codes *
            </label>

            {form.saleOrderItemCodes.map(
              (code, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      updateItemCode(
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`SO1231100023-${index}`}
                    style={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeItemCode(index)
                    }
                    style={{
                      ...buttonStyle,
                      background: "#dc3545",
                      color: "#fff",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )
            )}

            <button
              type="button"
              onClick={addItemCode}
              style={{
                ...buttonStyle,
                background: "#6c757d",
                color: "#fff",
              }}
            >
              + Add Item Code
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <input
              type="checkbox"
              checked={form.commitBlockedInventory}
              onChange={(e) =>
                handleChange(
                  "commitBlockedInventory",
                  e.target.checked
                )
              }
            />

            <label>
              Commit Blocked Inventory
            </label>
          </div>
        </div>

        {/* ================================================== */}
        {/* Tax Information */}
        {/* ================================================== */}

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 20,
            marginBottom: 20,
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                Product Tax Information
              </h2>

              <p
                style={{
                  color: "#777",
                  marginBottom: 0,
                }}
              >
                Optional. Add tax information for
                channel products.
              </p>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input
                type="checkbox"
                checked={
                  form.includeTaxInformation
                }
                onChange={(e) =>
                  handleChange(
                    "includeTaxInformation",
                    e.target.checked
                  )
                }
              />

              Include Tax Information
            </label>
          </div>

          {form.includeTaxInformation && (
            <div style={{ marginTop: 20 }}>
              {form.productTaxes.length === 0 && (
                <div
                  style={{
                    padding: 15,
                    background: "#f8f9fa",
                    borderRadius: 6,
                    color: "#666",
                    marginBottom: 15,
                  }}
                >
                  No product tax entries added.
                </div>
              )}

              {form.productTaxes.map(
                (tax, taxIndex) => (
                  <div
                    key={taxIndex}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 15,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        marginBottom: 15,
                      }}
                    >
                      <strong>
                        Product Tax #
                        {taxIndex + 1}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          removeProductTax(
                            taxIndex
                          )
                        }
                        style={{
                          ...buttonStyle,
                          background: "#dc3545",
                          color: "#fff",
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label>
                          Channel Product ID *
                        </label>

                        <input
                          type="text"
                          value={
                            tax.channelProductId
                          }
                          onChange={(e) =>
                            updateProductTax(
                              taxIndex,
                              "channelProductId",
                              e.target.value
                            )
                          }
                          placeholder="TESTB"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label>
                          Additional Info
                        </label>

                        <input
                          type="text"
                          value={
                            tax.additionalInfo
                          }
                          onChange={(e) =>
                            updateProductTax(
                              taxIndex,
                              "additionalInfo",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        />
                      </div>

                      {[
                        [
                          "taxPercentage",
                          "Tax %",
                        ],
                        [
                          "centralGst",
                          "Central GST",
                        ],
                        [
                          "stateGst",
                          "State GST",
                        ],
                        [
                          "unionTerritoryGst",
                          "UT GST",
                        ],
                        [
                          "integratedGst",
                          "Integrated GST",
                        ],
                        [
                          "compensationCess",
                          "Compensation Cess",
                        ],
                      ].map(
                        ([field, label]) => (
                          <div key={field}>
                            <label>
                              {label}
                            </label>

                            <input
                              type="number"
                              step="any"
                              value={tax[field]}
                              onChange={(e) =>
                                updateProductTax(
                                  taxIndex,
                                  field,
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </div>
                        )
                      )}
                    </div>

                    {/* Tax custom fields */}
                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 15,
                        borderTop:
                          "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <strong>
                          Custom Fields
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            addTaxCustomField(
                              taxIndex
                            )
                          }
                          style={{
                            ...buttonStyle,
                            background:
                              "#6c757d",
                            color: "#fff",
                            padding:
                              "7px 12px",
                          }}
                        >
                          + Add Field
                        </button>
                      </div>

                      {(
                        tax.customFieldValues ||
                        []
                      ).map(
                        (
                          customField,
                          fieldIndex
                        ) => (
                          <div
                            key={fieldIndex}
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "1fr 1fr auto",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Name"
                              value={
                                customField.name
                              }
                              onChange={(e) =>
                                updateTaxCustomField(
                                  taxIndex,
                                  fieldIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />

                            <input
                              type="text"
                              placeholder="Value"
                              value={
                                customField.value
                              }
                              onChange={(e) =>
                                updateTaxCustomField(
                                  taxIndex,
                                  fieldIndex,
                                  "value",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeTaxCustomField(
                                  taxIndex,
                                  fieldIndex
                                )
                              }
                              style={{
                                ...buttonStyle,
                                background:
                                  "#dc3545",
                                color: "#fff",
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={addProductTax}
                style={{
                  ...buttonStyle,
                  background: "#0d6efd",
                  color: "#fff",
                }}
              >
                + Add Product Tax
              </button>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* Actions */}
        {/* ================================================== */}

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 25,
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              background: loading
                ? "#999"
                : "#198754",
              color: "#fff",
            }}
          >
            {loading
              ? "Creating Invoice..."
              : "Create Invoice"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              ...buttonStyle,
              background: "#6c757d",
              color: "#fff",
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* ==================================================== */}
      {/* Local Validation Error */}
      {/* ==================================================== */}

      {error && (
        <div
          style={{
            padding: 15,
            borderRadius: 8,
            background: "#f8d7da",
            color: "#842029",
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* ==================================================== */}
      {/* Result */}
      {/* ==================================================== */}

      {response && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 20,
            background: "#fff",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Response
          </h2>

          <div
            style={{
              padding: 15,
              borderRadius: 8,
              background: response.successful
                ? "#d1e7dd"
                : "#f8d7da",
              color: response.successful
                ? "#0f5132"
                : "#842029",
              marginBottom: 20,
            }}
          >
            <strong>
              {response.successful
                ? "Invoice Created Successfully"
                : "Invoice Creation Failed"}
            </strong>

            {response.message && (
              <div style={{ marginTop: 5 }}>
                {response.message}
              </div>
            )}
          </div>

          {response.successful && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                [
                  "Invoice Code",
                  response.invoiceCode,
                ],
                [
                  "Invoice Display Code",
                  response.invoiceDisplayCode,
                ],
                [
                  "Shipping Package Code",
                  response.shippingPackageCode,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      color: "#777",
                      fontSize: 12,
                      marginBottom: 5,
                    }}
                  >
                    {label}
                  </div>

                  <strong>
                    {value || "N/A"}
                  </strong>
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {Array.isArray(response.errors) &&
            response.errors.length > 0 && (
              <div
                style={{
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    color: "#dc3545",
                  }}
                >
                  Errors
                </h3>

                {response.errors.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 10,
                        marginBottom: 8,
                        background: "#f8d7da",
                        borderRadius: 6,
                      }}
                    >
                      <strong>
                        {item.fieldName ||
                          "Error"}
                      </strong>

                      <div>
                        {item.message ||
                          item.description ||
                          "Unknown error"}
                      </div>

                      {item.code !==
                        undefined && (
                        <small>
                          Code: {item.code}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* Warnings */}
          {Array.isArray(response.warnings) &&
            response.warnings.length > 0 && (
              <div
                style={{
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    color: "#856404",
                  }}
                >
                  Warnings
                </h3>

                {response.warnings.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 10,
                        marginBottom: 8,
                        background: "#fff3cd",
                        borderRadius: 6,
                      }}
                    >
                      <strong>
                        {item.message ||
                          "Warning"}
                      </strong>

                      {item.description && (
                        <div>
                          {item.description}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* Raw Response */}
          <details>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Raw Response
            </summary>

            <pre
              style={{
                background: "#f6f8fa",
                padding: 15,
                borderRadius: 8,
                overflowX: "auto",
                marginTop: 10,
                fontSize: 12,
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

export default CreateInvoiceBySaleOrder;