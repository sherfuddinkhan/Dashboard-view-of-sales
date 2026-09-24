import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const FORWARD_STATUSES = [
  "CREATED",
  "LOCATION_NOT_SERVICEABLE",
  "PICKING",
  "PICKED",
  "PACKED",
  "READY_TO_SHIP",
  "CANCELLED",
  "MANIFESTED",
  "DISPATCHED",
  "SHIPPED",
  "DELIVERED",
  "PENDING_CUSTOMIZATION",
  "CUSTOMIZATION_COMPLETE",
];

const REVERSE_STATUSES = [
  "RETURN_EXPECTED",
  "RETURNED",
  "SPLITTED",
  "RETURN_ACKNOWLEDGED",
  "MERGED",
];

function GetShippingPackages() {
  const [facility, setFacility] =
    useState("MAIN");

  const [statusCode, setStatusCode] =
    useState("READY_TO_SHIP");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

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

      if (!statusCode.trim()) {
        throw new Error(
          "Shipping package status code is required."
        );
      }

      const payload = {
        facility: facility.trim(),
        statusCode: statusCode.trim(),
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/get`,
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
          "Failed to get shipping packages."
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
    setStatusCode("READY_TO_SHIP");
    setLoading(false);
    setResult(null);
    setErrorMessage("");
  };

  // ----------------------------------------------------------
  // Copy package code
  // ----------------------------------------------------------
  const copyPackageCode = async (code) => {
    try {
      await navigator.clipboard.writeText(
        code
      );
    } catch {
      // Clipboard may not be available
    }
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
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
          Get Shipping Packages
        </h1>

        <p
          style={{
            marginTop: 0,
            color: "#666",
            lineHeight: 1.5,
          }}
        >
          Fetch shipping package codes from
          Uniware based on shipment status.
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
          <strong>Required Request Field:</strong>{" "}
          statusCode
        </div>

        <form onSubmit={handleSubmit}>
          {/* Facility */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 2fr",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
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

              <small style={helpStyle}>
                Sent as the Uniware Facility
                HTTP header.
              </small>
            </div>

            <div>
              <label style={labelStyle}>
                Shipment Status *
              </label>

              <select
                value={statusCode}
                onChange={(e) =>
                  setStatusCode(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <optgroup label="Forward Delivery">
                  {FORWARD_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </optgroup>

                <optgroup label="Reverse Delivery">
                  {REVERSE_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Status description */}
          <div
            style={{
              padding: "14px",
              marginBottom: "24px",
              background: "#fafafa",
              border:
                "1px solid #e0e0e0",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#555",
            }}
          >
            <strong>
              Selected status:
            </strong>{" "}
            {statusCode}

            <div
              style={{
                marginTop: "6px",
              }}
            >
              The API returns shipping package
              codes currently matching this
              shipment status in the specified
              facility.
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
                : "Get Shipping Packages"}
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

        {/* Response */}
        {result && (
          <div
            style={{
              marginTop: "28px",
            }}
          >
            <h2>Response</h2>

            {/* Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <div
                style={summaryCardStyle}
              >
                <div
                  style={summaryLabelStyle}
                >
                  Status
                </div>

                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  {result.successful
                    ? "SUCCESS"
                    : "FAILED"}
                </div>
              </div>

              <div
                style={summaryCardStyle}
              >
                <div
                  style={summaryLabelStyle}
                >
                  Package Count
                </div>

                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  {Array.isArray(
                    result.shippingPackages
                  )
                    ? result
                        .shippingPackages
                        .length
                    : 0}
                </div>
              </div>

              <div
                style={summaryCardStyle}
              >
                <div
                  style={summaryLabelStyle}
                >
                  Status Code
                </div>

                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "18px",
                    wordBreak:
                      "break-word",
                  }}
                >
                  {statusCode}
                </div>
              </div>
            </div>

            {/* Message */}
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

            {/* Shipping Packages */}
            {Array.isArray(
              result.shippingPackages
            ) && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom:
                      "12px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    Shipping Packages
                  </h3>
                </div>

                {result
                  .shippingPackages
                  .length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      textAlign:
                        "center",
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "6px",
                      color: "#666",
                    }}
                  >
                    No shipping packages
                    found for status{" "}
                    <strong>
                      {statusCode}
                    </strong>
                    .
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
                            Shipping Package Code
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {result.shippingPackages.map(
                          (
                            packageCode,
                            index
                          ) => (
                            <tr
                              key={`${packageCode}-${index}`}
                            >
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
                                  fontWeight:
                                    "600",
                                  fontFamily:
                                    "monospace",
                                }}
                              >
                                {
                                  packageCode
                                }
                              </td>

                              <td
                                style={
                                  tableCellStyle
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyPackageCode(
                                      packageCode
                                    )
                                  }
                                  style={
                                    smallButtonStyle
                                  }
                                >
                                  Copy
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
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
                      "24px",
                  }}
                >
                  <h3>Errors</h3>

                  {result.errors.map(
                    (
                      error,
                      index
                    ) => (
                      <div
                        key={index}
                        style={{
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
                        }}
                      >
                        <div
                          style={{
                            fontWeight:
                              "700",
                          }}
                        >
                          {error.fieldName ||
                            "Error"}
                        </div>

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
                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontSize:
                                "12px",
                              color:
                                "#777",
                            }}
                          >
                            Error Code:{" "}
                            {error.code}
                          </div>
                        )}
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
                      "24px",
                  }}
                >
                  <h3>Warnings</h3>

                  {result.warnings.map(
                    (
                      warning,
                      index
                    ) => (
                      <div
                        key={index}
                        style={{
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
                        }}
                      >
                        <div>
                          {warning.message ||
                            warning.description ||
                            "Warning"}
                        </div>

                        {warning.code !==
                          undefined && (
                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontSize:
                                "12px",
                              color:
                                "#777",
                            }}
                          >
                            Warning Code:{" "}
                            {
                              warning.code
                            }
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Raw Response */}
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
  border: "1px solid #999",
  borderRadius: "6px",
  background: "#fff",
  color: "#333",
  cursor: "pointer",
};

const smallButtonStyle = {
  padding: "6px 10px",
  border: "1px solid #1976d2",
  borderRadius: "5px",
  background: "#fff",
  color: "#1976d2",
  cursor: "pointer",
};

const summaryCardStyle = {
  padding: "15px",
  border: "1px solid #ddd",
  borderRadius: "7px",
  background: "#fafafa",
};

const summaryLabelStyle = {
  fontSize: "12px",
  color: "#777",
  marginBottom: "6px",
  textTransform: "uppercase",
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "11px",
  borderBottom:
    "2px solid #ddd",
  background: "#f5f5f5",
  fontSize: "13px",
};

const tableCellStyle = {
  padding: "11px",
  borderBottom:
    "1px solid #ddd",
  fontSize: "14px",
};

export default GetShippingPackages;