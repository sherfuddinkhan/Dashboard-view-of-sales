import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function SplitShippingPackage() {
  const [facility, setFacility] = useState("MAIN");
  const [shippingPackageCode, setShippingPackageCode] = useState(
    "VARA00017"
  );

  const [splitPackages, setSplitPackages] = useState([
    {
      packetNumber: 1,
      items: [
        {
          skuCode: "test",
          quantity: 2,
          saleOrderItemCodes: ["SO08233-0", "SO08233-1"],
        },
      ],
    },
    {
      packetNumber: 2,
      items: [
        {
          skuCode: "test",
          quantity: 2,
          saleOrderItemCodes: ["SO08233-2", "SO08233-3"],
        },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const addSplitPackage = () => {
    setSplitPackages((prev) => [
      ...prev,
      {
        packetNumber: prev.length + 1,
        items: [
          {
            skuCode: "",
            quantity: 1,
            saleOrderItemCodes: [],
          },
        ],
      },
    ]);
  };

  const removeSplitPackage = (packageIndex) => {
    setSplitPackages((prev) =>
      prev.filter((_, index) => index !== packageIndex)
    );
  };

  const updatePackageField = (
    packageIndex,
    field,
    value
  ) => {
    setSplitPackages((prev) =>
      prev.map((pkg, index) =>
        index === packageIndex
          ? {
              ...pkg,
              [field]: value,
            }
          : pkg
      )
    );
  };

  const addItem = (packageIndex) => {
    setSplitPackages((prev) =>
      prev.map((pkg, index) =>
        index === packageIndex
          ? {
              ...pkg,
              items: [
                ...(pkg.items || []),
                {
                  skuCode: "",
                  quantity: 1,
                  saleOrderItemCodes: [],
                },
              ],
            }
          : pkg
      )
    );
  };

  const removeItem = (
    packageIndex,
    itemIndex
  ) => {
    setSplitPackages((prev) =>
      prev.map((pkg, index) =>
        index === packageIndex
          ? {
              ...pkg,
              items: (pkg.items || []).filter(
                (_, i) => i !== itemIndex
              ),
            }
          : pkg
      )
    );
  };

  const updateItemField = (
    packageIndex,
    itemIndex,
    field,
    value
  ) => {
    setSplitPackages((prev) =>
      prev.map((pkg, pIndex) => {
        if (pIndex !== packageIndex) {
          return pkg;
        }

        return {
          ...pkg,
          items: (pkg.items || []).map(
            (item, iIndex) =>
              iIndex === itemIndex
                ? {
                    ...item,
                    [field]: value,
                  }
                : item
          ),
        };
      })
    );
  };

  const updateSaleOrderItemCodes = (
    packageIndex,
    itemIndex,
    value
  ) => {
    const codes = value
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean);

    updateItemField(
      packageIndex,
      itemIndex,
      "saleOrderItemCodes",
      codes
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setResult(null);
    setErrorMessage("");

    try {
      if (!facility.trim()) {
        throw new Error("Facility is required.");
      }

      if (!shippingPackageCode.trim()) {
        throw new Error(
          "Shipping package code is required."
        );
      }

      if (
        !Array.isArray(splitPackages) ||
        splitPackages.length === 0
      ) {
        throw new Error(
          "At least one split package is required."
        );
      }

      const payload = {
        facility: facility.trim(),
        shippingPackageCode:
          shippingPackageCode.trim(),

        splitPackages: splitPackages.map(
          (pkg) => ({
            ...(pkg.packetNumber !== "" &&
            pkg.packetNumber !== null &&
            pkg.packetNumber !== undefined
              ? {
                  packetNumber: Number(
                    pkg.packetNumber
                  ),
                }
              : {}),

            ...(Array.isArray(pkg.items)
              ? {
                  items: pkg.items.map(
                    (item) => ({
                      ...(item.skuCode?.trim()
                        ? {
                            skuCode:
                              item.skuCode.trim(),
                          }
                        : {}),

                      ...(item.quantity !== "" &&
                      item.quantity !== null &&
                      item.quantity !== undefined
                        ? {
                            quantity: Number(
                              item.quantity
                            ),
                          }
                        : {}),

                      saleOrderItemCodes:
                        Array.isArray(
                          item.saleOrderItemCodes
                        )
                          ? item.saleOrderItemCodes
                          : [],
                    })
                  ),
                }
              : {}),
          })
        ),
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/split`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to split shipping package."
      );

      setResult(
        error.response?.data || null
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFacility("MAIN");
    setShippingPackageCode("VARA00017");

    setSplitPackages([
      {
        packetNumber: 1,
        items: [
          {
            skuCode: "test",
            quantity: 2,
            saleOrderItemCodes: [
              "SO08233-0",
              "SO08233-1",
            ],
          },
        ],
      },
      {
        packetNumber: 2,
        items: [
          {
            skuCode: "test",
            quantity: 2,
            saleOrderItemCodes: [
              "SO08233-2",
              "SO08233-3",
            ],
          },
        ],
      },
    ]);

    setResult(null);
    setErrorMessage("");
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
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
          Split Shipping Package
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: 0,
          }}
        >
          Split an existing Uniware shipping
          package into multiple packages based on
          SKU, quantity, or Sale Order Items.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Facility */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div>
              <label style={labelStyle}>
                Facility *
              </label>

              <input
                value={facility}
                onChange={(e) =>
                  setFacility(e.target.value)
                }
                placeholder="MAIN"
                style={inputStyle}
              />

              <small style={helpStyle}>
                Sent as the Uniware Facility
                request header.
              </small>
            </div>

            <div>
              <label style={labelStyle}>
                Shipping Package Code *
              </label>

              <input
                value={shippingPackageCode}
                onChange={(e) =>
                  setShippingPackageCode(
                    e.target.value
                  )
                }
                placeholder="VARA00017"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Split Packages */}
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              Split Packages
            </h2>

            <button
              type="button"
              onClick={addSplitPackage}
              style={secondaryButtonStyle}
            >
              + Add Package
            </button>
          </div>

          {splitPackages.map(
            (pkg, packageIndex) => (
              <div
                key={packageIndex}
                style={{
                  border:
                    "1px solid #d8d8d8",
                  borderRadius: "8px",
                  padding: "18px",
                  marginBottom: "18px",
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "17px",
                    }}
                  >
                    Package{" "}
                    {packageIndex + 1}
                  </h3>

                  {splitPackages.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeSplitPackage(
                          packageIndex
                        )
                      }
                      style={
                        dangerButtonStyle
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div
                  style={{
                    maxWidth: "300px",
                    marginBottom: "18px",
                  }}
                >
                  <label
                    style={labelStyle}
                  >
                    Packet Number
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      pkg.packetNumber
                    }
                    onChange={(e) =>
                      updatePackageField(
                        packageIndex,
                        "packetNumber",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <strong>
                    Items
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      addItem(
                        packageIndex
                      )
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    + Add Item
                  </button>
                </div>

                {(pkg.items || []).map(
                  (
                    item,
                    itemIndex
                  ) => (
                    <div
                      key={itemIndex}
                      style={{
                        border:
                          "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom:
                          "12px",
                        background:
                          "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "1.5fr 1fr 2fr auto",
                          gap: "12px",
                          alignItems:
                            "end",
                        }}
                      >
                        <div>
                          <label
                            style={
                              labelStyle
                            }
                          >
                            SKU Code
                          </label>

                          <input
                            value={
                              item.skuCode ||
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              updateItemField(
                                packageIndex,
                                itemIndex,
                                "skuCode",
                                e.target
                                  .value
                              )
                            }
                            placeholder="test"
                            style={
                              inputStyle
                            }
                          />
                        </div>

                        <div>
                          <label
                            style={
                              labelStyle
                            }
                          >
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              item.quantity ??
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              updateItemField(
                                packageIndex,
                                itemIndex,
                                "quantity",
                                e.target
                                  .value
                              )
                            }
                            style={
                              inputStyle
                            }
                          />
                        </div>

                        <div>
                          <label
                            style={
                              labelStyle
                            }
                          >
                            Sale Order Item Codes
                          </label>

                          <input
                            value={(
                              item.saleOrderItemCodes ||
                              []
                            ).join(", ")}
                            onChange={(
                              e
                            ) =>
                              updateSaleOrderItemCodes(
                                packageIndex,
                                itemIndex,
                                e.target
                                  .value
                              )
                            }
                            placeholder="SO08233-0, SO08233-1"
                            style={
                              inputStyle
                            }
                          />

                          <small
                            style={
                              helpStyle
                            }
                          >
                            Comma-separated.
                            Use [] when
                            splitting by
                            SKU + quantity.
                          </small>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              packageIndex,
                              itemIndex
                            )
                          }
                          style={
                            dangerButtonStyle
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )
          )}

          {/* Buttons */}
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
                ? "Splitting..."
                : "Split Shipping Package"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              style={resetButtonStyle}
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
              border:
                "1px solid #f0b4b4",
              borderRadius: "6px",
              background: "#fff5f5",
              color: "#b42318",
            }}
          >
            <strong>Error:</strong>{" "}
            {errorMessage}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginTop: "28px" }}>
            <h2>Response</h2>

            <div
              style={{
                padding: "14px",
                borderRadius: "6px",
                background:
                  result.successful
                    ? "#f0fdf4"
                    : "#fff5f5",
                border:
                  result.successful
                    ? "1px solid #b7e4c7"
                    : "1px solid #f0b4b4",
              }}
            >
              <strong>
                {result.successful
                  ? "Success"
                  : "Failed"}
              </strong>

              {result.message && (
                <div
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {result.message}
                </div>
              )}
            </div>

            {/* New package mapping */}
            {result.splitNumberToShippingPackageCode &&
              Object.keys(
                result.splitNumberToShippingPackageCode
              ).length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <h3>
                    Created Shipping
                    Packages
                  </h3>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={
                            tableHeaderStyle
                          }
                        >
                          Split Packet
                        </th>
                        <th
                          style={
                            tableHeaderStyle
                          }
                        >
                          Shipping Package Code
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(
                        result.splitNumberToShippingPackageCode
                      ).map(
                        ([
                          packet,
                          code,
                        ]) => (
                          <tr
                            key={packet}
                          >
                            <td
                              style={
                                tableCellStyle
                              }
                            >
                              {packet}
                            </td>
                            <td
                              style={{
                                ...tableCellStyle,
                                fontWeight:
                                  "bold",
                              }}
                            >
                              {code}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            {/* Errors */}
            {Array.isArray(
              result.errors
            ) &&
              result.errors.length >
                0 && (
                <div
                  style={{
                    marginTop:
                      "20px",
                  }}
                >
                  <h3>
                    Errors
                  </h3>

                  {result.errors.map(
                    (
                      error,
                      index
                    ) => (
                      <div
                        key={index}
                        style={{
                          padding:
                            "10px",
                          marginBottom:
                            "8px",
                          background:
                            "#fff5f5",
                          border:
                            "1px solid #f0b4b4",
                          borderRadius:
                            "5px",
                        }}
                      >
                        <strong>
                          {error.fieldName ||
                            "Error"}
                        </strong>

                        <div>
                          {error.message ||
                            error.description ||
                            "Unknown error"}
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
              result.warnings.length >
                0 && (
                <div
                  style={{
                    marginTop:
                      "20px",
                  }}
                >
                  <h3>
                    Warnings
                  </h3>

                  {result.warnings.map(
                    (
                      warning,
                      index
                    ) => (
                      <div
                        key={index}
                        style={{
                          padding:
                            "10px",
                          marginBottom:
                            "8px",
                          background:
                            "#fffbea",
                          border:
                            "1px solid #eadb8c",
                          borderRadius:
                            "5px",
                        }}
                      >
                        {warning.message ||
                          warning.description ||
                          "Warning"}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Raw response */}
            <details
              style={{
                marginTop: "20px",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Raw Response
              </summary>

              <pre
                style={{
                  marginTop: "10px",
                  padding: "15px",
                  background: "#f6f6f6",
                  borderRadius: "6px",
                  overflow: "auto",
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
        )}
      </div>
    </div>
  );
}

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
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
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

const secondaryButtonStyle = {
  padding: "8px 13px",
  border: "1px solid #1976d2",
  borderRadius: "6px",
  background: "#fff",
  color: "#1976d2",
  cursor: "pointer",
  fontWeight: "600",
};

const dangerButtonStyle = {
  padding: "8px 12px",
  border: "1px solid #d32f2f",
  borderRadius: "6px",
  background: "#fff",
  color: "#d32f2f",
  cursor: "pointer",
};

const resetButtonStyle = {
  padding: "11px 18px",
  border: "1px solid #999",
  borderRadius: "6px",
  background: "#fff",
  color: "#333",
  cursor: "pointer",
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "2px solid #ddd",
  background: "#f5f5f5",
};

const tableCellStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};

export default SplitShippingPackage;