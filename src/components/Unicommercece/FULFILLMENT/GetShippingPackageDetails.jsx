import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetShippingPackageDetails() {
  const [facility, setFacility] =
    useState("MAIN");

  const [shippingPackageCode, setShippingPackageCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  // ----------------------------------------------------------
  // Format Uniware epoch date
  // ----------------------------------------------------------
  const formatDate = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    const numericValue =
      Number(value);

    if (
      Number.isFinite(numericValue) &&
      numericValue > 0
    ) {
      const date =
        new Date(numericValue);

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        return date.toLocaleString();
      }
    }

    return String(value);
  };

  // ----------------------------------------------------------
  // Display helper
  // ----------------------------------------------------------
  const displayValue = (
    value,
    fallback = "N/A"
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    if (
      typeof value === "object"
    ) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------
  const handleSubmit = async (event) => {
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

      const payload = {
        facility: facility.trim(),
        shippingPackageCode:
          shippingPackageCode.trim(),
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/details`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to get shipping package details."
      );

      setResult(
        error.response?.data || null
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Reset
  // ----------------------------------------------------------
  const resetForm = () => {
    setFacility("MAIN");
    setShippingPackageCode("");
    setLoading(false);
    setResult(null);
    setErrorMessage("");
  };

  const dto =
    result?.shippingPackageDetailDTO;

  const saleOrder =
    dto?.saleOrderDetails;

  const items = Array.isArray(
    dto?.saleOrderItems
  )
    ? dto.saleOrderItems
    : [];

  // ----------------------------------------------------------
  // Copy package code
  // ----------------------------------------------------------
  const copyCode = async () => {
    if (!dto?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        dto.code
      );
    } catch {
      // Clipboard unavailable
    }
  };

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
          border: "1px solid #ddd",
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
          Get Shipping Package Details
        </h1>

        <p
          style={{
            marginTop: 0,
            color: "#666",
            lineHeight: 1.5,
          }}
        >
          Fetch complete shipping package
          details including order information,
          billing address, sale order items,
          taxes, e-invoice information,
          tracking and delivery details.
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
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          <strong>Uniware Level:</strong>{" "}
          Facility
          <br />
          <strong>Facility Header:</strong>{" "}
          Required
          <br />
          <strong>Request:</strong>{" "}
          shippingPackageCode
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 2fr",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            {/* Facility */}
            <div>
              <label style={labelStyle}>
                Facility *
              </label>

              <input
                type="text"
                value={facility}
                onChange={(e) =>
                  setFacility(
                    e.target.value
                  )
                }
                placeholder="MAIN"
                style={inputStyle}
              />

              <small
                style={helpStyle}
              >
                Sent as the Uniware
                Facility header.
              </small>
            </div>

            {/* Package Code */}
            <div>
              <label style={labelStyle}>
                Shipping Package Code *
              </label>

              <input
                type="text"
                value={
                  shippingPackageCode
                }
                onChange={(e) =>
                  setShippingPackageCode(
                    e.target.value
                  )
                }
                placeholder="DSKS00002"
                style={inputStyle}
              />

              <small
                style={helpStyle}
              >
                Example: VARA00017 or
                DSKS00002
              </small>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
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
                ? "Loading..."
                : "Get Package Details"}
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

        {/* Error */}
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
            <strong>Error:</strong>{" "}
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
            <h2>Package Details</h2>

            {/* Result message */}
            {result.message && (
              <div
                style={{
                  padding: "14px",
                  marginBottom: "20px",
                  background:
                    result.successful
                      ? "#f0fdf4"
                      : "#fff5f5",
                  border:
                    result.successful
                      ? "1px solid #b7e4c7"
                      : "1px solid #f0b4b4",
                  borderRadius: "6px",
                }}
              >
                <strong>
                  {result.message}
                </strong>
              </div>
            )}

            {dto && (
              <>
                {/* ======================================== */}
                {/* PACKAGE SUMMARY */}
                {/* ======================================== */}
                <section
                  style={
                    sectionStyle
                  }
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
                      Shipping Package
                    </h3>

                    <button
                      type="button"
                      onClick={copyCode}
                      style={
                        smallButtonStyle
                      }
                    >
                      Copy Package Code
                    </button>
                  </div>

                  <div
                    style={
                      infoGridStyle
                    }
                  >
                    <InfoItem
                      label="Package Code"
                      value={dto.code}
                    />

                    <InfoItem
                      label="Sale Order Code"
                      value={
                        dto.saleOrderCode
                      }
                    />

                    <InfoItem
                      label="Status"
                      value={
                        dto.statusCode
                      }
                    />

                    <InfoItem
                      label="Shipping Manifest"
                      value={
                        dto.shippingManifestCode
                      }
                    />

                    <InfoItem
                      label="Actual Weight"
                      value={
                        dto.actualWeight !==
                        undefined
                          ? `${dto.actualWeight} gm`
                          : null
                      }
                    />

                    <InfoItem
                      label="Box Width"
                      value={
                        dto.boxWidth !==
                        undefined
                          ? `${dto.boxWidth} mm`
                          : null
                      }
                    />

                    <InfoItem
                      label="Box Height"
                      value={
                        dto.boxHeight !==
                        undefined
                          ? `${dto.boxHeight} mm`
                          : null
                      }
                    />

                    <InfoItem
                      label="Box Length"
                      value={
                        dto.boxLength !==
                        undefined
                          ? `${dto.boxLength} mm`
                          : null
                      }
                    />

                    <InfoItem
                      label="Collectable Amount"
                      value={
                        dto.collectableAmount
                      }
                    />

                    <InfoItem
                      label="Collected Amount"
                      value={
                        dto.collectedAmount
                      }
                    />

                    <InfoItem
                      label="Shipping Provider"
                      value={
                        dto.shippingProvider
                      }
                    />

                    <InfoItem
                      label="Tracking Number"
                      value={
                        dto.trackingNumber
                      }
                    />

                    <InfoItem
                      label="Tracking Link"
                      value={
                        dto.trackingLink
                      }
                    />

                    <InfoItem
                      label="E-Way Bill No."
                      value={
                        dto.ewbNo
                      }
                    />

                    <InfoItem
                      label="E-Way Bill Date"
                      value={formatDate(
                        dto.ewbDate
                      )}
                    />

                    <InfoItem
                      label="E-Way Bill Valid Till"
                      value={formatDate(
                        dto.ewbValidTill
                      )}
                    />
                  </div>
                </section>

                {/* ======================================== */}
                {/* SALE ORDER */}
                {/* ======================================== */}
                {saleOrder && (
                  <section
                    style={
                      sectionStyle
                    }
                  >
                    <h3
                      style={
                        sectionTitleStyle
                      }
                    >
                      Sale Order
                    </h3>

                    <div
                      style={
                        infoGridStyle
                      }
                    >
                      <InfoItem
                        label="Sale Order Code"
                        value={
                          saleOrder.code
                        }
                      />

                      <InfoItem
                        label="Display Order Code"
                        value={
                          saleOrder.displayOrderCode
                        }
                      />

                      <InfoItem
                        label="Channel"
                        value={
                          saleOrder.channel
                        }
                      />

                      <InfoItem
                        label="Source"
                        value={
                          saleOrder.source
                        }
                      />

                      <InfoItem
                        label="Order Status"
                        value={
                          saleOrder.status
                        }
                      />

                      <InfoItem
                        label="Customer Code"
                        value={
                          saleOrder.customerCode
                        }
                      />

                      <InfoItem
                        label="Customer GSTIN"
                        value={
                          saleOrder.customerGSTIN
                        }
                      />

                      <InfoItem
                        label="Currency"
                        value={
                          saleOrder.currencyCode
                        }
                      />

                      <InfoItem
                        label="COD"
                        value={
                          saleOrder.cod ===
                          true
                            ? "Yes"
                            : saleOrder.cod ===
                              false
                            ? "No"
                            : null
                        }
                      />

                      <InfoItem
                        label="Priority"
                        value={
                          saleOrder.priority
                        }
                      />

                      <InfoItem
                        label="Order Date"
                        value={formatDate(
                          saleOrder.displayOrderDateTime
                        )}
                      />

                      <InfoItem
                        label="Created"
                        value={formatDate(
                          saleOrder.created
                        )}
                      />

                      <InfoItem
                        label="Updated"
                        value={formatDate(
                          saleOrder.updated
                        )}
                      />

                      <InfoItem
                        label="Fulfillment TAT"
                        value={formatDate(
                          saleOrder.fulfillmentTat
                        )}
                      />

                      <InfoItem
                        label="Notification Email"
                        value={
                          saleOrder.notificationEmail
                        }
                      />

                      <InfoItem
                        label="Notification Mobile"
                        value={
                          saleOrder.notificationMobile
                        }
                      />

                      <InfoItem
                        label="Channel Processing Time"
                        value={formatDate(
                          saleOrder.channelProcessingTime
                        )}
                      />
                    </div>
                  </section>
                )}

                {/* ======================================== */}
                {/* BILLING ADDRESS */}
                {/* ======================================== */}
                {saleOrder?.billingAddress && (
                  <section
                    style={
                      sectionStyle
                    }
                  >
                    <h3
                      style={
                        sectionTitleStyle
                      }
                    >
                      Billing Address
                    </h3>

                    <AddressCard
                      address={
                        saleOrder.billingAddress
                      }
                    />
                  </section>
                )}

                {/* ======================================== */}
                {/* ADDRESSES */}
                {/* ======================================== */}
                {Array.isArray(
                  saleOrder?.addresses
                ) &&
                  saleOrder.addresses.length >
                    0 && (
                    <section
                      style={
                        sectionStyle
                      }
                    >
                      <h3
                        style={
                          sectionTitleStyle
                        }
                      >
                        Addresses
                      </h3>

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        {saleOrder.addresses.map(
                          (
                            address,
                            index
                          ) => (
                            <AddressCard
                              key={
                                address.id ||
                                index
                              }
                              address={
                                address
                              }
                            />
                          )
                        )}
                      </div>
                    </section>
                  )}

                {/* ======================================== */}
                {/* SALE ORDER ITEMS */}
                {/* ======================================== */}
                <section
                  style={
                    sectionStyle
                  }
                >
                  <h3
                    style={
                      sectionTitleStyle
                    }
                  >
                    Sale Order Items (
                    {items.length})
                  </h3>

                  {items.length ===
                  0 ? (
                    <div
                      style={{
                        padding: "20px",
                        textAlign:
                          "center",
                        color: "#777",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "6px",
                      }}
                    >
                      No sale order items
                      returned.
                    </div>
                  ) : (
                    <div
                      style={{
                        overflowX:
                          "auto",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse:
                            "collapse",
                          minWidth:
                            "1500px",
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              #
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              SO Item Code
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              SKU
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              Item Name
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              Facility
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              Status
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              Package
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              Selling Price
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              Total Price
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              Discount
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              GST %
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              IGST
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              CGST
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              SGST
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              HSN
                            </th>

                            <th
                              style={
                                tableHeaderStyle
                              }
                            >
                              MRP
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {items.map(
                            (
                              item,
                              index
                            ) => (
                              <React.Fragment
                                key={
                                  item.id ||
                                  item.code ||
                                  index
                                }
                              >
                                <tr>
                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {index +
                                      1}
                                  </td>

                                  <td
                                    style={{
                                      ...tableCellStyle,
                                      fontFamily:
                                        "monospace",
                                      fontWeight:
                                        "600",
                                    }}
                                  >
                                    {displayValue(
                                      item.code
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.itemSku
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.itemName
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.facilityName ||
                                        item.facilityCode
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.statusCode
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.shippingPackageCode
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.sellingPrice
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.totalPrice
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.discount
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.taxPercentage
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.totalIntegratedGst
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.totalCentralGst
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.totalStateGst
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.hsnCode
                                    )}
                                  </td>

                                  <td
                                    style={
                                      tableCellStyle
                                    }
                                  >
                                    {displayValue(
                                      item.maxRetailPrice
                                    )}
                                  </td>
                                </tr>

                                {/* Expanded item details */}
                                <tr>
                                  <td
                                    colSpan="16"
                                    style={{
                                      padding:
                                        "14px",
                                      background:
                                        "#fafafa",
                                      borderBottom:
                                        "1px solid #ddd",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display:
                                          "grid",
                                        gridTemplateColumns:
                                          "repeat(4, minmax(180px, 1fr))",
                                        gap: "12px",
                                      }}
                                    >
                                      <InfoItem
                                        label="Seller SKU"
                                        value={
                                          item.sellerSkuCode
                                        }
                                      />

                                      <InfoItem
                                        label="Channel Product ID"
                                        value={
                                          item.channelProductId
                                        }
                                      />

                                      <InfoItem
                                        label="Channel SO Item"
                                        value={
                                          item.channelSaleOrderItemCode
                                        }
                                      />

                                      <InfoItem
                                        label="Packet Number"
                                        value={
                                          item.packetNumber
                                        }
                                      />

                                      <InfoItem
                                        label="Shipping Method"
                                        value={
                                          item.shippingMethodCode
                                        }
                                      />

                                      <InfoItem
                                        label="Shelf"
                                        value={
                                          item.shelfCode
                                        }
                                      />

                                      <InfoItem
                                        label="Item Type"
                                        value={
                                          item.type
                                        }
                                      />

                                      <InfoItem
                                        label="Barcode / Item"
                                        value={
                                          item.item
                                        }
                                      />

                                      <InfoItem
                                        label="Shipping Charges"
                                        value={
                                          item.shippingCharges
                                        }
                                      />

                                      <InfoItem
                                        label="Shipping Method Charges"
                                        value={
                                          item.shippingMethodCharges
                                        }
                                      />

                                      <InfoItem
                                        label="COD Charges"
                                        value={
                                          item.cashOnDeliveryCharges
                                        }
                                      />

                                      <InfoItem
                                        label="Prepaid Amount"
                                        value={
                                          item.prepaidAmount
                                        }
                                      />

                                      <InfoItem
                                        label="Voucher"
                                        value={
                                          item.voucherCode
                                        }
                                      />

                                      <InfoItem
                                        label="Voucher Value"
                                        value={
                                          item.voucherValue
                                        }
                                      />

                                      <InfoItem
                                        label="Store Credit"
                                        value={
                                          item.storeCredit
                                        }
                                      />

                                      <InfoItem
                                        label="Gift Wrap"
                                        value={
                                          item.giftWrap ===
                                          true
                                            ? "Yes"
                                            : item.giftWrap ===
                                              false
                                            ? "No"
                                            : null
                                        }
                                      />

                                      <InfoItem
                                        label="Gift Message"
                                        value={
                                          item.giftMessage
                                        }
                                      />

                                      <InfoItem
                                        label="Country of Origin"
                                        value={
                                          item.countryOfOrigin
                                        }
                                      />

                                      <InfoItem
                                        label="Channel MRP"
                                        value={
                                          item.channelMrp
                                        }
                                      />

                                      <InfoItem
                                        label="TCS"
                                        value={
                                          item.tcs
                                        }
                                      />

                                      <InfoItem
                                        label="UC Batch Code"
                                        value={
                                          item.ucBatchCode
                                        }
                                      />

                                      <InfoItem
                                        label="Expected Delivery"
                                        value={formatDate(
                                          item.expectedDeliveryDate
                                        )}
                                      />

                                      <InfoItem
                                        label="Created"
                                        value={formatDate(
                                          item.created
                                        )}
                                      />

                                      <InfoItem
                                        label="Updated"
                                        value={formatDate(
                                          item.updated
                                        )}
                                      />

                                      <InfoItem
                                        label="On Hold"
                                        value={
                                          item.onHold ===
                                          true
                                            ? "Yes"
                                            : item.onHold ===
                                              false
                                            ? "No"
                                            : null
                                        }
                                      />

                                      <InfoItem
                                        label="Cancellable"
                                        value={
                                          item.cancellable ===
                                          true
                                            ? "Yes"
                                            : item.cancellable ===
                                              false
                                            ? "No"
                                            : null
                                        }
                                      />
                                    </div>

                                    {/* Item details */}
                                    {item.itemDetailFields &&
                                      Object.keys(
                                        item.itemDetailFields
                                      ).length >
                                        0 && (
                                        <div
                                          style={{
                                            marginTop:
                                              "16px",
                                          }}
                                        >
                                          <strong>
                                            Item Detail Fields
                                          </strong>

                                          <div
                                            style={{
                                              display:
                                                "flex",
                                              flexWrap:
                                                "wrap",
                                              gap: "8px",
                                              marginTop:
                                                "8px",
                                            }}
                                          >
                                            {Object.entries(
                                              item.itemDetailFields
                                            ).map(
                                              ([
                                                key,
                                                value,
                                              ]) => (
                                                <span
                                                  key={
                                                    key
                                                  }
                                                  style={
                                                    badgeStyle
                                                  }
                                                >
                                                  {key}:{" "}
                                                  {
                                                    value
                                                  }
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* E-Invoice */}
                                    {item.gstEinvoice && (
                                      <div
                                        style={{
                                          marginTop:
                                            "16px",
                                        }}
                                      >
                                        <strong>
                                          GST E-Invoice
                                        </strong>

                                        <div
                                          style={
                                            infoGridStyle
                                          }
                                        >
                                          <InfoItem
                                            label="IRN"
                                            value={
                                              item
                                                .gstEinvoice
                                                .irn
                                            }
                                          />

                                          <InfoItem
                                            label="Ack No."
                                            value={
                                              item
                                                .gstEinvoice
                                                .ackNo
                                            }
                                          />

                                          <InfoItem
                                            label="Ack Date"
                                            value={
                                              item
                                                .gstEinvoice
                                                .ackDate
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              </React.Fragment>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Errors */}
            {Array.isArray(
              result.errors
            ) &&
              result.errors.length >
                0 && (
                <section
                  style={
                    sectionStyle
                  }
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
                  style={
                    sectionStyle
                  }
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

                        {warning.code !==
                          undefined && (
                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontSize:
                                "12px",
                            }}
                          >
                            Code:{" "}
                            {
                              warning.code
                            }
                          </div>
                        )}
                      </div>
                    )
                  )}
                </section>
              )}

            {/* Raw response */}
            <details
              style={{
                marginTop: "24px",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "700",
                }}
              >
                Raw Response
              </summary>

              <pre
                style={{
                  marginTop: "10px",
                  padding: "15px",
                  background:
                    "#f6f6f6",
                  borderRadius: "6px",
                  overflow: "auto",
                  fontSize: "12px",
                  maxHeight:
                    "600px",
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

// ============================================================
// Reusable UI components
// ============================================================

function InfoItem({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#fafafa",
        border:
          "1px solid #e2e2e2",
        borderRadius: "6px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#777",
          textTransform:
            "uppercase",
          marginBottom: "5px",
          fontWeight: "600",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          fontWeight: "500",
          wordBreak:
            "break-word",
        }}
      >
        {value === null ||
        value === undefined ||
        value === ""
          ? "N/A"
          : String(value)}
      </div>
    </div>
  );
}

function AddressCard({
  address,
}) {
  if (!address) {
    return null;
  }

  return (
    <div
      style={{
        padding: "16px",
        border:
          "1px solid #ddd",
        borderRadius: "7px",
        background: "#fafafa",
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          fontWeight: "700",
          marginBottom: "6px",
        }}
      >
        {address.name ||
          "N/A"}
      </div>

      <div>
        {address.addressLine1 ||
          "N/A"}
      </div>

      {address.addressLine2 && (
        <div>
          {address.addressLine2}
        </div>
      )}

      <div>
        {[
          address.city,
          address.state,
          address.pincode,
        ]
          .filter(Boolean)
          .join(", ") ||
          "N/A"}
      </div>

      <div>
        {address.country ||
          "N/A"}
      </div>

      <div
        style={{
          marginTop: "6px",
        }}
      >
        <strong>
          Phone:
        </strong>{" "}
        {address.phone ||
          "N/A"}
      </div>

      <div>
        <strong>
          Email:
        </strong>{" "}
        {address.email ||
          "N/A"}
      </div>

      {address.id && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#777",
          }}
        >
          Address ID:{" "}
          {address.id}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "600",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border:
    "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  background: "#fff",
};

const helpStyle = {
  display: "block",
  marginTop: "5px",
  color: "#777",
  fontSize: "12px",
};

const primaryButtonStyle = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "6px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const resetButtonStyle = {
  padding: "11px 18px",
  border:
    "1px solid #999",
  borderRadius: "6px",
  background: "#fff",
  color: "#333",
  cursor: "pointer",
};

const smallButtonStyle = {
  padding: "7px 11px",
  border:
    "1px solid #1976d2",
  borderRadius: "5px",
  background: "#fff",
  color: "#1976d2",
  cursor: "pointer",
  fontWeight: "600",
};

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
  marginBottom: "16px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "10px",
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom:
    "2px solid #ddd",
  background: "#f5f5f5",
  fontSize: "12px",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  padding: "10px",
  borderBottom:
    "1px solid #ddd",
  fontSize: "13px",
  verticalAlign:
    "top",
};

const badgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "12px",
  background: "#eef4ff",
  border:
    "1px solid #c9dcf5",
  fontSize: "12px",
};

const errorStyle = {
  padding: "12px",
  marginBottom: "8px",
  background: "#fff5f5",
  border:
    "1px solid #f0b4b4",
  borderRadius: "6px",
  color: "#b42318",
};

const warningStyle = {
  padding: "12px",
  marginBottom: "8px",
  background: "#fffbea",
  border:
    "1px solid #eadb8c",
  borderRadius: "6px",
};

export default GetShippingPackageDetails;