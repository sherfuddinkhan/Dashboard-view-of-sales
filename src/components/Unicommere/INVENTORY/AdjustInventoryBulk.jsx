import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const EMPTY_ROW = {
  itemSKU: "",
  quantity: "",
  shelfCode: "",
  inventoryType: "GOOD_INVENTORY",
  adjustmentType: "ADD",
  transferToShelfCode: "",
  sla: "",
  remarks: "",
  facilityCode: ""
};

const INVENTORY_TYPES = [
  "GOOD_INVENTORY",
  "BAD_INVENTORY",
  "QC_REJECTED",
  "VIRTUAL_INVENTORY"
];

const ADJUSTMENT_TYPES = [
  "ADD",
  "REMOVE",
  "REPLACE",
  "TRANSFER"
];

function AdjustInventoryBulk() {
  const [facility, setFacility] = useState("MAIN");
  const [forceAllocate, setForceAllocate] = useState(false);

  const [rows, setRows] = useState([
    {
      ...EMPTY_ROW,
      facilityCode: "MAIN"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------
  const summary = useMemo(() => {
    const total = rows.length;

    const add = rows.filter(
      (x) => x.adjustmentType === "ADD"
    ).length;

    const remove = rows.filter(
      (x) => x.adjustmentType === "REMOVE"
    ).length;

    const replace = rows.filter(
      (x) => x.adjustmentType === "REPLACE"
    ).length;

    const transfer = rows.filter(
      (x) => x.adjustmentType === "TRANSFER"
    ).length;

    return {
      total,
      add,
      remove,
      replace,
      transfer
    };
  }, [rows]);

  // ----------------------------------------------------------
  // Update row
  // ----------------------------------------------------------
  const updateRow = (index, field, value) => {
    setRows((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const updated = {
          ...row,
          [field]: value
        };

        // Clear transfer shelf when adjustment type changes
        if (
          field === "adjustmentType" &&
          value !== "TRANSFER"
        ) {
          updated.transferToShelfCode = "";
        }

        return updated;
      })
    );
  };

  // ----------------------------------------------------------
  // Add row
  // ----------------------------------------------------------
  const addRow = () => {
    setRows((previous) => [
      ...previous,
      {
        ...EMPTY_ROW,
        facilityCode: facility
      }
    ]);
  };

  // ----------------------------------------------------------
  // Remove row
  // ----------------------------------------------------------
  const removeRow = (index) => {
    if (rows.length === 1) {
      return;
    }

    setRows((previous) =>
      previous.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  // ----------------------------------------------------------
  // Clear all
  // ----------------------------------------------------------
  const clearAll = () => {
    setRows([
      {
        ...EMPTY_ROW,
        facilityCode: facility
      }
    ]);

    setResponse(null);
    setError("");
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      if (!facility.trim()) {
        throw new Error("Facility header is required.");
      }

      if (!rows.length) {
        throw new Error("Add at least one inventory adjustment.");
      }

      const inventoryAdjustments = rows.map((row, index) => {
        if (!row.itemSKU.trim()) {
          throw new Error(
            `Item SKU is required for row ${index + 1}.`
          );
        }

        if (
          row.quantity === "" ||
          row.quantity === null ||
          Number.isNaN(Number(row.quantity))
        ) {
          throw new Error(
            `Valid quantity is required for row ${index + 1}.`
          );
        }

        if (!row.shelfCode.trim()) {
          throw new Error(
            `Shelf code is required for row ${index + 1}.`
          );
        }

        if (!row.facilityCode.trim()) {
          throw new Error(
            `Facility code is required for row ${index + 1}.`
          );
        }

        if (
          row.adjustmentType === "TRANSFER" &&
          !row.transferToShelfCode.trim()
        ) {
          throw new Error(
            `Transfer destination shelf is required for row ${index + 1}.`
          );
        }

        if (row.remarks.length > 255) {
          throw new Error(
            `Remarks cannot exceed 255 characters for row ${index + 1}.`
          );
        }

        const item = {
          itemSKU: row.itemSKU.trim(),
          quantity: Number(row.quantity),
          shelfCode: row.shelfCode.trim(),
          inventoryType: row.inventoryType,
          adjustmentType: row.adjustmentType,
          facilityCode: row.facilityCode.trim()
        };

        if (row.transferToShelfCode.trim()) {
          item.transferToShelfCode =
            row.transferToShelfCode.trim();
        }

        if (row.sla !== "") {
          item.sla = Number(row.sla);
        }

        if (row.remarks.trim()) {
          item.remarks = row.remarks.trim();
        }

        return item;
      });

      const payload = {
        facility: facility.trim(),
        inventoryAdjustments,
        forceAllocate
      };

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/inventory/adjust-bulk`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to adjust inventory."
      );

      if (err.response?.data) {
        setResponse(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1500px",
        margin: "0 auto",
        padding: "24px",
        fontFamily:
          "Arial, Helvetica, sans-serif"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "20px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            Adjust Inventory - Multiple
          </h2>

          <p
            style={{
              marginTop: "6px",
              color: "#666"
            }}
          >
            Adjust inventory for multiple SKUs and
            facilities in a single Uniware request.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px"
          }}
        >
          <button
            type="button"
            onClick={addRow}
            style={buttonStyle("#1976d2")}
          >
            + Add SKU
          </button>

          <button
            type="button"
            onClick={clearAll}
            style={buttonStyle("#757575")}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Request Settings */}
      {/* ---------------------------------------------------- */}

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>
          Request Settings
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(250px, 350px) minmax(250px, 350px)",
            gap: "20px",
            alignItems: "center"
          }}
        >
          <div>
            <label style={labelStyle}>
              Facility Header *
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
              Sent as the Uniware Facility header.
            </small>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              marginTop: "22px"
            }}
          >
            <input
              type="checkbox"
              checked={forceAllocate}
              onChange={(e) =>
                setForceAllocate(e.target.checked)
              }
            />

            <span>
              <strong>Force Allocate</strong>
              <br />
              <small style={helpStyle}>
                Default: false
              </small>
            </span>
          </label>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Summary */}
      {/* ---------------------------------------------------- */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "20px"
        }}
      >
        <SummaryCard
          title="Total"
          value={summary.total}
        />

        <SummaryCard
          title="ADD"
          value={summary.add}
        />

        <SummaryCard
          title="REMOVE"
          value={summary.remove}
        />

        <SummaryCard
          title="REPLACE"
          value={summary.replace}
        />

        <SummaryCard
          title="TRANSFER"
          value={summary.transfer}
        />
      </div>

      {/* ---------------------------------------------------- */}
      {/* Error */}
      {/* ---------------------------------------------------- */}

      {error && (
        <div
          style={{
            background: "#ffebee",
            border: "1px solid #ef9a9a",
            color: "#b71c1c",
            padding: "14px",
            borderRadius: "6px",
            marginBottom: "20px"
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Adjustment Table */}
      {/* ---------------------------------------------------- */}

      <form onSubmit={handleSubmit}>
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px"
            }}
          >
            <h3 style={{ margin: 0 }}>
              Inventory Adjustments
            </h3>

            <span
              style={{
                color: "#666",
                fontSize: "13px"
              }}
            >
              {rows.length} adjustment
              {rows.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div
            style={{
              overflowX: "auto"
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1450px"
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Item SKU *</th>
                  <th style={thStyle}>Quantity *</th>
                  <th style={thStyle}>Shelf Code *</th>
                  <th style={thStyle}>Inventory Type</th>
                  <th style={thStyle}>Adjustment Type *</th>
                  <th style={thStyle}>
                    Transfer To Shelf
                  </th>
                  <th style={thStyle}>SLA</th>
                  <th style={thStyle}>Remarks</th>
                  <th style={thStyle}>Facility Code *</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td style={tdStyle}>
                      {index + 1}
                    </td>

                    <td style={tdStyle}>
                      <input
                        value={row.itemSKU}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "itemSKU",
                            e.target.value
                          )
                        }
                        placeholder="TN-WBH-001"
                        style={tableInputStyle}
                      />
                    </td>

                    <td style={tdStyle}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        style={{
                          ...tableInputStyle,
                          width: "90px"
                        }}
                      />
                    </td>

                    <td style={tdStyle}>
                      <input
                        value={row.shelfCode}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "shelfCode",
                            e.target.value
                          )
                        }
                        placeholder="A-01-01"
                        style={tableInputStyle}
                      />
                    </td>

                    <td style={tdStyle}>
                      <select
                        value={row.inventoryType}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "inventoryType",
                            e.target.value
                          )
                        }
                        style={tableInputStyle}
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
                    </td>

                    <td style={tdStyle}>
                      <select
                        value={row.adjustmentType}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "adjustmentType",
                            e.target.value
                          )
                        }
                        style={tableInputStyle}
                      >
                        {ADJUSTMENT_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td style={tdStyle}>
                      <input
                        value={
                          row.transferToShelfCode
                        }
                        onChange={(e) =>
                          updateRow(
                            index,
                            "transferToShelfCode",
                            e.target.value
                          )
                        }
                        disabled={
                          row.adjustmentType !==
                          "TRANSFER"
                        }
                        placeholder="B-02-03"
                        style={{
                          ...tableInputStyle,
                          background:
                            row.adjustmentType ===
                            "TRANSFER"
                              ? "#fff"
                              : "#f5f5f5"
                        }}
                      />
                    </td>

                    <td style={tdStyle}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.sla}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "sla",
                            e.target.value
                          )
                        }
                        style={{
                          ...tableInputStyle,
                          width: "80px"
                        }}
                      />
                    </td>

                    <td style={tdStyle}>
                      <input
                        value={row.remarks}
                        maxLength={255}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "remarks",
                            e.target.value
                          )
                        }
                        placeholder="Remarks"
                        style={tableInputStyle}
                      />

                      <div
                        style={{
                          fontSize: "11px",
                          color:
                            row.remarks.length >=
                            255
                              ? "#c62828"
                              : "#777",
                          marginTop: "3px"
                        }}
                      >
                        {row.remarks.length}/255
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <input
                        value={row.facilityCode}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "facilityCode",
                            e.target.value
                          )
                        }
                        placeholder="MAIN"
                        style={tableInputStyle}
                      />
                    </td>

                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() =>
                          removeRow(index)
                        }
                        disabled={rows.length === 1}
                        style={{
                          ...buttonStyle(
                            rows.length === 1
                              ? "#bdbdbd"
                              : "#d32f2f"
                          ),
                          padding:
                            "7px 10px"
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px"
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle("#2e7d32"),
                padding: "12px 24px",
                fontSize: "15px",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading
                ? "Adjusting Inventory..."
                : "Adjust Inventory"}
            </button>
          </div>
        </div>
      </form>

      {/* ---------------------------------------------------- */}
      {/* Response Summary */}
      {/* ---------------------------------------------------- */}

      {response && (
        <ResponseSection response={response} />
      )}
    </div>
  );
}

// ============================================================
// Summary Card
// ============================================================

function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.08)"
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#666",
          marginBottom: "5px"
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: "700"
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================
// Response Section
// ============================================================

function ResponseSection({ response }) {
  const inventoryResponses =
    Array.isArray(
      response.inventoryAdjustmentResponses
    )
      ? response.inventoryAdjustmentResponses
      : [];

  const errors = Array.isArray(response.errors)
    ? response.errors
    : [];

  const warnings = Array.isArray(
    response.warnings
  )
    ? response.warnings
    : [];

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0 }}>
        Uniware Response
      </h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "15px"
        }}
      >
        <span
          style={{
            padding: "7px 12px",
            borderRadius: "20px",
            background: response.successful
              ? "#e8f5e9"
              : "#ffebee",
            color: response.successful
              ? "#2e7d32"
              : "#c62828",
            fontWeight: "600"
          }}
        >
          {response.successful
            ? "SUCCESS"
            : "FAILED"}
        </span>

        {response.message && (
          <span
            style={{
              padding: "7px 12px",
              background: "#f5f5f5",
              borderRadius: "20px"
            }}
          >
            {response.message}
          </span>
        )}
      </div>

      {/* Top-level errors */}
      {errors.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#c62828" }}>
            Errors
          </h4>

          {errors.map((error, index) => (
            <div
              key={index}
              style={{
                background: "#ffebee",
                border: "1px solid #ef9a9a",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "5px"
              }}
            >
              <strong>
                {error.fieldName || "Error"}
              </strong>

              {error.message && (
                <div>{error.message}</div>
              )}

              {error.description && (
                <div>{error.description}</div>
              )}

              {error.code !== undefined && (
                <small>
                  Code: {error.code}
                </small>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#ef6c00" }}>
            Warnings
          </h4>

          {warnings.map((warning, index) => (
            <div
              key={index}
              style={{
                background: "#fff3e0",
                border: "1px solid #ffcc80",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "5px"
              }}
            >
              <strong>
                {warning.message ||
                  "Warning"}
              </strong>

              {warning.description && (
                <div>
                  {warning.description}
                </div>
              )}

              {warning.code !== undefined && (
                <small>
                  Code: {warning.code}
                </small>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Individual adjustment responses */}
      {inventoryResponses.length > 0 && (
        <>
          <h4>
            Adjustment Results
          </h4>

          <div
            style={{
              overflowX: "auto"
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse"
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    SKU
                  </th>
                  <th style={thStyle}>
                    Facility
                  </th>
                  <th style={thStyle}>
                    Quantity
                  </th>
                  <th style={thStyle}>
                    Shelf
                  </th>
                  <th style={thStyle}>
                    Type
                  </th>
                  <th style={thStyle}>
                    Adjustment
                  </th>
                  <th style={thStyle}>
                    Status
                  </th>
                  <th style={thStyle}>
                    Errors
                  </th>
                </tr>
              </thead>

              <tbody>
                {inventoryResponses.map(
                  (result, index) => {
                    const item =
                      result.facilityInventoryAdjustment ||
                      {};

                    const rowErrors =
                      Array.isArray(
                        result.errors
                      )
                        ? result.errors
                        : [];

                    return (
                      <tr key={index}>
                        <td style={tdStyle}>
                          {item.itemSKU ||
                            "N/A"}
                        </td>

                        <td style={tdStyle}>
                          {item.facilityCode ||
                            "N/A"}
                        </td>

                        <td style={tdStyle}>
                          {item.quantity ??
                            "N/A"}
                        </td>

                        <td style={tdStyle}>
                          {item.shelfCode ||
                            "N/A"}
                        </td>

                        <td style={tdStyle}>
                          {item.inventoryType ||
                            "N/A"}
                        </td>

                        <td style={tdStyle}>
                          {item.adjustmentType ||
                            "N/A"}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              color:
                                result.successful
                                  ? "#2e7d32"
                                  : "#c62828",
                              fontWeight:
                                "600"
                            }}
                          >
                            {result.successful
                              ? "SUCCESS"
                              : "FAILED"}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          {rowErrors.length >
                          0 ? (
                            rowErrors.map(
                              (
                                error,
                                errorIndex
                              ) => (
                                <div
                                  key={
                                    errorIndex
                                  }
                                  style={{
                                    color:
                                      "#c62828",
                                    marginBottom:
                                      "4px"
                                  }}
                                >
                                  {error.message ||
                                    error.description ||
                                    "Error"}
                                </div>
                              )
                            )
                          ) : (
                            <span
                              style={{
                                color:
                                  "#777"
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Raw response */}
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
          View Raw Response
        </summary>

        <pre
          style={{
            background: "#111",
            color: "#eee",
            padding: "15px",
            borderRadius: "6px",
            overflow: "auto",
            marginTop: "10px",
            fontSize: "12px"
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
  );
}

// ============================================================
// Styles
// ============================================================

const cardStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow:
    "0 1px 3px rgba(0,0,0,0.06)"
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "7px"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  boxSizing: "border-box",
  fontSize: "14px"
};

const tableInputStyle = {
  width: "100%",
  minWidth: "110px",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box",
  fontSize: "13px"
};

const thStyle = {
  border: "1px solid #ddd",
  background: "#f5f5f5",
  padding: "10px",
  textAlign: "left",
  fontSize: "13px",
  whiteSpace: "nowrap"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  verticalAlign: "top",
  fontSize: "13px"
};

const helpStyle = {
  color: "#777",
  fontSize: "12px"
};

function buttonStyle(background) {
  return {
    border: "none",
    background,
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600"
  };
}

export default AdjustInventoryBulk;