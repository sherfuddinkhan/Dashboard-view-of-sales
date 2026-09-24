import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const INVENTORY_TYPES = [
  "GOOD_INVENTORY",
  "BAD_INVENTORY",
  "QC_REJECTED",
  "VIRTUAL_INVENTORY"
];

function AddNonTraceableItem() {
  const [facility, setFacility] = useState("MAIN");
  const [gatePassCode, setGatePassCode] = useState("");
  const [itemSKU, setItemSKU] = useState("");
  const [inventoryType, setInventoryType] =
    useState("GOOD_INVENTORY");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [shelfCode, setShelfCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const trimmedFacility = facility.trim();
    const trimmedGatePassCode =
      gatePassCode.trim();
    const trimmedItemSKU = itemSKU.trim();
    const trimmedShelfCode = shelfCode.trim();

    // --------------------------------------------------------
    // Required validations
    // --------------------------------------------------------

    if (!trimmedFacility) {
      setError("Facility is required.");
      return;
    }

    if (!trimmedGatePassCode) {
      setError("Gatepass code is required.");
      return;
    }

    if (!trimmedItemSKU) {
      setError("Item SKU is required.");
      return;
    }

    if (!INVENTORY_TYPES.includes(inventoryType)) {
      setError("Please select a valid inventory type.");
      return;
    }

    if (quantity === "") {
      setError("Quantity is required.");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      setError(
        "Quantity must be a non-negative integer."
      );
      return;
    }

    // --------------------------------------------------------
    // Optional Unit Price
    // --------------------------------------------------------

    let parsedUnitPrice;

    if (unitPrice !== "") {
      parsedUnitPrice = Number(unitPrice);

      if (!Number.isFinite(parsedUnitPrice)) {
        setError(
          "Unit price must be a valid number."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // Build payload
    // --------------------------------------------------------

    const payload = {
      facility: trimmedFacility,
      gatePassCode: trimmedGatePassCode,
      itemSKU: trimmedItemSKU,
      inventoryType,
      quantity: parsedQuantity
    };

    if (unitPrice !== "") {
      payload.unitPrice = parsedUnitPrice;
    }

    if (trimmedShelfCode) {
      payload.shelfCode = trimmedShelfCode;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/gatepasses/add-nontraceable-item`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      console.error(
        "Add Non-Traceable Item Error:",
        err
      );

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to add non-traceable item."
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
    setGatePassCode("");
    setItemSKU("");
    setInventoryType("GOOD_INVENTORY");
    setQuantity("");
    setUnitPrice("");
    setShelfCode("");

    setResult(null);
    setError("");
  };

  // ----------------------------------------------------------
  // Request Preview
  // ----------------------------------------------------------

  const requestPreview = {
    facility,
    gatePassCode,
    itemSKU,
    inventoryType,
    quantity:
      quantity === ""
        ? ""
        : Number(quantity),
    ...(unitPrice !== ""
      ? {
          unitPrice: Number(unitPrice)
        }
      : {}),
    ...(shelfCode.trim()
      ? {
          shelfCode: shelfCode.trim()
        }
      : {})
  };

  return (
    <div
      style={{
        maxWidth: "950px",
        margin: "30px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif"
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
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <h2
            style={{
              margin: 0,
              marginBottom: "8px",
              color: "#222"
            }}
          >
            Add Non-Traceable Item
          </h2>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px"
            }}
          >
            Add an SKU-based non-traceable item and
            quantity to an existing Uniware gatepass.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Facility */}
          <div style={{ marginBottom: "18px" }}>
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
              style={inputStyle}
            />

            <small style={helpStyle}>
              Uniware facility code sent in the
              Facility header.
            </small>
          </div>

          {/* Gatepass Code */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Gatepass Code *
            </label>

            <input
              type="text"
              value={gatePassCode}
              onChange={(e) =>
                setGatePassCode(e.target.value)
              }
              placeholder="GP000123"
              autoComplete="off"
              style={inputStyle}
            />
          </div>

          {/* Item SKU */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Item SKU *
            </label>

            <input
              type="text"
              value={itemSKU}
              onChange={(e) =>
                setItemSKU(e.target.value)
              }
              placeholder="TN-WBH-001"
              autoComplete="off"
              style={inputStyle}
            />

            <small style={helpStyle}>
              SKU code of the non-traceable item.
            </small>
          </div>

          {/* Inventory Type */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Inventory Type *
            </label>

            <select
              value={inventoryType}
              onChange={(e) =>
                setInventoryType(e.target.value)
              }
              style={inputStyle}
            >
              {INVENTORY_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Quantity *
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              placeholder="1"
              style={inputStyle}
            />
          </div>

          {/* Unit Price */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Unit Price
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={unitPrice}
              onChange={(e) =>
                setUnitPrice(e.target.value)
              }
              placeholder="2499"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Optional.
            </small>
          </div>

          {/* Shelf Code */}
          <div style={{ marginBottom: "22px" }}>
            <label style={labelStyle}>
              Shelf Code
            </label>

            <input
              type="text"
              value={shelfCode}
              onChange={(e) =>
                setShelfCode(e.target.value)
              }
              placeholder="SHELF-001"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Optional shelf location.
            </small>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "22px"
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading
                ? "Adding..."
                : "Add Item"}
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

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
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

        {/* Request Preview */}
        <details
          style={{
            marginBottom: "20px"
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
              requestPreview,
              null,
              2
            )}
          </pre>
        </details>

        {/* Result */}
        {result && (
          <div
            style={{
              padding: "18px",
              background:
                result.successful
                  ? "#e8f5e9"
                  : "#fff3e0",
              border: `1px solid ${
                result.successful
                  ? "#81c784"
                  : "#ffb74d"
              }`,
              borderRadius: "8px"
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color:
                  result.successful
                    ? "#2e7d32"
                    : "#e65100"
              }}
            >
              {result.successful
                ? "Item Added Successfully"
                : "Item Addition Failed"}
            </h3>

            {result.message && (
              <div
                style={{
                  marginBottom: "14px"
                }}
              >
                <strong>
                  Message:
                </strong>{" "}
                {result.message}
              </div>
            )}

            {/* Errors */}
            {Array.isArray(
              result.errors
            ) &&
              result.errors.length > 0 && (
                <div
                  style={{
                    marginBottom: "15px"
                  }}
                >
                  <h4>Errors</h4>

                  {result.errors.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={{
                          background:
                            "#fff",
                          border:
                            "1px solid #ef9a9a",
                          borderRadius:
                            "5px",
                          padding:
                            "10px",
                          marginBottom:
                            "7px"
                        }}
                      >
                        <div>
                          <strong>
                            {item.fieldName ||
                              "Item"}
                            :
                          </strong>{" "}
                          {item.message ||
                            item.description ||
                            "Unknown error"}
                        </div>

                        {item.code !==
                          undefined && (
                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#777",
                              marginTop:
                                "4px"
                            }}
                          >
                            Error Code:{" "}
                            {item.code}
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
              result.warnings.length > 0 && (
                <div
                  style={{
                    marginBottom: "15px"
                  }}
                >
                  <h4>Warnings</h4>

                  {result.warnings.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={{
                          background:
                            "#fff",
                          border:
                            "1px solid #ffcc80",
                          borderRadius:
                            "5px",
                          padding:
                            "10px",
                          marginBottom:
                            "7px"
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

            {/* Raw Response */}
            <details>
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
// Styles
// ------------------------------------------------------------

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none"
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
  background: "#1976d2",
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

const preStyle = {
  marginTop: "12px",
  padding: "14px",
  background: "#f5f5f5",
  borderRadius: "6px",
  overflowX: "auto",
  fontSize: "12px",
  lineHeight: "1.5"
};

export default AddNonTraceableItem;