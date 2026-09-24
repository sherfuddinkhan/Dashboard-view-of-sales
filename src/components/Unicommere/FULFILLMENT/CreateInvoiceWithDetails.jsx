import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const createCustomField = () => ({
  name: "",
  value: "",
});

const createSaleOrderItem = () => ({
  code: "",
  status: "",
  shelfCode: "",
  reason: "",
});

const createInvoiceItem = () => ({
  skuCode: "",
  bundleSkuCode: "",
  channelProductId: "",
  sellerSkuCode: "",
  saleOrderItemCodes: [""],
  saleOrderItems: [],
  unitPrice: "",
  subtotal: "",
  discount: "",
  shippingCharges: "",
  cashOnDeliveryCharges: "",
  shippingMethodCharges: "",
  total: "",
  prepaidAmount: "",
  voucherValue: "",
  serviceTax: "",
  additionalTax: "",
  giftWrapCharges: "",
  storeCredit: "",
  additionalInfo: "",
  quantity: "",
  itemDetails: "",
  includeTaxDetails: false,
  taxPercentageDetail: {
    taxTypeCode: "",
    vat: "",
    cst: "",
    cstFormc: "",
    taxPercentage: "",
    serviceTax: "",
    additionalTax: "",
    centralGst: "",
    stateGst: "",
    unionTerritoryGst: "",
    integratedGst: "",
    compensationCess: "",
  },
  customFieldValues: [],
});

const createEmptyInvoice = () => ({
  code: "",
  displayCode: "",
  channelCreated: "",
  channelCode: "",
  fromPartyCode: "",
  toPartyCode: "",
  source: "SHIPPING_PACKAGE",
  destinationStateCode: "",
  destinationCountryCode: "",
  type: "SALE",
  productManagementSwitchedOff: true,
  taxExempted: false,
  cformProvided: false,
  url: "",

  includeGstEinvoice: false,

  gstEinvoice: {
    irn: "",
    ackNo: "",
    ackDate: "",
    signedInvoice: "",
    signedQrCode: "",
  },

  invoiceItems: [createInvoiceItem()],
});

function CreateInvoiceWithDetails() {
  const [form, setForm] = useState({
    facility: "MAIN",
    saleOrderCode: "",
    shippingProviderCode: "",
    trackingNumber: "",
    invoice: createEmptyInvoice(),
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  // ==========================================================
  // General helpers
  // ==========================================================

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "9px 14px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  };

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    background: "#fff",
  };

  const updateInvoice = (field, value) => {
    setForm((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        [field]: value,
      },
    }));
  };

  const updateGstEinvoice = (field, value) => {
    setForm((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        gstEinvoice: {
          ...prev.invoice.gstEinvoice,
          [field]: value,
        },
      },
    }));
  };

  // ==========================================================
  // Invoice Items
  // ==========================================================

  const addInvoiceItem = () => {
    setForm((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        invoiceItems: [
          ...prev.invoice.invoiceItems,
          createInvoiceItem(),
        ],
      },
    }));
  };

  const removeInvoiceItem = (index) => {
    setForm((prev) => {
      const items =
        prev.invoice.invoiceItems.filter(
          (_, itemIndex) =>
            itemIndex !== index
        );

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems:
            items.length > 0
              ? items
              : [createInvoiceItem()],
        },
      };
    });
  };

  const updateInvoiceItem = (
    itemIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      items[itemIndex] = {
        ...items[itemIndex],
        [field]: value,
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  // ==========================================================
  // Sale Order Item Codes
  // ==========================================================

  const addSaleOrderItemCode = (
    itemIndex
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      items[itemIndex] = {
        ...items[itemIndex],
        saleOrderItemCodes: [
          ...items[itemIndex]
            .saleOrderItemCodes,
          "",
        ],
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  const updateSaleOrderItemCode = (
    itemIndex,
    codeIndex,
    value
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      const codes = [
        ...items[itemIndex]
          .saleOrderItemCodes,
      ];

      codes[codeIndex] = value;

      items[itemIndex] = {
        ...items[itemIndex],
        saleOrderItemCodes: codes,
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  const removeSaleOrderItemCode = (
    itemIndex,
    codeIndex
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      const codes =
        items[
          itemIndex
        ].saleOrderItemCodes.filter(
          (_, index) =>
            index !== codeIndex
        );

      items[itemIndex] = {
        ...items[itemIndex],
        saleOrderItemCodes:
          codes.length > 0
            ? codes
            : [""],
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  // ==========================================================
  // Sale Order Items
  // ==========================================================

  const addSaleOrderItem = (
    itemIndex
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      items[itemIndex] = {
        ...items[itemIndex],
        saleOrderItems: [
          ...items[itemIndex].saleOrderItems,
          createSaleOrderItem(),
        ],
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  const updateSaleOrderItem = (
    itemIndex,
    soiIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      const saleOrderItems = [
        ...items[itemIndex].saleOrderItems,
      ];

      saleOrderItems[soiIndex] = {
        ...saleOrderItems[soiIndex],
        [field]: value,
      };

      items[itemIndex] = {
        ...items[itemIndex],
        saleOrderItems,
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  const removeSaleOrderItem = (
    itemIndex,
    soiIndex
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      items[itemIndex] = {
        ...items[itemIndex],
        saleOrderItems:
          items[
            itemIndex
          ].saleOrderItems.filter(
            (_, index) =>
              index !== soiIndex
          ),
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  // ==========================================================
  // Invoice Item Tax
  // ==========================================================

  const updateItemTax = (
    itemIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      items[itemIndex] = {
        ...items[itemIndex],
        taxPercentageDetail: {
          ...items[itemIndex]
            .taxPercentageDetail,
          [field]: value,
        },
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  // ==========================================================
  // Item Custom Fields
  // ==========================================================

  const addItemCustomField = (
    itemIndex
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      items[itemIndex] = {
        ...items[itemIndex],
        customFieldValues: [
          ...items[itemIndex]
            .customFieldValues,
          createCustomField(),
        ],
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  const updateItemCustomField = (
    itemIndex,
    fieldIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      const customFields = [
        ...items[itemIndex]
          .customFieldValues,
      ];

      customFields[fieldIndex] = {
        ...customFields[fieldIndex],
        [field]: value,
      };

      items[itemIndex] = {
        ...items[itemIndex],
        customFieldValues: customFields,
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  const removeItemCustomField = (
    itemIndex,
    fieldIndex
  ) => {
    setForm((prev) => {
      const items = [
        ...prev.invoice.invoiceItems,
      ];

      items[itemIndex] = {
        ...items[itemIndex],
        customFieldValues:
          items[
            itemIndex
          ].customFieldValues.filter(
            (_, index) =>
              index !== fieldIndex
          ),
      };

      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          invoiceItems: items,
        },
      };
    });
  };

  // ==========================================================
  // Build payload
  // ==========================================================

  const buildPayload = () => {
    const invoice = {
      invoice: {
        code:
          form.invoice.code.trim() ||
          undefined,
        displayCode:
          form.invoice.displayCode.trim() ||
          undefined,
        channelCreated:
          form.invoice.channelCreated
            ? new Date(
                form.invoice.channelCreated
              ).toISOString()
            : undefined,
        channelCode:
          form.invoice.channelCode.trim() ||
          undefined,
        fromPartyCode:
          form.invoice.fromPartyCode.trim() ||
          undefined,
        toPartyCode:
          form.invoice.toPartyCode.trim() ||
          undefined,
        source:
          form.invoice.source || undefined,
        destinationStateCode:
          form.invoice.destinationStateCode.trim() ||
          undefined,
        destinationCountryCode:
          form.invoice.destinationCountryCode.trim() ||
          undefined,
        type:
          form.invoice.type || undefined,
        productManagementSwitchedOff:
          form.invoice
            .productManagementSwitchedOff,
        taxExempted:
          form.invoice.taxExempted,
        cformProvided:
          form.invoice.cformProvided,
        url:
          form.invoice.url.trim() ||
          undefined,
      },
    };

    // Remove undefined invoice fields
    Object.keys(invoice.invoice).forEach(
      (key) => {
        if (
          invoice.invoice[key] ===
          undefined
        ) {
          delete invoice.invoice[key];
        }
      }
    );

    // --------------------------------------------------------
    // GST e-invoice
    // --------------------------------------------------------

    if (
      form.invoice.includeGstEinvoice
    ) {
      const gst = {};

      Object.entries(
        form.invoice.gstEinvoice
      ).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          gst[key] = value;
        }
      });

      if (Object.keys(gst).length > 0) {
        invoice.invoice.gstEinvoice =
          gst;
      }
    }

    // --------------------------------------------------------
    // Invoice Items
    // --------------------------------------------------------

    invoice.invoice.invoiceItems =
      form.invoice.invoiceItems.map(
        (item) => {
          const result = {};

          const stringFields = [
            "skuCode",
            "bundleSkuCode",
            "channelProductId",
            "sellerSkuCode",
            "additionalInfo",
            "itemDetails",
          ];

          stringFields.forEach((field) => {
            if (
              item[field] !== undefined &&
              item[field] !== null &&
              String(item[field]).trim() !==
                ""
            ) {
              result[field] =
                String(
                  item[field]
                ).trim();
            }
          });

          const itemCodes =
            item.saleOrderItemCodes
              .map((code) =>
                code.trim()
              )
              .filter(Boolean);

          if (itemCodes.length > 0) {
            result.saleOrderItemCodes =
              itemCodes;
          }

          // Sale order item details
          const saleOrderItems =
            item.saleOrderItems
              .filter(
                (soi) =>
                  soi.code.trim() !== ""
              )
              .map((soi) => {
                const value = {
                  code: soi.code.trim(),
                };

                if (soi.status.trim()) {
                  value.status =
                    soi.status.trim();
                }

                if (
                  soi.shelfCode.trim()
                ) {
                  value.shelfCode =
                    soi.shelfCode.trim();
                }

                if (soi.reason.trim()) {
                  value.reason =
                    soi.reason.trim();
                }

                return value;
              });

          if (
            saleOrderItems.length > 0
          ) {
            result.saleOrderItems =
              saleOrderItems;
          }

          // Numeric fields
          const numericFields = [
            "unitPrice",
            "subtotal",
            "discount",
            "shippingCharges",
            "cashOnDeliveryCharges",
            "shippingMethodCharges",
            "total",
            "prepaidAmount",
            "voucherValue",
            "serviceTax",
            "additionalTax",
            "giftWrapCharges",
            "storeCredit",
            "quantity",
          ];

          numericFields.forEach(
            (field) => {
              if (
                item[field] !== "" &&
                item[field] !== null &&
                item[field] !== undefined
              ) {
                const value = Number(
                  item[field]
                );

                if (
                  Number.isFinite(value)
                ) {
                  result[field] =
                    value;
                }
              }
            }
          );

          // Tax
          if (
            item.includeTaxDetails
          ) {
            const tax = {};

            if (
              item.taxPercentageDetail
                .taxTypeCode
                .trim()
            ) {
              tax.taxTypeCode =
                item.taxPercentageDetail.taxTypeCode.trim();
            }

            const taxFields = [
              "vat",
              "cst",
              "cstFormc",
              "taxPercentage",
              "serviceTax",
              "additionalTax",
              "centralGst",
              "stateGst",
              "unionTerritoryGst",
              "integratedGst",
              "compensationCess",
            ];

            taxFields.forEach(
              (field) => {
                const value =
                  item
                    .taxPercentageDetail[
                    field
                  ];

                if (
                  value !== "" &&
                  value !== null &&
                  value !== undefined &&
                  Number.isFinite(
                    Number(value)
                  )
                ) {
                  tax[field] =
                    Number(value);
                }
              }
            );

            if (
              Object.keys(tax).length >
              0
            ) {
              result.taxPercentageDetail =
                tax;
            }
          }

          // Custom fields
          const customFields =
            item.customFieldValues
              .filter(
                (field) =>
                  field.name.trim() !==
                  ""
              )
              .map((field) => ({
                name: field.name.trim(),
                value:
                  field.value ?? "",
              }));

          if (
            customFields.length > 0
          ) {
            result.customFieldValues =
              customFields;
          }

          return result;
        }
      );

    return {
      facility: form.facility.trim(),
      saleOrderCode:
        form.saleOrderCode.trim(),
      ...invoice,
      shippingProviderCode:
        form.shippingProviderCode.trim() ||
        undefined,
      trackingNumber:
        form.trackingNumber.trim() ||
        undefined,
    };
  };

  // ==========================================================
  // Submit
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    if (!form.facility.trim()) {
      setError(
        "Facility code is required."
      );
      return;
    }

    if (!form.saleOrderCode.trim()) {
      setError(
        "Sale order code is required."
      );
      return;
    }

    const items =
      form.invoice.invoiceItems;

    if (!items.length) {
      setError(
        "At least one invoice item is required."
      );
      return;
    }

    const invalidItem = items.find(
      (item) =>
        item.total === "" ||
        item.quantity === ""
    );

    if (invalidItem) {
      setError(
        "Every invoice item requires Total and Quantity."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/invoices/create-with-details`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
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
      shippingProviderCode: "",
      trackingNumber: "",
      invoice:
        createEmptyInvoice(),
    });

    setResponse(null);
    setError("");
  };

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "30px auto",
        padding: "0 20px 50px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <h1
        style={{
          marginBottom: 8,
        }}
      >
        Create Invoice With Details
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: 25,
        }}
      >
        Create a Uniware invoice by
        providing detailed invoice,
        item, pricing and tax information.
      </p>

      {/* ================================================== */}
      {/* Main Details */}
      {/* ================================================== */}

      <div style={cardStyle}>
        <h2>Request Details</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <label>
              <strong>
                Facility Code *
              </strong>
            </label>

            <input
              value={form.facility}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  facility:
                    e.target.value,
                }))
              }
              placeholder="MAIN"
              style={inputStyle}
            />

            <small
              style={{
                display: "block",
                marginTop: 5,
                color: "#777",
              }}
            >
              Sent as the Uniware Facility
              header.
            </small>
          </div>

          <div>
            <label>
              <strong>
                Sale Order Code *
              </strong>
            </label>

            <input
              value={form.saleOrderCode}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  saleOrderCode:
                    e.target.value,
                }))
              }
              placeholder="SO1231100023"
              style={inputStyle}
            />
          </div>

          <div>
            <label>
              Shipping Provider Code
            </label>

            <input
              value={
                form.shippingProviderCode
              }
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  shippingProviderCode:
                    e.target.value,
                }))
              }
              placeholder="DELHIVERY"
              style={inputStyle}
            />
          </div>

          <div>
            <label>
              Tracking Number
            </label>

            <input
              value={form.trackingNumber}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  trackingNumber:
                    e.target.value,
                }))
              }
              placeholder="123456789"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* Invoice Header */}
      {/* ================================================== */}

      <div style={cardStyle}>
        <h2>Invoice Information</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {[
            ["code", "Invoice Code"],
            [
              "displayCode",
              "Display Code",
            ],
            [
              "channelCode",
              "Channel Code",
            ],
            [
              "fromPartyCode",
              "From Party Code",
            ],
            [
              "toPartyCode",
              "To Party Code",
            ],
            [
              "destinationStateCode",
              "Destination State Code",
            ],
            [
              "destinationCountryCode",
              "Destination Country Code",
            ],
            ["url", "Invoice URL"],
          ].map(([field, label]) => (
            <div key={field}>
              <label>{label}</label>

              <input
                type="text"
                value={
                  form.invoice[field]
                }
                onChange={(e) =>
                  updateInvoice(
                    field,
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>
          ))}

          <div>
            <label>
              Source
            </label>

            <select
              value={form.invoice.source}
              onChange={(e) =>
                updateInvoice(
                  "source",
                  e.target.value
                )
              }
              style={inputStyle}
            >
              <option value="SHIPPING_PACKAGE">
                SHIPPING_PACKAGE
              </option>
              <option value="PURCHASE_ORDER">
                PURCHASE_ORDER
              </option>
              <option value="GATEPASS">
                GATEPASS
              </option>
            </select>
          </div>

          <div>
            <label>
              Invoice Type
            </label>

            <select
              value={form.invoice.type}
              onChange={(e) =>
                updateInvoice(
                  "type",
                  e.target.value
                )
              }
              style={inputStyle}
            >
              <option value="SALE">
                SALE
              </option>
              <option value="PURCHASE">
                PURCHASE
              </option>
              <option value="GATEPASS">
                GATEPASS
              </option>
              <option value="SALE_RETURN">
                SALE_RETURN
              </option>
              <option value="PURCHASE_RETURN">
                PURCHASE_RETURN
              </option>
              <option value="GATEPASS_RETURN">
                GATEPASS_RETURN
              </option>
              <option value="DELIVERY_CHALLAN">
                DELIVERY_CHALLAN
              </option>
            </select>
          </div>

          <div>
            <label>
              Channel Created
            </label>

            <input
              type="datetime-local"
              value={
                form.invoice
                  .channelCreated
              }
              onChange={(e) =>
                updateInvoice(
                  "channelCreated",
                  e.target.value
                )
              }
              style={inputStyle}
            />
          </div>
        </div>

        {/* Boolean fields */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            marginTop: 20,
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={
                form.invoice
                  .productManagementSwitchedOff
              }
              onChange={(e) =>
                updateInvoice(
                  "productManagementSwitchedOff",
                  e.target.checked
                )
              }
            />{" "}
            Product Management Switched Off
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                form.invoice.taxExempted
              }
              onChange={(e) =>
                updateInvoice(
                  "taxExempted",
                  e.target.checked
                )
              }
            />{" "}
            Tax Exempted
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                form.invoice.cformProvided
              }
              onChange={(e) =>
                updateInvoice(
                  "cformProvided",
                  e.target.checked
                )
              }
            />{" "}
            C-Form Provided
          </label>
        </div>
      </div>

      {/* ================================================== */}
      {/* GST E-Invoice */}
      {/* ================================================== */}

      <div style={cardStyle}>
        <h2>GST E-Invoice</h2>

        <label>
          <input
            type="checkbox"
            checked={
              form.invoice
                .includeGstEinvoice
            }
            onChange={(e) =>
              updateInvoice(
                "includeGstEinvoice",
                e.target.checked
              )
            }
          />{" "}
          Include GST E-Invoice Details
        </label>

        {form.invoice
          .includeGstEinvoice && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
              marginTop: 18,
            }}
          >
            {[
              ["irn", "IRN"],
              ["ackNo", "Acknowledgement No"],
              [
                "ackDate",
                "Acknowledgement Date",
              ],
              [
                "signedInvoice",
                "Signed Invoice",
              ],
              [
                "signedQrCode",
                "Signed QR Code",
              ],
            ].map(([field, label]) => (
              <div key={field}>
                <label>{label}</label>

                <input
                  type={
                    field === "ackDate"
                      ? "datetime-local"
                      : "text"
                  }
                  value={
                    form.invoice
                      .gstEinvoice[field]
                  }
                  onChange={(e) =>
                    updateGstEinvoice(
                      field,
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* Invoice Items */}
      {/* ================================================== */}

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            Invoice Items
          </h2>

          <button
            type="button"
            onClick={addInvoiceItem}
            style={{
              ...buttonStyle,
              background: "#0d6efd",
              color: "#fff",
            }}
          >
            + Add Invoice Item
          </button>
        </div>

        {form.invoice.invoiceItems.map(
          (item, itemIndex) => (
            <div
              key={itemIndex}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 18,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                  }}
                >
                  Invoice Item #
                  {itemIndex + 1}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    removeInvoiceItem(
                      itemIndex
                    )
                  }
                  style={{
                    ...buttonStyle,
                    background: "#dc3545",
                    color: "#fff",
                  }}
                >
                  Remove Item
                </button>
              </div>

              {/* Product information */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["skuCode", "SKU Code"],
                  [
                    "bundleSkuCode",
                    "Bundle SKU Code",
                  ],
                  [
                    "channelProductId",
                    "Channel Product ID",
                  ],
                  [
                    "sellerSkuCode",
                    "Seller SKU Code",
                  ],
                  [
                    "additionalInfo",
                    "Additional Info",
                  ],
                  [
                    "itemDetails",
                    "Item Details",
                  ],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label>{label}</label>

                    <input
                      value={item[field]}
                      onChange={(e) =>
                        updateInvoiceItem(
                          itemIndex,
                          field,
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <h4
                style={{
                  marginTop: 22,
                }}
              >
                Pricing & Quantity
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["unitPrice", "Unit Price"],
                  ["subtotal", "Subtotal"],
                  ["discount", "Discount"],
                  [
                    "shippingCharges",
                    "Shipping Charges",
                  ],
                  [
                    "cashOnDeliveryCharges",
                    "COD Charges",
                  ],
                  [
                    "shippingMethodCharges",
                    "Shipping Method Charges",
                  ],
                  [
                    "prepaidAmount",
                    "Prepaid Amount",
                  ],
                  [
                    "voucherValue",
                    "Voucher Value",
                  ],
                  [
                    "serviceTax",
                    "Service Tax",
                  ],
                  [
                    "additionalTax",
                    "Additional Tax",
                  ],
                  [
                    "giftWrapCharges",
                    "Gift Wrap Charges",
                  ],
                  [
                    "storeCredit",
                    "Store Credit",
                  ],
                  ["total", "Total *"],
                  ["quantity", "Quantity *"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label>{label}</label>

                    <input
                      type="number"
                      step="any"
                      value={item[field]}
                      onChange={(e) =>
                        updateInvoiceItem(
                          itemIndex,
                          field,
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              {/* Sale Order Item Codes */}
              <h4
                style={{
                  marginTop: 22,
                }}
              >
                Sale Order Item Codes
              </h4>

              {item.saleOrderItemCodes.map(
                (code, codeIndex) => (
                  <div
                    key={codeIndex}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <input
                      value={code}
                      onChange={(e) =>
                        updateSaleOrderItemCode(
                          itemIndex,
                          codeIndex,
                          e.target.value
                        )
                      }
                      placeholder="SO1231100023-1"
                      style={inputStyle}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeSaleOrderItemCode(
                          itemIndex,
                          codeIndex
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

              <button
                type="button"
                onClick={() =>
                  addSaleOrderItemCode(
                    itemIndex
                  )
                }
                style={{
                  ...buttonStyle,
                  background: "#6c757d",
                  color: "#fff",
                }}
              >
                + Add SO Item Code
              </button>

              {/* Sale Order Items */}
              <h4
                style={{
                  marginTop: 22,
                }}
              >
                Sale Order Item Details
              </h4>

              {item.saleOrderItems.map(
                (soi, soiIndex) => (
                  <div
                    key={soiIndex}
                    style={{
                      border:
                        "1px solid #eee",
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {[
                        ["code", "Item Code *"],
                        ["status", "Status"],
                        [
                          "shelfCode",
                          "Shelf Code",
                        ],
                        ["reason", "Reason"],
                      ].map(
                        ([field, label]) => (
                          <div key={field}>
                            <label>
                              {label}
                            </label>

                            <input
                              value={
                                soi[field]
                              }
                              onChange={(e) =>
                                updateSaleOrderItem(
                                  itemIndex,
                                  soiIndex,
                                  field,
                                  e.target
                                    .value
                                )
                              }
                              style={
                                inputStyle
                              }
                            />
                          </div>
                        )
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "end",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            removeSaleOrderItem(
                              itemIndex,
                              soiIndex
                            )
                          }
                          style={{
                            ...buttonStyle,
                            background:
                              "#dc3545",
                            color:
                              "#fff",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  addSaleOrderItem(
                    itemIndex
                  )
                }
                style={{
                  ...buttonStyle,
                  background: "#6c757d",
                  color: "#fff",
                }}
              >
                + Add SO Item Detail
              </button>

              {/* Tax details */}
              <div
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop:
                    "1px solid #ddd",
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={
                      item.includeTaxDetails
                    }
                    onChange={(e) =>
                      updateInvoiceItem(
                        itemIndex,
                        "includeTaxDetails",
                        e.target.checked
                      )
                    }
                  />{" "}
                  Include Tax Percentage
                  Details
                </label>

                {item.includeTaxDetails && (
                  <div
                    style={{
                      marginTop: 15,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label>
                        Tax Type Code
                      </label>

                      <input
                        value={
                          item
                            .taxPercentageDetail
                            .taxTypeCode
                        }
                        onChange={(e) =>
                          updateItemTax(
                            itemIndex,
                            "taxTypeCode",
                            e.target.value
                          )
                        }
                        style={
                          inputStyle
                        }
                      />
                    </div>

                    {[
                      ["vat", "VAT"],
                      ["cst", "CST"],
                      [
                        "cstFormc",
                        "CST Form C",
                      ],
                      [
                        "taxPercentage",
                        "Tax %",
                      ],
                      [
                        "serviceTax",
                        "Service Tax",
                      ],
                      [
                        "additionalTax",
                        "Additional Tax",
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
                        <div
                          key={field}
                        >
                          <label>
                            {label}
                          </label>

                          <input
                            type="number"
                            step="any"
                            value={
                              item
                                .taxPercentageDetail[
                                field
                              ]
                            }
                            onChange={(
                              e
                            ) =>
                              updateItemTax(
                                itemIndex,
                                field,
                                e.target
                                  .value
                              )
                            }
                            style={
                              inputStyle
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Custom Fields */}
              <div
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop:
                    "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom: 10,
                  }}
                >
                  <strong>
                    Item Custom Fields
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      addItemCustomField(
                        itemIndex
                      )
                    }
                    style={{
                      ...buttonStyle,
                      background:
                        "#6c757d",
                      color: "#fff",
                    }}
                  >
                    + Add Field
                  </button>
                </div>

                {item.customFieldValues.map(
                  (
                    field,
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
                        value={field.name}
                        placeholder="Name"
                        onChange={(e) =>
                          updateItemCustomField(
                            itemIndex,
                            fieldIndex,
                            "name",
                            e.target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                      />

                      <input
                        value={
                          field.value
                        }
                        placeholder="Value"
                        onChange={(e) =>
                          updateItemCustomField(
                            itemIndex,
                            fieldIndex,
                            "value",
                            e.target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeItemCustomField(
                            itemIndex,
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
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...buttonStyle,
            background: loading
              ? "#999"
              : "#198754",
            color: "#fff",
            padding: "11px 20px",
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

      {/* ================================================== */}
      {/* Validation Error */}
      {/* ================================================== */}

      {error && (
        <div
          style={{
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
            background: "#f8d7da",
            color: "#842029",
          }}
        >
          {error}
        </div>
      )}

      {/* ================================================== */}
      {/* Response */}
      {/* ================================================== */}

      {response && (
        <div style={cardStyle}>
          <h2>Response</h2>

          <div
            style={{
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
              background:
                response.successful
                  ? "#d1e7dd"
                  : "#f8d7da",
              color:
                response.successful
                  ? "#0f5132"
                  : "#842029",
            }}
          >
            <strong>
              {response.successful
                ? "Invoice Created Successfully"
                : "Invoice Creation Failed"}
            </strong>

            {response.message && (
              <div
                style={{
                  marginTop: 5,
                }}
              >
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
                    border:
                      "1px solid #ddd",
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
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

          {/* GST E-Invoice Response */}
          {response.gstEinvoice && (
            <div
              style={{
                border:
                  "1px solid #ddd",
                borderRadius: 8,
                padding: 15,
                marginBottom: 20,
              }}
            >
              <h3>
                GST E-Invoice
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                {[
                  ["IRN", "irn"],
                  [
                    "Acknowledgement No",
                    "ackNo",
                  ],
                  [
                    "Acknowledgement Date",
                    "ackDate",
                  ],
                ].map(
                  ([label, field]) => (
                    <div key={field}>
                      <small
                        style={{
                          color: "#777",
                        }}
                      >
                        {label}
                      </small>

                      <div>
                        {response
                          .gstEinvoice[
                          field
                        ] || "N/A"}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Errors */}
          {Array.isArray(
            response.errors
          ) &&
            response.errors.length >
              0 && (
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
                        background:
                          "#f8d7da",
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
                          Code:{" "}
                          {item.code}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* Warnings */}
          {Array.isArray(
            response.warnings
          ) &&
            response.warnings.length >
              0 && (
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
                        background:
                          "#fff3cd",
                        borderRadius: 6,
                      }}
                    >
                      <strong>
                        {item.message ||
                          "Warning"}
                      </strong>

                      {item.description && (
                        <div>
                          {
                            item.description
                          }
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* Raw */}
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
                background:
                  "#f6f8fa",
                padding: 15,
                borderRadius: 8,
                overflowX: "auto",
                fontSize: 12,
                marginTop: 10,
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

export default CreateInvoiceWithDetails;