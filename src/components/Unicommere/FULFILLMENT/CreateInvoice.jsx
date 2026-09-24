import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const createEmptyTaxEntry = () => ({
  mapKey: "",
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

function CreateInvoice() {
  const [facility, setFacility] =
    useState("MAIN");

  const [shippingPackageCode, setShippingPackageCode] =
    useState("");

  const [commitBlockedInventory, setCommitBlockedInventory] =
    useState(true);

  const [invoiceCode, setInvoiceCode] =
    useState("");

  const [skipDetailing, setSkipDetailing] =
    useState(true);

  const [gstEnabled, setGstEnabled] =
    useState(false);

  const [gstEinvoice, setGstEinvoice] =
    useState({
      irn: "",
      ackNo: "",
      ackDate: "",
      signedInvoice: "",
      signedQrCode: "",
    });

  const [useTaxDetails, setUseTaxDetails] =
    useState(false);

  const [taxEntries, setTaxEntries] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  // ==========================================================
  // GST E-Invoice
  // ==========================================================

  const updateGstField = (
    field,
    value
  ) => {
    setGstEinvoice((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // TAX ENTRIES
  // ==========================================================

  const addTaxEntry = () => {
    setTaxEntries((previous) => [
      ...previous,
      createEmptyTaxEntry(),
    ]);
  };

  const removeTaxEntry = (index) => {
    setTaxEntries((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const updateTaxEntry = (
    index,
    field,
    value
  ) => {
    setTaxEntries((previous) =>
      previous.map(
        (entry, itemIndex) =>
          itemIndex === index
            ? {
                ...entry,
                [field]: value,
              }
            : entry
      )
    );
  };

  // ==========================================================
  // CUSTOM FIELDS
  // ==========================================================

  const addCustomField = (
    taxIndex
  ) => {
    setTaxEntries((previous) =>
      previous.map(
        (entry, index) =>
          index === taxIndex
            ? {
                ...entry,
                customFieldValues: [
                  ...entry.customFieldValues,
                  createEmptyCustomField(),
                ],
              }
            : entry
      )
    );
  };

  const removeCustomField = (
    taxIndex,
    fieldIndex
  ) => {
    setTaxEntries((previous) =>
      previous.map(
        (entry, index) =>
          index === taxIndex
            ? {
                ...entry,
                customFieldValues:
                  entry.customFieldValues.filter(
                    (_, currentIndex) =>
                      currentIndex !==
                      fieldIndex
                  ),
              }
            : entry
      )
    );
  };

  const updateCustomField = (
    taxIndex,
    fieldIndex,
    field,
    value
  ) => {
    setTaxEntries((previous) =>
      previous.map(
        (entry, index) =>
          index === taxIndex
            ? {
                ...entry,
                customFieldValues:
                  entry.customFieldValues.map(
                    (
                      customField,
                      currentIndex
                    ) =>
                      currentIndex ===
                      fieldIndex
                        ? {
                            ...customField,
                            [field]:
                              value,
                          }
                        : customField
                  ),
              }
            : entry
      )
    );
  };

  // ==========================================================
  // BUILD TAX MAP
  // ==========================================================

  const buildTaxMap = () => {
    const taxMap = {};

    for (const entry of taxEntries) {
      const mapKey =
        entry.mapKey.trim();

      const channelProductId =
        entry.channelProductId.trim();

      if (
        !mapKey ||
        !channelProductId
      ) {
        continue;
      }

      const tax = {
        channelProductId,
      };

      if (
        entry.additionalInfo.trim()
      ) {
        tax.additionalInfo =
          entry.additionalInfo.trim();
      }

      const numericFields = [
        "taxPercentage",
        "centralGst",
        "stateGst",
        "unionTerritoryGst",
        "integratedGst",
        "compensationCess",
      ];

      numericFields.forEach(
        (field) => {
          const value =
            entry[field];

          if (
            value !== "" &&
            value !== null &&
            value !== undefined
          ) {
            const numberValue =
              Number(value);

            if (
              Number.isFinite(
                numberValue
              )
            ) {
              tax[field] =
                numberValue;
            }
          }
        }
      );

      const customFieldValues =
        entry.customFieldValues
          .filter(
            (field) =>
              field.name.trim()
          )
          .map((field) => ({
            name:
              field.name.trim(),
            value:
              field.value ?? "",
          }));

      if (
        customFieldValues.length > 0
      ) {
        tax.customFieldValues =
          customFieldValues;
      }

      taxMap[mapKey] = tax;
    }

    return taxMap;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setResult(null);
    setErrorMessage("");

    try {
      if (!facility.trim()) {
        throw new Error(
          "Facility is required."
        );
      }

      if (
        !shippingPackageCode.trim()
      ) {
        throw new Error(
          "Shipping package code is required."
        );
      }

      // ------------------------------------------------------
      // Build request
      // ------------------------------------------------------

      const payload = {
        facility: facility.trim(),
        shippingPackageCode:
          shippingPackageCode.trim(),
        commitBlockedInventory,
        skipDetailing,
      };

      // ------------------------------------------------------
      // Invoice code
      // ------------------------------------------------------

      if (
        invoiceCode.trim()
      ) {
        payload.invoiceCode =
          invoiceCode.trim();
      }

      // ------------------------------------------------------
      // GST E-Invoice
      // ------------------------------------------------------

      if (gstEnabled) {
        const gst = {};

        const gstFields = [
          "irn",
          "ackNo",
          "ackDate",
          "signedInvoice",
          "signedQrCode",
        ];

        gstFields.forEach(
          (field) => {
            if (
              gstEinvoice[field]
                .trim()
            ) {
              gst[field] =
                gstEinvoice[field].trim();
            }
          }
        );

        if (
          Object.keys(gst).length >
          0
        ) {
          payload.gstEinvoice =
            gst;
        }
      }

      // ------------------------------------------------------
      // Tax map
      // ------------------------------------------------------

      if (useTaxDetails) {
        const taxMap =
          buildTaxMap();

        if (
          Object.keys(taxMap)
            .length > 0
        ) {
          payload.channelProductIdToTax =
            taxMap;
        }
      }

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/shipping-packages/create-invoice`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      setResult(
        response.data
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create invoice."
      );

      setResult(
        error.response?.data ||
          null
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const resetForm = () => {
    setFacility("MAIN");
    setShippingPackageCode("");
    setCommitBlockedInventory(
      true
    );
    setInvoiceCode("");
    setSkipDetailing(true);

    setGstEnabled(false);

    setGstEinvoice({
      irn: "",
      ackNo: "",
      ackDate: "",
      signedInvoice: "",
      signedQrCode: "",
    });

    setUseTaxDetails(false);
    setTaxEntries([]);

    setLoading(false);
    setResult(null);
    setErrorMessage("");
  };

  // ==========================================================
  // RESPONSE
  // ==========================================================

  const gstResponse =
    result?.gstEinvoice;

  return (
    <div
      style={{
        maxWidth: "1400px",
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
            "1px solid #ddd",
          borderRadius: "10px",
          padding: "24px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "8px",
          }}
        >
          Create Invoice
        </h1>

        <p
          style={{
            marginTop: 0,
            color: "#666",
            lineHeight: 1.6,
          }}
        >
          Create an invoice for an existing
          Uniware shipping package.
        </p>

        {/* API information */}
        <div
          style={{
            padding: "14px",
            marginBottom: "24px",
            background: "#f5f9ff",
            border:
              "1px solid #c9dcf5",
            borderRadius: "6px",
            lineHeight: 1.7,
            fontSize: "14px",
          }}
        >
          <strong>
            Uniware Level:
          </strong>{" "}
          Facility
          <br />

          <strong>
            Facility Header:
          </strong>{" "}
          Required
          <br />

          <strong>
            Endpoint:
          </strong>{" "}
          shippingPackage/createInvoice
          <br />

          <strong>
            Required:
          </strong>{" "}
          Shipping Package Code
        </div>

        <form
          onSubmit={handleSubmit}
        >
          {/* ================================================= */}
          {/* BASIC DETAILS */}
          {/* ================================================= */}

          <section
            style={sectionStyle}
          >
            <h2
              style={sectionTitleStyle}
            >
              Invoice Details
            </h2>

            <div
              style={gridStyle}
            >
              <Field
                label="Facility *"
                value={facility}
                onChange={setFacility}
                placeholder="MAIN"
                help="Sent as the Uniware Facility header."
              />

              <Field
                label="Shipping Package Code *"
                value={
                  shippingPackageCode
                }
                onChange={
                  setShippingPackageCode
                }
                placeholder="DSKS00002"
              />

              <Field
                label="Invoice Code"
                value={invoiceCode}
                onChange={setInvoiceCode}
                placeholder="INV-00001"
                help="Optional."
              />
            </div>
          </section>

          {/* ================================================= */}
          {/* OPTIONS */}
          {/* ================================================= */}

          <section
            style={sectionStyle}
          >
            <h2
              style={sectionTitleStyle}
            >
              Invoice Options
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "14px",
              }}
            >
              <BooleanCard
                label="Commit Blocked Inventory"
                description="Uniware default is true."
                checked={
                  commitBlockedInventory
                }
                onChange={
                  setCommitBlockedInventory
                }
              />

              <BooleanCard
                label="Skip Detailing"
                description="Uniware default is true."
                checked={
                  skipDetailing
                }
                onChange={
                  setSkipDetailing
                }
              />
            </div>
          </section>

          {/* ================================================= */}
          {/* GST E-INVOICE */}
          {/* ================================================= */}

          <section
            style={sectionStyle}
          >
            <div
              style={
                sectionHeaderStyle
              }
            >
              <div>
                <h2
                  style={{
                    ...sectionTitleStyle,
                    marginBottom:
                      "4px",
                  }}
                >
                  GST E-Invoice
                </h2>

                <div
                  style={{
                    color: "#777",
                    fontSize:
                      "13px",
                  }}
                >
                  Optional IRN,
                  acknowledgement and
                  signed invoice details.
                </div>
              </div>

              <label
                style={
                  switchLabelStyle
                }
              >
                <input
                  type="checkbox"
                  checked={
                    gstEnabled
                  }
                  onChange={(e) =>
                    setGstEnabled(
                      e.target.checked
                    )
                  }
                />
                Include GST E-Invoice
              </label>
            </div>

            {gstEnabled && (
              <div
                style={gridStyle}
              >
                <Field
                  label="IRN"
                  value={
                    gstEinvoice.irn
                  }
                  onChange={(value) =>
                    updateGstField(
                      "irn",
                      value
                    )
                  }
                  placeholder="Invoice Reference Number"
                />

                <Field
                  label="Acknowledgement No."
                  value={
                    gstEinvoice.ackNo
                  }
                  onChange={(value) =>
                    updateGstField(
                      "ackNo",
                      value
                    )
                  }
                  placeholder="ACK123456"
                />

                <Field
                  label="Acknowledgement Date"
                  value={
                    gstEinvoice.ackDate
                  }
                  onChange={(value) =>
                    updateGstField(
                      "ackDate",
                      value
                    )
                  }
                  placeholder="2026-09-24"
                />

                <TextArea
                  label="Signed Invoice"
                  value={
                    gstEinvoice.signedInvoice
                  }
                  onChange={(value) =>
                    updateGstField(
                      "signedInvoice",
                      value
                    )
                  }
                  placeholder="Signed invoice value"
                />

                <TextArea
                  label="Signed QR Code"
                  value={
                    gstEinvoice.signedQrCode
                  }
                  onChange={(value) =>
                    updateGstField(
                      "signedQrCode",
                      value
                    )
                  }
                  placeholder="Signed QR code value"
                />
              </div>
            )}
          </section>

          {/* ================================================= */}
          {/* CHANNEL PRODUCT TAX */}
          {/* ================================================= */}

          <section
            style={sectionStyle}
          >
            <div
              style={
                sectionHeaderStyle
              }
            >
              <div>
                <h2
                  style={{
                    ...sectionTitleStyle,
                    marginBottom:
                      "4px",
                  }}
                >
                  Channel Product Tax
                </h2>

                <div
                  style={{
                    color: "#777",
                    fontSize:
                      "13px",
                  }}
                >
                  Optional tax details
                  mapped by channel
                  product ID.
                </div>
              </div>

              <label
                style={
                  switchLabelStyle
                }
              >
                <input
                  type="checkbox"
                  checked={
                    useTaxDetails
                  }
                  onChange={(e) =>
                    setUseTaxDetails(
                      e.target.checked
                    )
                  }
                />
                Include Tax Details
              </label>
            </div>

            {useTaxDetails && (
              <div>
                <button
                  type="button"
                  onClick={
                    addTaxEntry
                  }
                  style={
                    secondaryButtonStyle
                  }
                >
                  + Add Product Tax
                </button>

                {taxEntries.length ===
                  0 && (
                  <div
                    style={{
                      marginTop:
                        "15px",
                      padding:
                        "15px",
                      border:
                        "1px dashed #bbb",
                      borderRadius:
                        "6px",
                      color: "#777",
                    }}
                  >
                    No tax entries
                    added.
                  </div>
                )}

                {taxEntries.map(
                  (
                    entry,
                    index
                  ) => (
                    <div
                      key={index}
                      style={{
                        marginTop:
                          "18px",
                        padding:
                          "18px",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "8px",
                        background:
                          "#fafafa",
                      }}
                    >
                      <div
                        style={
                          sectionHeaderStyle
                        }
                      >
                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          Product Tax #
                          {index + 1}
                        </h3>

                        <button
                          type="button"
                          onClick={() =>
                            removeTaxEntry(
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

                      <div
                        style={gridStyle}
                      >
                        <Field
                          label="Map Key *"
                          value={
                            entry.mapKey
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "mapKey",
                              value
                            )
                          }
                          placeholder="TESTB"
                          help="Object key used in channelProductIdToTax."
                        />

                        <Field
                          label="Channel Product ID *"
                          value={
                            entry.channelProductId
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "channelProductId",
                              value
                            )
                          }
                          placeholder="TESTB"
                        />

                        <Field
                          label="Additional Info"
                          value={
                            entry.additionalInfo
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "additionalInfo",
                              value
                            )
                          }
                          placeholder="Optional"
                        />

                        <NumberField
                          label="Tax %"
                          value={
                            entry.taxPercentage
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "taxPercentage",
                              value
                            )
                          }
                        />

                        <NumberField
                          label="Central GST"
                          value={
                            entry.centralGst
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "centralGst",
                              value
                            )
                          }
                        />

                        <NumberField
                          label="State GST"
                          value={
                            entry.stateGst
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "stateGst",
                              value
                            )
                          }
                        />

                        <NumberField
                          label="UT GST"
                          value={
                            entry.unionTerritoryGst
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "unionTerritoryGst",
                              value
                            )
                          }
                        />

                        <NumberField
                          label="Integrated GST"
                          value={
                            entry.integratedGst
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "integratedGst",
                              value
                            )
                          }
                        />

                        <NumberField
                          label="Compensation Cess"
                          value={
                            entry.compensationCess
                          }
                          onChange={(
                            value
                          ) =>
                            updateTaxEntry(
                              index,
                              "compensationCess",
                              value
                            )
                          }
                        />
                      </div>

                      {/* Custom fields */}
                      <div
                        style={{
                          marginTop:
                            "18px",
                        }}
                      >
                        <div
                          style={
                            sectionHeaderStyle
                          }
                        >
                          <h4
                            style={{
                              margin: 0,
                            }}
                          >
                            Custom Fields
                          </h4>

                          <button
                            type="button"
                            onClick={() =>
                              addCustomField(
                                index
                              )
                            }
                            style={
                              smallButtonStyle
                            }
                          >
                            + Add Field
                          </button>
                        </div>

                        {entry.customFieldValues.map(
                          (
                            field,
                            fieldIndex
                          ) => (
                            <div
                              key={
                                fieldIndex
                              }
                              style={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "1fr 1fr auto",
                                gap: "10px",
                                marginTop:
                                  "10px",
                              }}
                            >
                              <input
                                value={
                                  field.name
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateCustomField(
                                    index,
                                    fieldIndex,
                                    "name",
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="Name"
                                style={
                                  inputStyle
                                }
                              />

                              <input
                                value={
                                  field.value
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateCustomField(
                                    index,
                                    fieldIndex,
                                    "value",
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="Value"
                                style={
                                  inputStyle
                                }
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeCustomField(
                                    index,
                                    fieldIndex
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
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

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
              style={
                primaryButtonStyle
              }
            >
              {loading
                ? "Creating Invoice..."
                : "Create Invoice"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              style={
                resetButtonStyle
              }
            >
              Reset
            </button>
          </div>
        </form>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {errorMessage && (
          <div
            style={{
              marginTop: "24px",
              padding: "14px",
              background: "#fff5f5",
              border:
                "1px solid #f0b4b4",
              borderRadius: "6px",
              color: "#b42318",
            }}
          >
            <strong>
              Error:
            </strong>{" "}
            {errorMessage}
          </div>
        )}

        {/* ================================================== */}
        {/* RESPONSE */}
        {/* ================================================== */}

        {result && (
          <div
            style={{
              marginTop: "30px",
            }}
          >
            <h2>
              Invoice Result
            </h2>

            <div
              style={{
                padding: "16px",
                marginBottom:
                  "20px",
                background:
                  result.successful
                    ? "#f0fdf4"
                    : "#fff5f5",
                border:
                  result.successful
                    ? "1px solid #b7e4c7"
                    : "1px solid #f0b4b4",
                borderRadius:
                  "7px",
              }}
            >
              <strong>
                {result.successful
                  ? "Invoice created successfully"
                  : "Invoice creation failed"}
              </strong>

              {result.message && (
                <div
                  style={{
                    marginTop:
                      "5px",
                  }}
                >
                  {result.message}
                </div>
              )}
            </div>

            {/* Invoice summary */}
            <section
              style={sectionStyle}
            >
              <h3
                style={
                  sectionTitleStyle
                }
              >
                Invoice Information
              </h3>

              <div
                style={
                  infoGridStyle
                }
              >
                <InfoItem
                  label="Invoice Code"
                  value={
                    result.invoiceCode
                  }
                />

                <InfoItem
                  label="Invoice Display Code"
                  value={
                    result.invoiceDisplayCode
                  }
                />

                <InfoItem
                  label="Shipping Package Code"
                  value={
                    result.shippingPackageCode
                  }
                />

                <InfoItem
                  label="Package Status"
                  value={
                    result.shippingPackageStatusCode
                  }
                />

                <InfoItem
                  label="GST Number"
                  value={
                    result.gstNumber
                  }
                />

                <InfoItem
                  label="Auto Print Enabled"
                  value={
                    result.autoPrintEnabled ===
                    true
                      ? "Yes"
                      : result.autoPrintEnabled ===
                        false
                      ? "No"
                      : "N/A"
                  }
                />

                <InfoItem
                  label="Additional Info"
                  value={
                    result.additionalInfo
                  }
                />

                <InfoItem
                  label="Putback Items"
                  value={
                    result.putbackItems
                  }
                />
              </div>
            </section>

            {/* Shipping label */}
            {result.shippingLabelLink && (
              <section
                style={sectionStyle}
              >
                <h3
                  style={
                    sectionTitleStyle
                  }
                >
                  Shipping Label
                </h3>

                <a
                  href={
                    result.shippingLabelLink
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color:
                      "#1976d2",
                    fontWeight:
                      "600",
                  }}
                >
                  Open Shipping Label
                </a>
              </section>
            )}

            {/* GST E-Invoice response */}
            {gstResponse && (
              <section
                style={sectionStyle}
              >
                <h3
                  style={
                    sectionTitleStyle
                  }
                >
                  GST E-Invoice Response
                </h3>

                <div
                  style={
                    infoGridStyle
                  }
                >
                  <InfoItem
                    label="IRN"
                    value={
                      gstResponse.irn
                    }
                  />

                  <InfoItem
                    label="Acknowledgement No."
                    value={
                      gstResponse.ackNo
                    }
                  />

                  <InfoItem
                    label="Acknowledgement Date"
                    value={
                      gstResponse.ackDate
                    }
                  />
                </div>

                {gstResponse.signedInvoice && (
                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >
                    <strong>
                      Signed Invoice
                    </strong>

                    <pre
                      style={
                        preStyle
                      }
                    >
                      {
                        gstResponse.signedInvoice
                      }
                    </pre>
                  </div>
                )}

                {gstResponse.signedQrCode && (
                  <div
                    style={{
                      marginTop:
                        "15px",
                    }}
                  >
                    <strong>
                      Signed QR Code
                    </strong>

                    <pre
                      style={
                        preStyle
                      }
                    >
                      {
                        gstResponse.signedQrCode
                      }
                    </pre>
                  </div>
                )}
              </section>
            )}

            {/* Errors */}
            {Array.isArray(
              result.errors
            ) &&
              result.errors.length >
                0 && (
                <section
                  style={sectionStyle}
                >
                  <h3
                    style={
                      sectionTitleStyle
                    }
                  >
                    Errors
                  </h3>

                  {result.errors.map(
                    (
                      error,
                      index
                    ) => (
                      <div
                        key={index}
                        style={
                          errorStyle
                        }
                      >
                        <strong>
                          {error.fieldName ||
                            "Error"}
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "4px",
                          }}
                        >
                          {error.message ||
                            error.description ||
                            "Unknown error"}
                        </div>

                        {error.code !==
                          undefined && (
                          <small>
                            Code:{" "}
                            {
                              error.code
                            }
                          </small>
                        )}
                      </div>
                    )
                  )}
                </section>
              )}

            {/* Warnings */}
            {Array.isArray(
              result.warnings
            ) &&
              result.warnings.length >
                0 && (
                <section
                  style={sectionStyle}
                >
                  <h3
                    style={
                      sectionTitleStyle
                    }
                  >
                    Warnings
                  </h3>

                  {result.warnings.map(
                    (
                      warning,
                      index
                    ) => (
                      <div
                        key={index}
                        style={
                          warningStyle
                        }
                      >
                        <strong>
                          {warning.message ||
                            warning.description ||
                            "Warning"}
                        </strong>
                      </div>
                    )
                  )}
                </section>
              )}

            {/* Raw response */}
            <details
              style={{
                marginTop:
                  "24px",
              }}
            >
              <summary
                style={{
                  cursor:
                    "pointer",
                  fontWeight:
                    "700",
                }}
              >
                Raw Response
              </summary>

              <pre
                style={
                  preStyle
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
        )}
      </div>
    </div>
  );
}

// ============================================================
// Reusable Components
// ============================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  help,
}) {
  return (
    <div>
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        style={inputStyle}
      />

      {help && (
        <small
          style={helpStyle}
        >
          {help}
        </small>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={inputStyle}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div
      style={{
        gridColumn:
          "span 2",
      }}
    >
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        rows={5}
        style={{
          ...inputStyle,
          resize: "vertical",
        }}
      />
    </div>
  );
}

function BooleanCard({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems:
          "flex-start",
        gap: "10px",
        padding: "14px",
        border:
          "1px solid #ddd",
        borderRadius: "7px",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(
            e.target.checked
          )
        }
        style={{
          marginTop: "3px",
        }}
      />

      <div>
        <div
          style={{
            fontWeight:
              "600",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: "4px",
            color: "#777",
            fontSize:
              "12px",
          }}
        >
          {description}
        </div>
      </div>
    </label>
  );
}

function InfoItem({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding:
          "10px 12px",
        background:
          "#fafafa",
        border:
          "1px solid #e2e2e2",
        borderRadius:
          "6px",
      }}
    >
      <div
        style={{
          fontSize:
            "11px",
          color: "#777",
          textTransform:
            "uppercase",
          marginBottom:
            "5px",
          fontWeight:
            "600",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize:
            "14px",
          fontWeight:
            "500",
          wordBreak:
            "break-word",
        }}
      >
        {value === null ||
        value === undefined ||
        value === ""
          ? "N/A"
          : typeof value ===
            "object"
          ? JSON.stringify(
              value
            )
          : String(value)}
      </div>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const sectionStyle = {
  marginTop: "24px",
  padding: "18px",
  border:
    "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom:
    "16px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems:
    "center",
  gap: "12px",
  flexWrap:
    "wrap",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "10px",
};

const labelStyle = {
  display: "block",
  marginBottom:
    "6px",
  fontWeight:
    "600",
  fontSize:
    "14px",
};

const inputStyle = {
  width: "100%",
  boxSizing:
    "border-box",
  padding:
    "10px 12px",
  border:
    "1px solid #ccc",
  borderRadius:
    "6px",
  fontSize:
    "14px",
  background:
    "#fff",
};

const helpStyle = {
  display: "block",
  marginTop:
    "5px",
  color: "#777",
  fontSize:
    "12px",
};

const switchLabelStyle = {
  display: "flex",
  alignItems:
    "center",
  gap: "8px",
  fontWeight:
    "600",
  cursor:
    "pointer",
};

const primaryButtonStyle = {
  padding:
    "11px 20px",
  border: "none",
  borderRadius:
    "6px",
  background:
    "#1976d2",
  color: "#fff",
  cursor:
    "pointer",
  fontWeight:
    "600",
};

const resetButtonStyle = {
  padding:
    "11px 20px",
  border:
    "1px solid #999",
  borderRadius:
    "6px",
  background:
    "#fff",
  color: "#333",
  cursor:
    "pointer",
};

const secondaryButtonStyle = {
  padding:
    "9px 14px",
  border:
    "1px solid #1976d2",
  borderRadius:
    "6px",
  background:
    "#fff",
  color:
    "#1976d2",
  cursor:
    "pointer",
  fontWeight:
    "600",
};

const smallButtonStyle = {
  padding:
    "7px 11px",
  border:
    "1px solid #1976d2",
  borderRadius:
    "5px",
  background:
    "#fff",
  color:
    "#1976d2",
  cursor:
    "pointer",
  fontWeight:
    "600",
};

const dangerButtonStyle = {
  padding:
    "7px 11px",
  border:
    "1px solid #d92d20",
  borderRadius:
    "5px",
  background:
    "#fff",
  color:
    "#d92d20",
  cursor:
    "pointer",
  fontWeight:
    "600",
};

const preStyle = {
  marginTop:
    "10px",
  padding:
    "15px",
  background:
    "#f6f6f6",
  borderRadius:
    "6px",
  overflow:
    "auto",
  fontSize:
    "12px",
  maxHeight:
    "500px",
  whiteSpace:
    "pre-wrap",
  wordBreak:
    "break-word",
};

const errorStyle = {
  padding:
    "12px",
  marginBottom:
    "8px",
  background:
    "#fff5f5",
  border:
    "1px solid #f0b4b4",
  borderRadius:
    "6px",
  color:
    "#b42318",
};

const warningStyle = {
  padding:
    "12px",
  marginBottom:
    "8px",
  background:
    "#fffbea",
  border:
    "1px solid #eadb8c",
  borderRadius:
    "6px",
};

export default CreateInvoice;