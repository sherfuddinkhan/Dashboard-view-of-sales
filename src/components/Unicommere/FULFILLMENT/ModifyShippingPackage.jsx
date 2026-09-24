import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function ModifyShippingPackage() {
  const [saleOrderCode, setSaleOrderCode] = useState("");

  const [saleOrderItemCodes, setSaleOrderItemCodes] =
    useState([""]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] =
    useState("");

  // ----------------------------------------------------------
  // Add item code
  // ----------------------------------------------------------
  const addItemCode = () => {
    setSaleOrderItemCodes((prev) => [
      ...prev,
      "",
    ]);
  };

  // ----------------------------------------------------------
  // Remove item code
  // ----------------------------------------------------------
  const removeItemCode = (index) => {
    setSaleOrderItemCodes((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ----------------------------------------------------------
  // Update item code
  // ----------------------------------------------------------
  const updateItemCode = (
    index,
    value
  ) => {
    setSaleOrderItemCodes((prev) =>
      prev.map((code, i) =>
        i === index ? value : code
      )
    );
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
      const trimmedSaleOrderCode =
        saleOrderCode.trim();

      const validItemCodes =
        saleOrderItemCodes
          .map((code) => code.trim())
          .filter(Boolean);

      // ------------------------------------------------------
      // At least one input must be supplied
      // ------------------------------------------------------
      if (
        !trimmedSaleOrderCode &&
        validItemCodes.length === 0
      ) {
        throw new Error(
          "Provide Sale Order Code or at least one Sale Order Item Code."
        );
      }

      // ------------------------------------------------------
      // Build payload dynamically
      // ------------------------------------------------------
      const payload = {};

      if (trimmedSaleOrderCode) {
        payload.saleOrderCode =
          trimmedSaleOrderCode;
      }

      if (validItemCodes.length > 0) {
        payload.saleOrderItemCodes =
          validItemCodes;
      }

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/modify`,
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
          "Failed to modify shipping package."
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
    setSaleOrderCode("");
    setSaleOrderItemCodes([""]);
    setLoading(false);
    setResult(null);
    setErrorMessage("");
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
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
          Modify Shipping Package
        </h1>

        <p
          style={{
            marginTop: 0,
            color: "#666",
            lineHeight: 1.5,
          }}
        >
          Modify shipping package items using a
          Sale Order Code, Sale Order Item Codes,
          or both.
        </p>

        <div
          style={{
            padding: "12px 14px",
            marginBottom: "24px",
            background: "#f5f9ff",
            border: "1px solid #c9dcf5",
            borderRadius: "6px",
            color: "#345",
            fontSize: "14px",
          }}
        >
          <strong>Uniware Level:</strong>{" "}
          Tenant
          <br />
          <strong>Facility Header:</strong>{" "}
          Not required
        </div>

        <form onSubmit={handleSubmit}>
          {/* Sale Order Code */}
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <label style={labelStyle}>
              Sale Order Code
            </label>

            <input
              type="text"
              value={saleOrderCode}
              onChange={(e) =>
                setSaleOrderCode(
                  e.target.value
                )
              }
              placeholder="SO08233"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Optional according to the Uniware
              documentation.
            </small>
          </div>

          {/* Sale Order Item Codes */}
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    ...labelStyle,
                    marginBottom: "2px",
                  }}
                >
                  Sale Order Item Codes
                </label>

                <small
                  style={helpStyle}
                >
                  Optional list of SOI codes.
                </small>
              </div>

              <button
                type="button"
                onClick={addItemCode}
                style={
                  secondaryButtonStyle
                }
              >
                + Add Item Code
              </button>
            </div>

            {saleOrderItemCodes.map(
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
                    type="text"
                    value={code}
                    onChange={(e) =>
                      updateItemCode(
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`SO08233-${index}`}
                    style={{
                      ...inputStyle,
                      flex: 1,
                    }}
                  />

                  {saleOrderItemCodes.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeItemCode(
                          index
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
              )
            )}
          </div>

          {/* Information */}
          <div
            style={{
              padding: "12px 14px",
              background: "#fffbea",
              border:
                "1px solid #eadb8c",
              borderRadius: "6px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#665500",
            }}
          >
            <strong>Request behavior:</strong>
            <br />
            You can provide only the Sale Order
            Code, only Sale Order Item Codes, or
            both. Empty optional fields are omitted
            from the request sent to Uniware.
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
                ? "Modifying..."
                : "Modify Shipping Package"}
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

            {/* Errors */}
            {Array.isArray(
              result.errors
            ) &&
              result.errors.length >
                0 && (
                <div
                  style={{
                    marginTop: "20px",
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
                              "bold",
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
                    marginTop: "20px",
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

export default ModifyShippingPackage;