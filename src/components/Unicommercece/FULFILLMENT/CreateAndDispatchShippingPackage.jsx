import React, {
  useState,
} from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateAndDispatchShippingPackage() {
  const [form, setForm] = useState({
    facility: "MAIN",
    saleOrderCode: "",
    saleOrderItemCodes: [""],

    shippingProviderCode: "",
    trackingNumber: "",
    shippingPackageCode: "",
    markDispatchedOnChannel: false,

    invoiceCode: "",

    productTaxes: [
      {
        channelProductId: "",
        additionalInfo: "",
        taxPercentage: "",
        centralGst: "",
        stateGst: "",
        unionTerritoryGst: "",
        integratedGst: "",
        compensationCess: "",
      },
    ],
  });

  const [useShippingPackageInfo, setUseShippingPackageInfo] =
    useState(true);

  const [useInvoiceInfo, setUseInvoiceInfo] =
    useState(false);

  const [useTaxInformation, setUseTaxInformation] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  // ==========================================================
  // Basic field change
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================================
  // Sale order item codes
  // ==========================================================

  const addSaleOrderItem = () => {
    setForm((previous) => ({
      ...previous,
      saleOrderItemCodes: [
        ...previous.saleOrderItemCodes,
        "",
      ],
    }));
  };

  const removeSaleOrderItem = (
    index
  ) => {
    setForm((previous) => {
      const items =
        previous.saleOrderItemCodes.filter(
          (_, itemIndex) =>
            itemIndex !== index
        );

      return {
        ...previous,
        saleOrderItemCodes:
          items.length > 0
            ? items
            : [""],
      };
    });
  };

  const updateSaleOrderItem = (
    index,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      saleOrderItemCodes:
        previous.saleOrderItemCodes.map(
          (item, itemIndex) =>
            itemIndex === index
              ? value
              : item
        ),
    }));
  };

  // ==========================================================
  // Product tax changes
  // ==========================================================

  const addProductTax = () => {
    setForm((previous) => ({
      ...previous,
      productTaxes: [
        ...previous.productTaxes,
        {
          channelProductId: "",
          additionalInfo: "",
          taxPercentage: "",
          centralGst: "",
          stateGst: "",
          unionTerritoryGst: "",
          integratedGst: "",
          compensationCess: "",
        },
      ],
    }));
  };

  const removeProductTax = (
    index
  ) => {
    setForm((previous) => {
      const taxes =
        previous.productTaxes.filter(
          (_, taxIndex) =>
            taxIndex !== index
        );

      return {
        ...previous,
        productTaxes:
          taxes.length > 0
            ? taxes
            : [
                {
                  channelProductId:
                    "",
                  additionalInfo:
                    "",
                  taxPercentage:
                    "",
                  centralGst: "",
                  stateGst: "",
                  unionTerritoryGst:
                    "",
                  integratedGst:
                    "",
                  compensationCess:
                    "",
                },
              ],
      };
    });
  };

  const updateProductTax = (
    index,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      productTaxes:
        previous.productTaxes.map(
          (tax, taxIndex) =>
            taxIndex === index
              ? {
                  ...tax,
                  [field]:
                    value,
                }
              : tax
        ),
    }));
  };

  // ==========================================================
  // Build custom tax object
  // ==========================================================

  const buildProductTaxes = () => {
    const validTaxes =
      form.productTaxes.filter(
        (tax) =>
          tax.channelProductId.trim()
      );

    if (
      validTaxes.length === 0
    ) {
      throw new Error(
        "At least one product tax with channelProductId is required."
      );
    }

    return validTaxes.map(
      (tax) => {
        const productTax = {
          channelProductId:
            tax.channelProductId.trim(),
        };

        if (
          tax.additionalInfo.trim()
        ) {
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

        for (
          const field of numericFields
        ) {
          if (
            String(
              tax[field]
            ).trim() !== ""
          ) {
            const value =
              Number(
                tax[field]
              );

            if (
              !Number.isFinite(
                value
              )
            ) {
              throw new Error(
                `${field} must be a valid number.`
              );
            }

            productTax[field] =
              value;
          }
        }

        return productTax;
      }
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
      const facility =
        form.facility.trim();

      const saleOrderCode =
        form.saleOrderCode.trim();

      if (!facility) {
        throw new Error(
          "Facility is required."
        );
      }

      if (!saleOrderCode) {
        throw new Error(
          "Sale Order Code is required."
        );
      }

      const saleOrderItemCodes =
        form.saleOrderItemCodes
          .map((code) =>
            code.trim()
          )
          .filter(Boolean);

      if (
        saleOrderItemCodes.length ===
        0
      ) {
        throw new Error(
          "At least one Sale Order Item Code is required."
        );
      }

      // --------------------------------------------------------
      // Sale Order Item Info
      // --------------------------------------------------------

      const payload = {
        facility,
        saleOrderCode,

        saleOrderItemInfo: {
          saleOrderItem:
            saleOrderItemCodes.map(
              (code) => ({
                code,
              })
            ),
        },
      };

      // --------------------------------------------------------
      // Shipping Package Info
      // --------------------------------------------------------

      if (
        useShippingPackageInfo
      ) {
        const shippingPackageInfo =
          {};

        if (
          form.trackingNumber.trim()
        ) {
          shippingPackageInfo.trackingNumber =
            form.trackingNumber.trim();
        }

        if (
          form.shippingProviderCode.trim()
        ) {
          shippingPackageInfo.shippingProviderCode =
            form.shippingProviderCode.trim();
        }

        if (
          form.shippingPackageCode.trim()
        ) {
          shippingPackageInfo.shippingPackageCode =
            form.shippingPackageCode.trim();
        }

        // Explicit false is intentionally retained
        shippingPackageInfo.markDispatchedOnChannel =
          form.markDispatchedOnChannel;

        payload.shippingPackageInfo =
          shippingPackageInfo;
      }

      // --------------------------------------------------------
      // Invoice Info
      // --------------------------------------------------------

      if (useInvoiceInfo) {
        const invoiceInfo = {};

        if (
          form.invoiceCode.trim()
        ) {
          invoiceInfo.invoiceCode =
            form.invoiceCode.trim();
        }

        if (useTaxInformation) {
          invoiceInfo.taxInformation =
            {
              productTaxes:
                buildProductTaxes(),
            };
        }

        payload.invoiceInfo =
          invoiceInfo;
      }

      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/shipping-packages/create-and-dispatch`,
          payload
        );

      setResult(response.data);
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to create and dispatch shipping package."
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
      saleOrderCode: "",
      saleOrderItemCodes: [""],
      shippingProviderCode: "",
      trackingNumber: "",
      shippingPackageCode: "",
      markDispatchedOnChannel: false,
      invoiceCode: "",
      productTaxes: [
        {
          channelProductId: "",
          additionalInfo: "",
          taxPercentage: "",
          centralGst: "",
          stateGst: "",
          unionTerritoryGst: "",
          integratedGst: "",
          compensationCess: "",
        },
      ],
    });

    setUseShippingPackageInfo(
      true
    );

    setUseInvoiceInfo(false);
    setUseTaxInformation(false);

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
            Shipment Create & Mark
            Dispatched
          </h2>

          <p style={descriptionStyle}>
            Create a shipping package
            from Sale Order Item Code(s)
            and mark the shipment as
            dispatched in Uniware in one
            operation.
          </p>

          <span style={badgeStyle}>
            FACILITY LEVEL
          </span>
        </div>

        {/* ================================================== */}
        {/* Workflow */}
        {/* ================================================== */}

        <div
          style={{
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
          }}
        >
          <WorkflowStep
            text="Sale Order"
          />

          <span>→</span>

          <WorkflowStep
            text="Sale Order Items"
          />

          <span>→</span>

          <WorkflowStep
            text="Create Package"
          />

          <span>→</span>

          <WorkflowStep
            text="Dispatch"
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

        {/* ================================================== */}
        {/* Form */}
        {/* ================================================== */}

        <form onSubmit={handleSubmit}>
          {/* ------------------------------------------------ */}
          {/* Basic Information */}
          {/* ------------------------------------------------ */}

          <SectionTitle>
            Basic Information
          </SectionTitle>

          <div style={gridStyle}>
            <FormField
              label="Facility *"
            >
              <input
                name="facility"
                value={form.facility}
                onChange={handleChange}
                placeholder="MAIN"
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="Sale Order Code *"
            >
              <input
                name="saleOrderCode"
                value={
                  form.saleOrderCode
                }
                onChange={handleChange}
                placeholder="SO-12345"
                style={inputStyle}
              />
            </FormField>
          </div>

          {/* ------------------------------------------------ */}
          {/* Sale Order Items */}
          {/* ------------------------------------------------ */}

          <SectionTitle>
            Sale Order Items
          </SectionTitle>

          {form.saleOrderItemCodes.map(
            (code, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <input
                  value={code}
                  onChange={(event) =>
                    updateSaleOrderItem(
                      index,
                      event.target.value
                    )
                  }
                  placeholder={`Sale Order Item Code ${
                    index + 1
                  }`}
                  style={{
                    ...inputStyle,
                    flex: 1,
                  }}
                />

                {form
                  .saleOrderItemCodes
                  .length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeSaleOrderItem(
                        index
                      )
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

          <button
            type="button"
            onClick={
              addSaleOrderItem
            }
            style={secondaryButtonStyle}
          >
            + Add Sale Order Item
          </button>

          {/* ------------------------------------------------ */}
          {/* Shipping Package */}
          {/* ------------------------------------------------ */}

          <SectionTitle>
            Shipping Package Information
          </SectionTitle>

          <label
            style={
              checkboxContainerStyle
            }
          >
            <input
              type="checkbox"
              checked={
                useShippingPackageInfo
              }
              onChange={(event) =>
                setUseShippingPackageInfo(
                  event.target.checked
                )
              }
            />

            <span>
              Include shipping package
              information
            </span>
          </label>

          {useShippingPackageInfo && (
            <div
              style={{
                marginTop: "15px",
              }}
            >
              <div style={gridStyle}>
                <FormField
                  label="Shipping Provider Code"
                >
                  <input
                    name="shippingProviderCode"
                    value={
                      form.shippingProviderCode
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="DTDC"
                    style={inputStyle}
                  />
                </FormField>

                <FormField
                  label="Tracking Number"
                >
                  <input
                    name="trackingNumber"
                    value={
                      form.trackingNumber
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="123456789"
                    style={inputStyle}
                  />
                </FormField>

                <FormField
                  label="Shipping Package Code"
                >
                  <input
                    name="shippingPackageCode"
                    value={
                      form.shippingPackageCode
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="SP-7671"
                    style={inputStyle}
                  />
                </FormField>

                <FormField
                  label="Channel Dispatch"
                >
                  <label
                    style={
                      checkboxContainerStyle
                    }
                  >
                    <input
                      type="checkbox"
                      name="markDispatchedOnChannel"
                      checked={
                        form.markDispatchedOnChannel
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      Mark dispatched on
                      channel
                    </span>
                  </label>
                </FormField>
              </div>
            </div>
          )}

          {/* ------------------------------------------------ */}
          {/* Invoice */}
          {/* ------------------------------------------------ */}

          <SectionTitle>
            Invoice Information
          </SectionTitle>

          <label
            style={
              checkboxContainerStyle
            }
          >
            <input
              type="checkbox"
              checked={useInvoiceInfo}
              onChange={(event) =>
                setUseInvoiceInfo(
                  event.target.checked
                )
              }
            />

            <span>
              Include invoice information
            </span>
          </label>

          {useInvoiceInfo && (
            <div
              style={{
                marginTop: "15px",
              }}
            >
              <FormField
                label="Invoice Code"
              >
                <input
                  name="invoiceCode"
                  value={
                    form.invoiceCode
                  }
                  onChange={handleChange}
                  placeholder="INV-12345"
                  style={inputStyle}
                />
              </FormField>

              <div
                style={{
                  marginTop: "18px",
                }}
              >
                <label
                  style={
                    checkboxContainerStyle
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      useTaxInformation
                    }
                    onChange={(
                      event
                    ) =>
                      setUseTaxInformation(
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    Include tax information
                  </span>
                </label>
              </div>

              {useTaxInformation && (
                <div
                  style={{
                    marginTop: "18px",
                  }}
                >
                  {form.productTaxes.map(
                    (
                      tax,
                      index
                    ) => (
                      <div
                        key={index}
                        style={
                          taxCardStyle
                        }
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            marginBottom:
                              "15px",
                          }}
                        >
                          <strong>
                            Product Tax #
                            {index +
                              1}
                          </strong>

                          {form
                            .productTaxes
                            .length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeProductTax(
                                  index
                                )
                              }
                              style={
                                removeButtonStyle
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div
                          style={
                            gridStyle
                          }
                        >
                          <TaxInput
                            label="Channel Product ID *"
                            value={
                              tax.channelProductId
                            }
                            onChange={(
                              value
                            ) =>
                              updateProductTax(
                                index,
                                "channelProductId",
                                value
                              )
                            }
                          />

                          <TaxInput
                            label="Additional Info"
                            value={
                              tax.additionalInfo
                            }
                            onChange={(
                              value
                            ) =>
                              updateProductTax(
                                index,
                                "additionalInfo",
                                value
                              )
                            }
                          />

                          <TaxInput
                            label="Tax Percentage"
                            value={
                              tax.taxPercentage
                            }
                            onChange={(
                              value
                            ) =>
                              updateProductTax(
                                index,
                                "taxPercentage",
                                value
                              )
                            }
                            type="number"
                          />

                          <TaxInput
                            label="Central GST"
                            value={
                              tax.centralGst
                            }
                            onChange={(
                              value
                            ) =>
                              updateProductTax(
                                index,
                                "centralGst",
                                value
                              )
                            }
                            type="number"
                          />

                          <TaxInput
                            label="State GST"
                            value={
                              tax.stateGst
                            }
                            onChange={(
                              value
                            ) =>
                              updateProductTax(
                                index,
                                "stateGst",
                                value
                              )
                            }
                            type="number"
                          />

                          <TaxInput
                            label="UT GST"
                            value={
                              tax.unionTerritoryGst
                            }
                            onChange={(
                              value
                            ) =>
                              updateProductTax(
                                index,
                                "unionTerritoryGst",
                                value
                              )
                            }
                            type="number"
                          />

                          <TaxInput
                            label="Integrated GST"
                            value={
                              tax.integratedGst
                            }
                            onChange={(
                              value
                            ) =>
                              updateProductTax(
                                index,
                                "integratedGst",
                                value
                              )
                            }
                            type="number"
                          />

                          <TaxInput
                            label="Compensation Cess"
                            value={
                              tax.compensationCess
                            }
                            onChange={(
                              value
                            ) =>
                              updateProductTax(
                                index,
                                "compensationCess",
                                value
                              )
                            }
                            type="number"
                          />
                        </div>
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={
                      addProductTax
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    + Add Product Tax
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------ */}
          {/* Submit */}
          {/* ------------------------------------------------ */}

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
                ? "Processing..."
                : "Create & Dispatch"}
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
          <DispatchResult
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
// Tax input
// ============================================================

function TaxInput({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={inputStyle}
      />
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

function DispatchResult({
  result,
}) {
  const successful =
    result.successful === true;

  const shippingPackageCodes =
    Array.isArray(
      result.shippingPackageCodes
    )
      ? result.shippingPackageCodes
      : [];

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
        Create & Dispatch Result
      </h3>

      <div
        style={{
          padding: "18px",
          background: successful
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
            color: successful
              ? "#15803d"
              : "#b91c1c",
          }}
        >
          {successful
            ? "✓ Shipment Created & Dispatched"
            : "✕ Operation Failed"}
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

      {/* Shipping Package Codes */}
      {shippingPackageCodes.length >
        0 && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h4>
            Shipping Package Codes
          </h4>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {shippingPackageCodes.map(
              (
                code,
                index
              ) => (
                <span
                  key={index}
                  style={{
                    padding:
                      "8px 12px",
                    background:
                      "#eff6ff",
                    border:
                      "1px solid #bfdbfe",
                    borderRadius:
                      "6px",
                    fontWeight: 600,
                  }}
                >
                  {code}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Errors */}
      {Array.isArray(
        result.errors
      ) &&
        result.errors.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#fef2f2",
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
              background: "#fffbeb",
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

      {/* Raw */}
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
  background: "#fef3c7",
  color: "#92400e",
  fontSize: "12px",
  fontWeight: 700,
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

const checkboxContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "11px 12px",
  border:
    "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
};

const taxCardStyle = {
  padding: "18px",
  marginBottom: "15px",
  background: "#f8fafc",
  border:
    "1px solid #e2e8f0",
  borderRadius: "8px",
};

const primaryButtonStyle = {
  padding: "13px 24px",
  border: "none",
  borderRadius: "7px",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  border:
    "1px solid #cbd5e1",
  borderRadius: "7px",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
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

const removeButtonStyle = {
  padding: "8px 12px",
  border:
    "1px solid #fecaca",
  borderRadius: "6px",
  background: "#fef2f2",
  color: "#b91c1c",
  cursor: "pointer",
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

export default CreateAndDispatchShippingPackage;