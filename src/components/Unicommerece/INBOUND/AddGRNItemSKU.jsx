import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const AddGRNItemSKU = () => {
  const [facility, setFacility] = useState("");
  const [inflowReceiptCode, setInflowReceiptCode] =
    useState("");

  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [additionalCost, setAdditionalCost] =
    useState("");

  const [skuCode, setSkuCode] = useState("");

  const [manufacturingDate, setManufacturingDate] =
    useState("");

  const [expiry, setExpiry] = useState("");

  // ------------------------------------------
  // Traceability type
  // ------------------------------------------
  const [traceabilityType, setTraceabilityType] =
    useState("SKU");

  // ------------------------------------------
  // Batch details
  // ------------------------------------------
  const [batchExpiryDate, setBatchExpiryDate] =
    useState("");

  const [batchMfd, setBatchMfd] = useState("");

  const [batchCost, setBatchCost] = useState("");
  const [batchMrp, setBatchMrp] = useState("");

  const [vendorCode, setVendorCode] =
    useState("");

  const [vendorBatchNumber, setVendorBatchNumber] =
    useState("");

  // ------------------------------------------
  // ITEM traceability
  // ------------------------------------------
  const [itemDTOs, setItemDTOs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] =
    useState(null);

  // ------------------------------------------
  // Add ITEM traceability row
  // ------------------------------------------
  const addItemDTO = () => {
    setItemDTOs((prev) => [
      ...prev,
      {
        code: "",
        itemDetails: "",
      },
    ]);
  };

  // ------------------------------------------
  // Update ITEM row
  // ------------------------------------------
  const updateItemDTO = (
    index,
    field,
    value
  ) => {
    setItemDTOs((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ------------------------------------------
  // Remove ITEM row
  // ------------------------------------------
  const removeItemDTO = (index) => {
    setItemDTOs((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ------------------------------------------
  // Build payload
  // ------------------------------------------
  const buildPayload = () => {
    const inflowReceiptItem = {
      quantity: Number(quantity),
    };

    if (unitPrice !== "") {
      inflowReceiptItem.unitPrice =
        Number(unitPrice);
    }

    if (additionalCost !== "") {
      inflowReceiptItem.additionalCost =
        Number(additionalCost);
    }

    if (skuCode.trim()) {
      inflowReceiptItem.skuCode =
        skuCode.trim();
    }

    if (manufacturingDate) {
      inflowReceiptItem.manufacturingDate =
        manufacturingDate;
    }

    if (expiry) {
      inflowReceiptItem.expiry = expiry;
    }

    // ----------------------------------------
    // Batch
    // ----------------------------------------
    if (traceabilityType === "BATCH") {
      const batchFields = {};

      if (batchExpiryDate) {
        batchFields.expiryDate =
          batchExpiryDate;
      }

      if (batchMfd) {
        batchFields.mfd = batchMfd;
      }

      if (batchCost !== "") {
        batchFields.cost =
          Number(batchCost);
      }

      if (batchMrp !== "") {
        batchFields.mrp =
          Number(batchMrp);
      }

      if (vendorCode.trim()) {
        batchFields.vendorCode =
          vendorCode.trim();
      }

      if (vendorBatchNumber.trim()) {
        batchFields.vendorBatchNumber =
          vendorBatchNumber.trim();
      }

      inflowReceiptItem.wsBatchDetail = {
        wsBatchGroupFieldValue:
          batchFields,
      };
    }

    // ----------------------------------------
    // ITEM traceability
    // ----------------------------------------
    if (
      traceabilityType === "ITEM"
    ) {
      inflowReceiptItem.itemDTOs =
        itemDTOs
          .filter(
            (item) =>
              item.code.trim()
          )
          .map((item) => ({
            code: item.code.trim(),
            itemDetails:
              item.itemDetails || "",
          }));
    }

    return {
      facility: facility.trim(),

      inflowReceiptCode:
        inflowReceiptCode.trim(),

      inflowReceiptItem,
    };
  };

  // ------------------------------------------
  // Submit
  // ------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!facility.trim()) {
      setError(
        "Please enter Facility Code."
      );
      return;
    }

    if (!inflowReceiptCode.trim()) {
      setError(
        "Please enter Inflow Receipt / GRN Code."
      );
      return;
    }

    if (
      !quantity ||
      Number(quantity) <= 0 ||
      !Number.isInteger(Number(quantity))
    ) {
      setError(
        "Quantity must be a positive integer."
      );
      return;
    }

    if (
      unitPrice !== "" &&
      Number.isNaN(Number(unitPrice))
    ) {
      setError(
        "Unit Price must be a valid number."
      );
      return;
    }

    if (
      additionalCost !== "" &&
      Number.isNaN(Number(additionalCost))
    ) {
      setError(
        "Additional Cost must be a valid number."
      );
      return;
    }

    // ----------------------------------------
    // Batch validation
    // ----------------------------------------
    if (
      traceabilityType === "BATCH"
    ) {
      if (
        batchCost !== "" &&
        Number.isNaN(Number(batchCost))
      ) {
        setError(
          "Batch Cost must be a valid number."
        );
        return;
      }

      if (
        batchMrp !== "" &&
        Number.isNaN(Number(batchMrp))
      ) {
        setError(
          "Batch MRP must be a valid number."
        );
        return;
      }
    }

    // ----------------------------------------
    // ITEM validation
    // ----------------------------------------
    if (
      traceabilityType === "ITEM"
    ) {
      if (itemDTOs.length === 0) {
        setError(
          "Add at least one ITEM traceability record."
        );
        return;
      }

      const invalidItem =
        itemDTOs.find(
          (item) =>
            !item.code.trim()
        );

      if (invalidItem) {
        setError(
          "Every ITEM traceability record must have an Item Code."
        );
        return;
      }

      if (
        itemDTOs.length !==
        Number(quantity)
      ) {
        setError(
          `ITEM traceability requires ${quantity} item record(s), but ${itemDTOs.length} were added.`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const payload = buildPayload();

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders/grn/add-item-sku`,
        payload
      );

      const data = result.data;

      setResponse(data);

      if (!data.successful) {
        setError(
          data.message ||
            "Uniware could not add the SKU/item to the GRN."
        );
      }
    } catch (err) {
      console.error(err);

      const apiData =
        err.response?.data;

      setError(
        apiData?.message ||
          err.message ||
          "Failed to add item SKU to GRN."
      );

      setResponse(
        apiData || null
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // Clear
  // ------------------------------------------
  const handleClear = () => {
    setFacility("");
    setInflowReceiptCode("");

    setQuantity(1);
    setUnitPrice("");
    setAdditionalCost("");

    setSkuCode("");

    setManufacturingDate("");
    setExpiry("");

    setTraceabilityType("SKU");

    setBatchExpiryDate("");
    setBatchMfd("");
    setBatchCost("");
    setBatchMrp("");
    setVendorCode("");
    setVendorBatchNumber("");

    setItemDTOs([]);

    setLoading(false);
    setError("");
    setResponse(null);
  };

  const item =
    response?.inflowReceiptItemDTO;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Add Item SKU in GRN
          </h1>

          <p style={styles.subtitle}>
            Add SKU, batch, or ITEM traceability
            details to an existing Uniware GRN.
          </p>
        </div>

        {/* Main Form */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>

            {/* GRN Details */}
            <div style={styles.sectionHeader}>
              GRN Details
            </div>

            <div style={styles.formGrid}>

              <div>
                <label style={styles.label}>
                  Facility Code *
                </label>

                <input
                  type="text"
                  value={facility}
                  onChange={(e) =>
                    setFacility(
                      e.target.value
                    )
                  }
                  placeholder="Example: MAIN"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Inflow Receipt / GRN Code *
                </label>

                <input
                  type="text"
                  value={
                    inflowReceiptCode
                  }
                  onChange={(e) =>
                    setInflowReceiptCode(
                      e.target.value
                    )
                  }
                  placeholder="Example: IR-000123"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Item Details */}
            <div
              style={{
                ...styles.sectionHeader,
                marginTop: "30px",
              }}
            >
              Item Details
            </div>

            <div style={styles.formGrid}>

              <div>
                <label style={styles.label}>
                  Quantity *
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Unit Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) =>
                    setUnitPrice(
                      e.target.value
                    )
                  }
                  placeholder="Example: 500"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Additional Cost
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={additionalCost}
                  onChange={(e) =>
                    setAdditionalCost(
                      e.target.value
                    )
                  }
                  placeholder="Example: 20"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  SKU Code
                </label>

                <input
                  type="text"
                  value={skuCode}
                  onChange={(e) =>
                    setSkuCode(
                      e.target.value
                    )
                  }
                  placeholder="Example: BD-Floral-3"
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  Marketplace SKU code.
                </div>
              </div>

              <div>
                <label style={styles.label}>
                  Manufacturing Date
                </label>

                <input
                  type="datetime-local"
                  value={
                    manufacturingDate
                  }
                  onChange={(e) =>
                    setManufacturingDate(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Expiry Date
                </label>

                <input
                  type="datetime-local"
                  value={expiry}
                  onChange={(e) =>
                    setExpiry(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>
            </div>

            {/* Traceability */}
            <div
              style={{
                ...styles.sectionHeader,
                marginTop: "30px",
              }}
            >
              Traceability Type
            </div>

            <div style={styles.traceabilityGrid}>

              <label
                style={{
                  ...styles.traceCard,
                  ...(traceabilityType ===
                  "SKU"
                    ? styles.traceCardActive
                    : {}),
                }}
              >
                <input
                  type="radio"
                  name="traceability"
                  value="SKU"
                  checked={
                    traceabilityType ===
                    "SKU"
                  }
                  onChange={(e) =>
                    setTraceabilityType(
                      e.target.value
                    )
                  }
                />

                <div>
                  <strong>
                    SKU
                  </strong>

                  <p>
                    Add standard SKU details.
                  </p>
                </div>
              </label>

              <label
                style={{
                  ...styles.traceCard,
                  ...(traceabilityType ===
                  "BATCH"
                    ? styles.traceCardActive
                    : {}),
                }}
              >
                <input
                  type="radio"
                  name="traceability"
                  value="BATCH"
                  checked={
                    traceabilityType ===
                    "BATCH"
                  }
                  onChange={(e) =>
                    setTraceabilityType(
                      e.target.value
                    )
                  }
                />

                <div>
                  <strong>
                    Batch
                  </strong>

                  <p>
                    Add batch-level
                    traceability.
                  </p>
                </div>
              </label>

              <label
                style={{
                  ...styles.traceCard,
                  ...(traceabilityType ===
                  "ITEM"
                    ? styles.traceCardActive
                    : {}),
                }}
              >
                <input
                  type="radio"
                  name="traceability"
                  value="ITEM"
                  checked={
                    traceabilityType ===
                    "ITEM"
                  }
                  onChange={(e) =>
                    setTraceabilityType(
                      e.target.value
                    )
                  }
                />

                <div>
                  <strong>
                    ITEM
                  </strong>

                  <p>
                    Track individual item
                    codes.
                  </p>
                </div>
              </label>
            </div>

            {/* Batch Section */}
            {traceabilityType ===
              "BATCH" && (
              <div style={styles.subCard}>

                <div
                  style={styles.subCardTitle}
                >
                  Batch Details
                </div>

                <div
                  style={styles.formGrid}
                >

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Batch Expiry Date
                    </label>

                    <input
                      type="datetime-local"
                      value={
                        batchExpiryDate
                      }
                      onChange={(e) =>
                        setBatchExpiryDate(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Batch Manufacturing Date
                    </label>

                    <input
                      type="datetime-local"
                      value={batchMfd}
                      onChange={(e) =>
                        setBatchMfd(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Batch Cost
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={batchCost}
                      onChange={(e) =>
                        setBatchCost(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Batch MRP
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={batchMrp}
                      onChange={(e) =>
                        setBatchMrp(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Vendor Code
                    </label>

                    <input
                      type="text"
                      value={vendorCode}
                      onChange={(e) =>
                        setVendorCode(
                          e.target.value
                        )
                      }
                      placeholder="Example: VENDOR001"
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Vendor Batch Number
                    </label>

                    <input
                      type="text"
                      value={
                        vendorBatchNumber
                      }
                      onChange={(e) =>
                        setVendorBatchNumber(
                          e.target.value
                        )
                      }
                      placeholder="Example: BATCH-001"
                      style={
                        styles.input
                      }
                    />
                  </div>

                </div>
              </div>
            )}

            {/* ITEM Traceability */}
            {traceabilityType ===
              "ITEM" && (
              <div style={styles.subCard}>

                <div
                  style={
                    styles.itemHeader
                  }
                >
                  <div>
                    <div
                      style={
                        styles.subCardTitle
                      }
                    >
                      ITEM Traceability
                    </div>

                    <div
                      style={
                        styles.helpText
                      }
                    >
                      Add one ITEM record for
                      each physical item.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addItemDTO
                    }
                    style={
                      styles.addButton
                    }
                  >
                    + Add Item
                  </button>
                </div>

                {itemDTOs.length ===
                  0 && (
                  <div
                    style={
                      styles.emptyBox
                    }
                  >
                    No item traceability
                    records added.
                  </div>
                )}

                {itemDTOs.map(
                  (itemDTO, index) => (
                    <div
                      key={index}
                      style={
                        styles.itemRow
                      }
                    >
                      <div
                        style={{
                          width: "45%",
                        }}
                      >
                        <label
                          style={
                            styles.smallLabel
                          }
                        >
                          Item Code *
                        </label>

                        <input
                          type="text"
                          value={
                            itemDTO.code
                          }
                          onChange={(e) =>
                            updateItemDTO(
                              index,
                              "code",
                              e.target
                                .value
                            )
                          }
                          placeholder="Example: ITEM001"
                          style={
                            styles.input
                          }
                        />
                      </div>

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <label
                          style={
                            styles.smallLabel
                          }
                        >
                          Item Details
                        </label>

                        <input
                          type="text"
                          value={
                            itemDTO.itemDetails
                          }
                          onChange={(e) =>
                            updateItemDTO(
                              index,
                              "itemDetails",
                              e.target
                                .value
                            )
                          }
                          placeholder="Example: Serial number / asset details"
                          style={
                            styles.input
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItemDTO(
                            index
                          )
                        }
                        style={
                          styles.removeButton
                        }
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}

                <div
                  style={
                    styles.quantityHint
                  }
                >
                  Quantity:{" "}
                  <strong>
                    {quantity}
                  </strong>{" "}
                  | Item records:{" "}
                  <strong>
                    {itemDTOs.length}
                  </strong>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={styles.buttonRow}>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.primaryButton,
                  ...(loading
                    ? styles.disabledButton
                    : {}),
                }}
              >
                {loading
                  ? "Adding Item..."
                  : "Add Item SKU to GRN"}
              </button>

              <button
                type="button"
                onClick={
                  handleClear
                }
                style={
                  styles.secondaryButton
                }
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div
            style={styles.errorBox}
          >
            <div
              style={
                styles.errorTitle
              }
            >
              Error
            </div>

            <div>{error}</div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div>

            <div
              style={{
                ...styles.messageBox,
                ...(response.successful
                  ? styles.successBox
                  : styles.errorMessageBox),
              }}
            >
              <div
                style={
                  styles.responseTitle
                }
              >
                {response.successful
                  ? "GRN Item Added Successfully"
                  : "Add GRN Item Failed"}
              </div>

              {response.message && (
                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  {response.message}
                </div>
              )}
            </div>

            {/* Returned Item */}
            {item && (
              <div
                style={styles.card}
              >
                <div
                  style={
                    styles.sectionHeader
                  }
                >
                  GRN Item Response
                </div>

                <div
                  style={
                    styles.detailsGrid
                  }
                >
                  <Detail
                    label="GRN Item ID"
                    value={item.id}
                  />

                  <Detail
                    label="Purchase Order Item ID"
                    value={
                      item.purchaseOrderItemId
                    }
                  />

                  <Detail
                    label="Item SKU"
                    value={
                      item.itemSKU
                    }
                  />

                  <Detail
                    label="Item Type"
                    value={
                      item.itemTypeName
                    }
                  />

                  <Detail
                    label="Vendor SKU"
                    value={
                      item.vendorSkuCode
                    }
                  />

                  <Detail
                    label="Quantity"
                    value={
                      item.quantity
                    }
                  />

                  <Detail
                    label="Pending Quantity"
                    value={
                      item.pendingQuantity
                    }
                  />

                  <Detail
                    label="Rejected Quantity"
                    value={
                      item.rejectedQuantity
                    }
                  />

                  <Detail
                    label="Detailed Quantity"
                    value={
                      item.detailedQuantity
                    }
                  />

                  <Detail
                    label="Items Labelled"
                    value={
                      item.itemsLabelled
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Detail
                    label="Status"
                    value={
                      item.status
                    }
                  />

                  <Detail
                    label="Unit Price"
                    value={formatCurrency(
                      item.unitPrice
                    )}
                  />

                  <Detail
                    label="MRP"
                    value={formatCurrency(
                      item.maxRetailPrice
                    )}
                  />

                  <Detail
                    label="Additional Cost"
                    value={formatCurrency(
                      item.additionalCost
                    )}
                  />

                  <Detail
                    label="Discount"
                    value={formatCurrency(
                      item.discount
                    )}
                  />

                  <Detail
                    label="Discount %"
                    value={
                      item.discountPercentage !==
                        null &&
                      item.discountPercentage !==
                        undefined
                        ? `${item.discountPercentage}%`
                        : "N/A"
                    }
                  />

                  <Detail
                    label="Batch Code"
                    value={
                      item.batchCode
                    }
                  />

                  <Detail
                    label="Manufacturing Date"
                    value={formatDate(
                      item.manufacturingDate
                    )}
                  />

                  <Detail
                    label="Expiry"
                    value={formatDate(
                      item.expiry
                    )}
                  />

                  <Detail
                    label="Expirable"
                    value={
                      item.expirable
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Detail
                    label="Shelf Life"
                    value={
                      item.shelfLife
                    }
                  />

                  <Detail
                    label="GRN Expiry Tolerance"
                    value={
                      item.grnExpiryTolerance
                    }
                  />

                  <Detail
                    label="Rejection Comments"
                    value={
                      item.rejectionComments
                    }
                  />
                </div>
              </div>
            )}

            {/* Errors */}
            {response.errors?.length >
              0 && (
              <div
                style={styles.card}
              >
                <div
                  style={
                    styles.sectionHeader
                  }
                >
                  Uniware Errors
                </div>

                {response.errors.map(
                  (
                    errorItem,
                    index
                  ) => (
                    <div
                      key={index}
                      style={
                        styles.errorItem
                      }
                    >
                      <strong>
                        {errorItem.message ||
                          errorItem.description ||
                          "Error"}
                      </strong>

                      {errorItem.fieldName && (
                        <div>
                          Field:{" "}
                          {
                            errorItem.fieldName
                          }
                        </div>
                      )}

                      {errorItem.code !==
                        undefined && (
                        <div>
                          Code:{" "}
                          {
                            errorItem.code
                          }
                        </div>
                      )}

                      {errorItem.description && (
                        <div>
                          Description:{" "}
                          {
                            errorItem.description
                          }
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Warnings */}
            {response.warnings?.length >
              0 && (
              <div
                style={styles.card}
              >
                <div
                  style={
                    styles.sectionHeader
                  }
                >
                  Uniware Warnings
                </div>

                {response.warnings.map(
                  (
                    warning,
                    index
                  ) => (
                    <div
                      key={index}
                      style={
                        styles.warningItem
                      }
                    >
                      <strong>
                        {warning.message ||
                          warning.description ||
                          "Warning"}
                      </strong>

                      {warning.code !==
                        undefined && (
                        <div>
                          Code:{" "}
                          {
                            warning.code
                          }
                        </div>
                      )}

                      {warning.description && (
                        <div>
                          Description:{" "}
                          {
                            warning.description
                          }
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Raw */}
            <div
              style={styles.card}
            >
              <details>
                <summary
                  style={
                    styles.rawSummary
                  }
                >
                  View Raw API Response
                </summary>

                <pre
                  style={
                    styles.rawResponse
                  }
                >
                  {JSON.stringify(
                    response,
                    null,
                    2
                  )}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------
// Detail
// ------------------------------------------
const Detail = ({
  label,
  value,
}) => (
  <div
    style={
      styles.detailItem
    }
  >
    <div
      style={
        styles.detailLabel
      }
    >
      {label}
    </div>

    <div
      style={
        styles.detailValue
      }
    >
      {value === null ||
      value === undefined ||
      value === ""
        ? "N/A"
        : value}
    </div>
  </div>
);

// ------------------------------------------
// Currency
// ------------------------------------------
const formatCurrency = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "₹ 0.00";
  }

  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return String(value);
  }

  return `₹ ${number.toFixed(
    2
  )}`;
};

// ------------------------------------------
// Date
// ------------------------------------------
const formatDate = (
  value
) => {
  if (!value) {
    return "N/A";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    "en-IN"
  );
};

// ------------------------------------------
// Styles
// ------------------------------------------
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1350px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "14px",
  },

  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },

  sectionHeader: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "18px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "7px",
  },

  smallLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    padding: "11px 12px",
    border:
      "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "14px",
    outline: "none",
  },

  helpText: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "5px",
  },

  traceabilityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  traceCard: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "18px",
    border:
      "1px solid #d1d5db",
    borderRadius: "9px",
    cursor: "pointer",
    background: "#fff",
  },

  traceCardActive: {
    border:
      "2px solid #2563eb",
    background: "#eff6ff",
  },

  subCard: {
    background: "#f9fafb",
    border:
      "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "20px",
    marginTop: "20px",
  },

  subCardTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "15px",
  },

  itemHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "15px",
  },

  addButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  itemRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    padding: "15px",
    marginBottom: "10px",
    background: "#fff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  removeButton: {
    background: "#fff",
    color: "#dc2626",
    border:
      "1px solid #fecaca",
    borderRadius: "6px",
    padding: "11px 14px",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  emptyBox: {
    padding: "20px",
    textAlign: "center",
    color: "#6b7280",
    border:
      "1px dashed #d1d5db",
    borderRadius: "7px",
    background: "#fff",
  },

  quantityHint: {
    marginTop: "10px",
    padding: "10px",
    color: "#374151",
    fontSize: "13px",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },

  primaryButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 600,
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  secondaryButton: {
    background: "#fff",
    color: "#374151",
    border:
      "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 600,
  },

  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    border:
      "1px solid #fecaca",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
  },

  errorTitle: {
    fontWeight: 700,
    marginBottom: "5px",
  },

  messageBox: {
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
  },

  successBox: {
    background: "#ecfdf5",
    color: "#065f46",
    border:
      "1px solid #a7f3d0",
  },

  errorMessageBox: {
    background: "#fef2f2",
    color: "#991b1b",
    border:
      "1px solid #fecaca",
  },

  responseTitle: {
    fontWeight: 700,
    fontSize: "16px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
  },

  detailItem: {
    background: "#f9fafb",
    border:
      "1px solid #e5e7eb",
    borderRadius: "7px",
    padding: "12px",
  },

  detailLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: "5px",
    fontWeight: 600,
  },

  detailValue: {
    fontSize: "14px",
    color: "#111827",
    wordBreak: "break-word",
  },

  errorItem: {
    background: "#fef2f2",
    border:
      "1px solid #fecaca",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "8px",
    color: "#991b1b",
    lineHeight: 1.6,
  },

  warningItem: {
    background: "#fffbeb",
    border:
      "1px solid #fde68a",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "8px",
    color: "#92400e",
    lineHeight: 1.6,
  },

  rawSummary: {
    cursor: "pointer",
    fontWeight: 700,
    color: "#374151",
  },

  rawResponse: {
    background: "#111827",
    color: "#e5e7eb",
    padding: "18px",
    borderRadius: "8px",
    marginTop: "15px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default AddGRNItemSKU;