import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetGatepass() {
  const [facility, setFacility] = useState("MAIN");

  const [gatePassCodes, setGatePassCodes] = useState([
    ""
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Add gatepass code
  // ----------------------------------------------------------

  const addGatePassCode = () => {
    setGatePassCodes((current) => [
      ...current,
      ""
    ]);
  };

  // ----------------------------------------------------------
  // Update gatepass code
  // ----------------------------------------------------------

  const updateGatePassCode = (
    index,
    value
  ) => {
    setGatePassCodes((current) =>
      current.map((code, i) =>
        i === index ? value : code
      )
    );
  };

  // ----------------------------------------------------------
  // Remove gatepass code
  // ----------------------------------------------------------

  const removeGatePassCode = (index) => {
    setGatePassCodes((current) =>
      current.length === 1
        ? [""]
        : current.filter(
            (_, i) => i !== index
          )
    );
  };

  // ----------------------------------------------------------
  // Search / Get
  // ----------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!facility.trim()) {
      setError("Facility is required.");
      return;
    }

    const cleanedCodes = [
      ...new Set(
        gatePassCodes
          .filter(
            (code) =>
              typeof code === "string" &&
              code.trim()
          )
          .map((code) => code.trim())
      )
    ];

    if (cleanedCodes.length === 0) {
      setError(
        "Enter at least one gatepass code."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/gatepasses/get`,
        {
          facility: facility.trim(),
          gatePassCodes: cleanedCodes
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error(
        "Get Gatepass Error:",
        err
      );

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to get gatepass details."
      );

      setResult(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Reset
  // ----------------------------------------------------------

  const handleReset = () => {
    setFacility("MAIN");
    setGatePassCodes([""]);
    setResult(null);
    setError("");
  };

  // ----------------------------------------------------------
  // Format date
  // ----------------------------------------------------------

  const formatDate = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  };

  // ----------------------------------------------------------
  // Number formatter
  // ----------------------------------------------------------

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0";
    }

    return Number(value).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2
      }
    );
  };

  // ----------------------------------------------------------
  // Status style
  // ----------------------------------------------------------

  const getStatusStyle = (status) => {
    const styles = {
      CREATED: {
        background: "#e3f2fd",
        color: "#1565c0"
      },
      CLOSED: {
        background: "#e8f5e9",
        color: "#2e7d32"
      },
      DISCARDED: {
        background: "#ffebee",
        color: "#c62828"
      },
      RETURN_AWAITED: {
        background: "#fff3e0",
        color: "#e65100"
      }
    };

    return (
      styles[status] || {
        background: "#f5f5f5",
        color: "#555"
      }
    );
  };

  return (
    <div
      style={{
        maxWidth: "1350px",
        margin: "30px auto",
        padding: "24px",
        fontFamily:
          "Arial, Helvetica, sans-serif"
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "26px",
          boxShadow:
            "0 3px 14px rgba(0,0,0,0.08)"
        }}
      >
        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}

        <div
          style={{
            marginBottom: "25px"
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: "8px",
              color: "#1565c0"
            }}
          >
            Get Gatepass
          </h2>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px"
            }}
          >
            Fetch complete gatepass details from
            Uniware using one or more gatepass
            codes.
          </p>
        </div>

        {/* ------------------------------------------------ */}
        {/* Form */}
        {/* ------------------------------------------------ */}

        <form onSubmit={handleSubmit}>
          {/* Facility */}

          <div
            style={{
              marginBottom: "22px"
            }}
          >
            <label style={labelStyle}>
              Facility *
            </label>

            <input
              type="text"
              value={facility}
              onChange={(e) =>
                setFacility(e.target.value)
              }
              placeholder="MAIN"
              style={{
                ...inputStyle,
                maxWidth: "500px"
              }}
            />

            <small style={helpStyle}>
              Uniware facility code. This is sent
              as the Facility HTTP header.
            </small>
          </div>

          {/* Gatepass Codes */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "10px"
              }}
            >
              <label
                style={{
                  ...labelStyle,
                  marginBottom: 0
                }}
              >
                Gatepass Codes *
              </label>

              <button
                type="button"
                onClick={addGatePassCode}
                style={addButtonStyle}
              >
                + Add Code
              </button>
            </div>

            {gatePassCodes.map(
              (code, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "9px"
                  }}
                >
                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      updateGatePassCode(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="GPJ1000214"
                    style={{
                      ...inputStyle,
                      flex: 1
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeGatePassCode(
                        index
                      )
                    }
                    style={
                      removeButtonStyle
                    }
                    title="Remove"
                  >
                    Remove
                  </button>
                </div>
              )
            )}

            <small style={helpStyle}>
              The API accepts multiple gatepass
              codes in a single request.
            </small>
          </div>

          {/* Buttons */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px"
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity: loading
                  ? 0.7
                  : 1
              }}
            >
              {loading
                ? "Loading..."
                : "Get Gatepass Details"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              style={secondaryButtonStyle}
            >
              Reset
            </button>
          </div>
        </form>

        {/* ------------------------------------------------ */}
        {/* Error */}
        {/* ------------------------------------------------ */}

        {error && (
          <div
            style={{
              marginTop: "22px",
              padding: "14px",
              background: "#ffebee",
              border:
                "1px solid #ef9a9a",
              borderRadius: "7px",
              color: "#c62828"
            }}
          >
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* Request Preview */}
        {/* ------------------------------------------------ */}

        <details
          style={{
            marginTop: "22px"
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Request Preview
          </summary>

          <pre style={preStyle}>
            {JSON.stringify(
              {
                facility,
                gatePassCodes:
                  gatePassCodes.filter(
                    (code) =>
                      code.trim()
                  )
              },
              null,
              2
            )}
          </pre>
        </details>

        {/* ------------------------------------------------ */}
        {/* Result */}
        {/* ------------------------------------------------ */}

        {result && (
          <div
            style={{
              marginTop: "28px"
            }}
          >
            {/* Result Header */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "18px",
                padding: "15px",
                background: "#f5f7fa",
                borderRadius: "8px"
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: "5px"
                  }}
                >
                  Gatepass Details
                </h3>

                <div
                  style={{
                    color: "#666",
                    fontSize: "13px"
                  }}
                >
                  {result.message ||
                    "Gatepass request completed."}
                </div>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color:
                    result.successful
                      ? "#2e7d32"
                      : "#c62828"
                }}
              >
                {result.successful
                  ? "SUCCESS"
                  : "FAILED"}
              </div>
            </div>

            {/* Errors */}

            {Array.isArray(
              result.errors
            ) &&
              result.errors.length > 0 && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    background: "#ffebee",
                    border:
                      "1px solid #ef9a9a",
                    borderRadius: "7px",
                    color: "#c62828"
                  }}
                >
                  <strong>
                    Uniware Errors
                  </strong>

                  {result.errors.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={{
                          marginTop: "8px"
                        }}
                      >
                        {item.fieldName && (
                          <strong>
                            {
                              item.fieldName
                            }
                            :{" "}
                          </strong>
                        )}

                        {item.message ||
                          item.description ||
                          "Unknown error"}
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
                    marginBottom: "20px",
                    padding: "15px",
                    background: "#fff8e1",
                    border:
                      "1px solid #ffcc80",
                    borderRadius: "7px",
                    color: "#e65100"
                  }}
                >
                  <strong>
                    Uniware Warnings
                  </strong>

                  {result.warnings.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={{
                          marginTop: "8px"
                        }}
                      >
                        {item.message ||
                          item.description ||
                          "Warning"}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Gatepasses */}

            {Array.isArray(
              result.elements
            ) &&
              result.elements.map(
                (gatepass, gatepassIndex) => {
                  const statusStyle =
                    getStatusStyle(
                      gatepass.statusCode
                    );

                  return (
                    <div
                      key={
                        gatepass.id ??
                        gatepass.code ??
                        gatepassIndex
                      }
                      style={{
                        border:
                          "1px solid #ddd",
                        borderRadius: "10px",
                        marginBottom: "25px",
                        overflow: "hidden",
                        background: "#fff"
                      }}
                    >
                      {/* Gatepass Header */}

                      <div
                        style={{
                          padding: "18px",
                          background: "#f8fafc",
                          borderBottom:
                            "1px solid #ddd"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap: "15px",
                            flexWrap:
                              "wrap"
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#777",
                                marginBottom:
                                  "4px"
                              }}
                            >
                              Gatepass Code
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "20px",
                                fontWeight:
                                  "700",
                                color:
                                  "#1565c0"
                              }}
                            >
                              {
                                gatepass.code
                              }
                            </div>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "8px",
                              flexWrap:
                                "wrap"
                            }}
                          >
                            <span
                              style={{
                                ...statusStyle,
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "15px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "600"
                              }}
                            >
                              {gatepass.statusCode ||
                                "N/A"}
                            </span>

                            <span
                              style={{
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "15px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "600",
                                background:
                                  "#ede7f6",
                                color:
                                  "#5e35b1"
                              }}
                            >
                              {gatepass.type ||
                                "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Basic Details */}

                      <div
                        style={{
                          padding: "18px"
                        }}
                      >
                        <SectionTitle>
                          Basic Information
                        </SectionTitle>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(4, minmax(0, 1fr))",
                            gap: "12px",
                            marginBottom:
                              "22px"
                          }}
                        >
                          <InfoItem
                            label="ID"
                            value={
                              gatepass.id
                            }
                          />

                          <InfoItem
                            label="Type"
                            value={
                              gatepass.type
                            }
                          />

                          <InfoItem
                            label="Status"
                            value={
                              gatepass.statusCode
                            }
                          />

                          <InfoItem
                            label="Username"
                            value={
                              gatepass.username
                            }
                          />

                          <InfoItem
                            label="To Party"
                            value={
                              gatepass.toPartyName
                            }
                          />

                          <InfoItem
                            label="Reference"
                            value={
                              gatepass.reference
                            }
                          />

                          <InfoItem
                            label="Purpose"
                            value={
                              gatepass.purpose
                            }
                          />

                          <InfoItem
                            label="Gatepass Order"
                            value={
                              gatepass.gatePassOrderCode
                            }
                          />

                          <InfoItem
                            label="Created"
                            value={formatDate(
                              gatepass.created
                            )}
                          />

                          <InfoItem
                            label="Updated"
                            value={formatDate(
                              gatepass.updated
                            )}
                          />

                          <InfoItem
                            label="Invoice Code"
                            value={
                              gatepass.invoiceCode
                            }
                          />

                          <InfoItem
                            label="Invoice Display Code"
                            value={
                              gatepass.invoiceDisplayCode
                            }
                          />

                          <InfoItem
                            label="Return Invoice Code"
                            value={
                              gatepass.returnInvoiceCode
                            }
                          />

                          <InfoItem
                            label="Return Invoice Display"
                            value={
                              gatepass.returnInvoiceDisplayCode
                            }
                          />
                        </div>

                        {/* E-Invoice */}

                        {gatepass.gstEinvoice && (
                          <div
                            style={{
                              marginBottom:
                                "22px"
                            }}
                          >
                            <SectionTitle>
                              GST E-Invoice
                            </SectionTitle>

                            <div
                              style={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "repeat(2, minmax(0, 1fr))",
                                gap: "12px"
                              }}
                            >
                              <InfoItem
                                label="IRN"
                                value={
                                  gatepass
                                    .gstEinvoice
                                    ?.irn
                                }
                              />

                              <InfoItem
                                label="Acknowledgement No."
                                value={
                                  gatepass
                                    .gstEinvoice
                                    ?.ackNo
                                }
                              />

                              <InfoItem
                                label="Acknowledgement Date"
                                value={
                                  gatepass
                                    .gstEinvoice
                                    ?.ackDate
                                }
                              />

                              <InfoItem
                                label="Signed Invoice"
                                value={
                                  gatepass
                                    .gstEinvoice
                                    ?.signedInvoice
                                    ? "Available"
                                    : "N/A"
                                }
                              />

                              <InfoItem
                                label="Signed QR Code"
                                value={
                                  gatepass
                                    .gstEinvoice
                                    ?.signedQrCode
                                    ? "Available"
                                    : "N/A"
                                }
                              />
                            </div>
                          </div>
                        )}

                        {/* Items */}

                        <SectionTitle>
                          Gatepass Items
                        </SectionTitle>

                        {Array.isArray(
                          gatepass.gatePassItemDTOs
                        ) &&
                        gatepass
                          .gatePassItemDTOs
                          .length > 0 ? (
                          <div
                            style={{
                              overflowX:
                                "auto",
                              border:
                                "1px solid #ddd",
                              borderRadius:
                                "8px"
                            }}
                          >
                            <table
                              style={{
                                width:
                                  "100%",
                                borderCollapse:
                                  "collapse",
                                minWidth:
                                  "1450px"
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    background:
                                      "#f5f5f5"
                                  }}
                                >
                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    #
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Item Code
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Item SKU
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Item Name
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Item Status
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Inventory
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Quantity
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Received
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Pending
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Unit Price
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Total
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Tax %
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    IGST %
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    CGST %
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    SGST %
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Shelf
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    HSN
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Condition
                                  </th>

                                  <th
                                    style={
                                      thStyle
                                    }
                                  >
                                    Reason
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {gatepass.gatePassItemDTOs.map(
                                  (
                                    item,
                                    itemIndex
                                  ) => (
                                    <tr
                                      key={
                                        item.gatePassItemId ??
                                        item.itemCode ??
                                        itemIndex
                                      }
                                      style={{
                                        borderTop:
                                          "1px solid #eee"
                                      }}
                                    >
                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {itemIndex +
                                          1}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {item.itemCode ||
                                          "N/A"}
                                      </td>

                                      <td
                                        style={{
                                          ...tdStyle,
                                          fontWeight:
                                            "600"
                                        }}
                                      >
                                        {item.itemTypeSKU ||
                                          "N/A"}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {item.itemTypeName ||
                                          "N/A"}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {item.gatePassItemStatus ||
                                          item.itemStatus ||
                                          "N/A"}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {item.inventoryType ||
                                          "N/A"}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.quantity
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.receivedQuantity
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.pendingQuantity
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.unitPrice
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.total
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.taxPercentage
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.integratedGstPercentage
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.centralGstPercentage
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {formatNumber(
                                          item.stateGstPercentage
                                        )}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {item.shelfCode ||
                                          "N/A"}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {item.hsnCode ||
                                          "N/A"}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {item.itemCondition ||
                                          "N/A"}
                                      </td>

                                      <td
                                        style={
                                          tdStyle
                                        }
                                      >
                                        {item.reason ||
                                          "N/A"}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div
                            style={{
                              padding:
                                "25px",
                              textAlign:
                                "center",
                              border:
                                "1px solid #ddd",
                              borderRadius:
                                "8px",
                              color:
                                "#777"
                            }}
                          >
                            No items found
                            for this
                            gatepass.
                          </div>
                        )}

                        {/* Item Count */}

                        {Array.isArray(
                          gatepass.gatePassItemDTOs
                        ) && (
                          <div
                            style={{
                              marginTop:
                                "12px",
                              color:
                                "#666",
                              fontSize:
                                "13px"
                            }}
                          >
                            Total items:{" "}
                            <strong>
                              {
                                gatepass
                                  .gatePassItemDTOs
                                  .length
                              }
                            </strong>
                          </div>
                        )}

                        {/* Custom Fields */}

                        {Array.isArray(
                          gatepass.customFieldValues
                        ) &&
                          gatepass
                            .customFieldValues
                            .length > 0 && (
                            <div
                              style={{
                                marginTop:
                                  "22px"
                              }}
                            >
                              <SectionTitle>
                                Custom Fields
                              </SectionTitle>

                              <div
                                style={{
                                  display:
                                    "grid",
                                  gridTemplateColumns:
                                    "repeat(3, minmax(0, 1fr))",
                                  gap: "12px"
                                }}
                              >
                                {gatepass.customFieldValues.map(
                                  (
                                    field,
                                    index
                                  ) => (
                                    <InfoItem
                                      key={
                                        index
                                      }
                                      label={
                                        field.name ||
                                        `Field ${
                                          index +
                                          1
                                        }`
                                      }
                                      value={
                                        field.value
                                      }
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                }
              )}

            {/* No Elements */}

            {Array.isArray(
              result.elements
            ) &&
              result.elements.length === 0 && (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    border:
                      "1px solid #ddd",
                    borderRadius: "8px",
                    color: "#777"
                  }}
                >
                  No gatepass details were
                  returned.
                </div>
              )}

            {/* Raw Response */}

            <details
              style={{
                marginTop: "20px"
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Raw Response
              </summary>

              <pre style={preStyle}>
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

// ------------------------------------------------------------
// Components
// ------------------------------------------------------------

function SectionTitle({ children }) {
  return (
    <h3
      style={{
        marginTop: 0,
        marginBottom: "12px",
        fontSize: "16px",
        color: "#333"
      }}
    >
      {children}
    </h3>
  );
}

function InfoItem({ label, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        padding: "11px",
        borderRadius: "6px",
        border: "1px solid #eee"
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#777",
          marginBottom: "5px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "13px",
          fontWeight: "600",
          wordBreak: "break-word"
        }}
      >
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? value
          : "N/A"}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Styles
// ------------------------------------------------------------

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  background: "#fff"
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600"
};

const helpStyle = {
  display: "block",
  marginTop: "5px",
  color: "#777",
  fontSize: "12px"
};

const primaryButtonStyle = {
  padding: "11px 22px",
  border: "none",
  borderRadius: "6px",
  background: "#1565c0",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600"
};

const secondaryButtonStyle = {
  padding: "11px 20px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#fff",
  color: "#333",
  cursor: "pointer",
  fontWeight: "600"
};

const addButtonStyle = {
  padding: "7px 12px",
  border: "none",
  borderRadius: "5px",
  background: "#2e7d32",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600"
};

const removeButtonStyle = {
  padding: "8px 12px",
  border: "1px solid #ef9a9a",
  borderRadius: "5px",
  background: "#ffebee",
  color: "#c62828",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600"
};

const thStyle = {
  padding: "11px 9px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "600",
  borderBottom: "1px solid #ddd",
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: "10px 9px",
  fontSize: "12px",
  verticalAlign: "middle",
  whiteSpace: "nowrap"
};

const preStyle = {
  marginTop: "12px",
  padding: "14px",
  background: "#f5f5f5",
  borderRadius: "6px",
  overflowX: "auto",
  fontSize: "12px",
  lineHeight: "1.5"
};

export default GetGatepass;