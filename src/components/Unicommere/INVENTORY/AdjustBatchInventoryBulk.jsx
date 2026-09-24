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
  facilityCode: "MAIN",

  // Batch mode
  batchMode: "NEW_BATCH",
  batchCode: "",

  // Batch details
  mrp: "",
  cost: "",
  mfd: "",
  expiryDate: "",
  vendorCode: "",
  vendorBatchNumber: ""
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

function AdjustBatchInventoryBulk() {
  const [facility, setFacility] = useState("MAIN");
  const [forceAllocate, setForceAllocate] =
    useState(false);

  const [rows, setRows] = useState([
    {
      ...EMPTY_ROW
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] =
    useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------

  const summary = useMemo(() => {
    return {
      total: rows.length,

      add: rows.filter(
        (row) =>
          row.adjustmentType === "ADD"
      ).length,

      remove: rows.filter(
        (row) =>
          row.adjustmentType === "REMOVE"
      ).length,

      replace: rows.filter(
        (row) =>
          row.adjustmentType === "REPLACE"
      ).length,

      transfer: rows.filter(
        (row) =>
          row.adjustmentType === "TRANSFER"
      ).length,

      existingBatch: rows.filter(
        (row) =>
          row.batchMode ===
          "EXISTING_BATCH"
      ).length,

      newBatch: rows.filter(
        (row) =>
          row.batchMode === "NEW_BATCH"
      ).length
    };
  }, [rows]);

  // ----------------------------------------------------------
  // Update row
  // ----------------------------------------------------------

  const updateRow = (
    index,
    field,
    value
  ) => {
    setRows((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const updated = {
          ...row,
          [field]: value
        };

        if (
          field === "adjustmentType" &&
          value !== "TRANSFER"
        ) {
          updated.transferToShelfCode =
            "";
        }

        if (
          field === "batchMode"
        ) {
          if (
            value ===
            "EXISTING_BATCH"
          ) {
            updated.mrp = "";
            updated.cost = "";
            updated.mfd = "";
            updated.expiryDate = "";
            updated.vendorCode = "";
            updated.vendorBatchNumber =
              "";
          } else {
            updated.batchCode = "";
          }
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
        facilityCode:
          facility.trim() || "MAIN"
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
      previous.filter(
        (_, rowIndex) =>
          rowIndex !== index
      )
    );
  };

  // ----------------------------------------------------------
  // Clear
  // ----------------------------------------------------------

  const clearAll = () => {
    setRows([
      {
        ...EMPTY_ROW,
        facilityCode:
          facility.trim() || "MAIN"
      }
    ]);

    setResponse(null);
    setError("");
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      if (!facility.trim()) {
        throw new Error(
          "Facility header is required."
        );
      }

      if (!rows.length) {
        throw new Error(
          "Add at least one inventory adjustment."
        );
      }

      const inventoryAdjustments =
        rows.map((row, index) => {
          const rowNumber =
            index + 1;

          if (!row.itemSKU.trim()) {
            throw new Error(
              `Item SKU is required for row ${rowNumber}.`
            );
          }

          if (
            row.quantity === "" ||
            row.quantity === null ||
            Number.isNaN(
              Number(row.quantity)
            )
          ) {
            throw new Error(
              `Valid quantity is required for row ${rowNumber}.`
            );
          }

          if (!row.shelfCode.trim()) {
            throw new Error(
              `Shelf code is required for row ${rowNumber}.`
            );
          }

          if (
            !row.facilityCode.trim()
          ) {
            throw new Error(
              `Facility code is required for row ${rowNumber}.`
            );
          }

          if (
            row.adjustmentType ===
              "TRANSFER" &&
            !row.transferToShelfCode.trim()
          ) {
            throw new Error(
              `Transfer destination shelf is required for row ${rowNumber}.`
            );
          }

          if (
            row.remarks.length >
            255
          ) {
            throw new Error(
              `Remarks cannot exceed 255 characters for row ${rowNumber}.`
            );
          }

          // ----------------------------------------------------
          // Common fields
          // ----------------------------------------------------

          const item = {
            itemSKU:
              row.itemSKU.trim(),

            quantity:
              Number(row.quantity),

            shelfCode:
              row.shelfCode.trim(),

            inventoryType:
              row.inventoryType,

            adjustmentType:
              row.adjustmentType,

            facilityCode:
              row.facilityCode.trim()
          };

          if (
            row.transferToShelfCode.trim()
          ) {
            item.transferToShelfCode =
              row.transferToShelfCode.trim();
          }

          if (row.sla !== "") {
            const sla =
              Number(row.sla);

            if (
              Number.isNaN(sla)
            ) {
              throw new Error(
                `SLA must be numeric for row ${rowNumber}.`
              );
            }

            item.sla = sla;
          }

          if (
            row.remarks.trim()
          ) {
            item.remarks =
              row.remarks.trim();
          }

          // ----------------------------------------------------
          // Existing batch
          // ----------------------------------------------------

          if (
            row.batchMode ===
            "EXISTING_BATCH"
          ) {
            if (
              !row.batchCode.trim()
            ) {
              throw new Error(
                `Batch Code is required for row ${rowNumber}.`
              );
            }

            item.batchCode =
              row.batchCode.trim();
          }

          // ----------------------------------------------------
          // New batch
          // ----------------------------------------------------

          if (
            row.batchMode ===
            "NEW_BATCH"
          ) {
            const requiredFields = [
              ["MRP", row.mrp],
              ["Cost", row.cost],
              ["MFD", row.mfd],
              [
                "Vendor Code",
                row.vendorCode
              ],
              [
                "Expiry Date",
                row.expiryDate
              ],
              [
                "Vendor Batch Number",
                row.vendorBatchNumber
              ]
            ];

            for (
              const [label, value] of
              requiredFields
            ) {
              if (
                !String(value).trim()
              ) {
                throw new Error(
                  `${label} is required for row ${rowNumber}.`
                );
              }
            }

            item.batchDetails = {
              mrp:
                row.mrp.trim(),

              cost:
                row.cost.trim(),

              mfd:
                row.mfd.trim(),

              vendorCode:
                row.vendorCode.trim(),

              expiryDate:
                row.expiryDate.trim(),

              vendorBatchNumber:
                row.vendorBatchNumber.trim()
            };
          }

          return item;
        });

      const payload = {
        facility:
          facility.trim(),

        inventoryAdjustments,

        forceAllocate
      };

      const result =
        await axios.post(
          `${SERVER_URL}/api/uniware/inventory/adjust-batch-bulk`,
          payload
        );

      setResponse(
        result.data
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to adjust batchwise inventory."
      );

      if (err.response?.data) {
        setResponse(
          err.response.data
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1800px",
        margin: "0 auto",
        padding: "24px",
        fontFamily:
          "Arial, Helvetica, sans-serif"
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "20px"
        }}
      >
        <div>
          <h2
            style={{
              margin: 0
            }}
          >
            Adjust Batchwise Inventory
            - Multiple
          </h2>

          <p
            style={{
              color: "#666",
              marginTop: "7px"
            }}
          >
            Adjust multiple SKU inventories
            with batch traceability across
            one or more facilities.
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
            style={buttonStyle(
              "#1976d2"
            )}
          >
            + Add SKU
          </button>

          <button
            type="button"
            onClick={clearAll}
            style={buttonStyle(
              "#757575"
            )}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ======================================================
          REQUEST SETTINGS
      ====================================================== */}

      <div style={cardStyle}>
        <h3
          style={{
            marginTop: 0
          }}
        >
          Request Settings
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(250px, 350px) minmax(250px, 350px)",
            gap: "25px",
            alignItems: "center"
          }}
        >
          <div>
            <label
              style={labelStyle}
            >
              Facility Header *
            </label>

            <input
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

          <label
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <input
              type="checkbox"
              checked={
                forceAllocate
              }
              onChange={(e) =>
                setForceAllocate(
                  e.target.checked
                )
              }
            />

            <span>
              <strong>
                Force Allocate
              </strong>
              <br />
              <small
                style={
                  helpStyle
                }
              >
                Default: false
              </small>
            </span>
          </label>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(145px, 1fr))",
          gap: "12px",
          marginBottom: "20px"
        }}
      >
        <SummaryCard
          title="Total"
          value={
            summary.total
          }
        />

        <SummaryCard
          title="ADD"
          value={
            summary.add
          }
        />

        <SummaryCard
          title="REMOVE"
          value={
            summary.remove
          }
        />

        <SummaryCard
          title="REPLACE"
          value={
            summary.replace
          }
        />

        <SummaryCard
          title="TRANSFER"
          value={
            summary.transfer
          }
        />

        <SummaryCard
          title="Existing Batch"
          value={
            summary.existingBatch
          }
        />

        <SummaryCard
          title="New Batch"
          value={
            summary.newBatch
          }
        />
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          style={{
            background:
              "#ffebee",
            border:
              "1px solid #ef9a9a",
            color:
              "#b71c1c",
            padding:
              "14px",
            borderRadius:
              "6px",
            marginBottom:
              "20px"
          }}
        >
          <strong>
            Error:
          </strong>{" "}
          {error}
        </div>
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
      >
        <div
          style={
            cardStyle
          }
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginBottom:
                "15px"
            }}
          >
            <h3
              style={{
                margin: 0
              }}
            >
              Batch Inventory
              Adjustments
            </h3>

            <span
              style={{
                color:
                  "#666",
                fontSize:
                  "13px"
              }}
            >
              {rows.length} row
              {rows.length !==
              1
                ? "s"
                : ""}
            </span>
          </div>

          <div
            style={{
              overflowX:
                "auto"
            }}
          >
            <table
              style={{
                width:
                  "100%",
                minWidth:
                  "2200px",
                borderCollapse:
                  "collapse"
              }}
            >
              <thead>
                <tr>
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
                    SKU *
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Qty *
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Shelf *
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Inventory Type
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Adjustment Type *
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Transfer Shelf
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Facility *
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Batch Mode *
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Batch Code
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    MRP
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Cost
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    MFD
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Expiry
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Vendor Code
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Vendor Batch No.
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    SLA
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Remarks
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        {index +
                          1}
                      </td>

                      {/* SKU */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.itemSKU
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "itemSKU",
                              e
                                .target
                                .value
                            )
                          }
                          placeholder="TN-WBH-001"
                          style={
                            tableInputStyle
                          }
                        />
                      </td>

                      {/* Quantity */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={
                            row.quantity
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "quantity",
                              e
                                .target
                                .value
                            )
                          }
                          style={{
                            ...tableInputStyle,
                            width:
                              "80px"
                          }}
                        />
                      </td>

                      {/* Shelf */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.shelfCode
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "shelfCode",
                              e
                                .target
                                .value
                            )
                          }
                          placeholder="A-01-01"
                          style={
                            tableInputStyle
                          }
                        />
                      </td>

                      {/* Inventory type */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <select
                          value={
                            row.inventoryType
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "inventoryType",
                              e
                                .target
                                .value
                            )
                          }
                          style={
                            tableInputStyle
                          }
                        >
                          {INVENTORY_TYPES.map(
                            (
                              type
                            ) => (
                              <option
                                key={
                                  type
                                }
                                value={
                                  type
                                }
                              >
                                {type}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      {/* Adjustment */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <select
                          value={
                            row.adjustmentType
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "adjustmentType",
                              e
                                .target
                                .value
                            )
                          }
                          style={
                            tableInputStyle
                          }
                        >
                          {ADJUSTMENT_TYPES.map(
                            (
                              type
                            ) => (
                              <option
                                key={
                                  type
                                }
                                value={
                                  type
                                }
                              >
                                {type}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      {/* Transfer */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.transferToShelfCode
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "transferToShelfCode",
                              e
                                .target
                                .value
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

                      {/* Facility */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.facilityCode
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "facilityCode",
                              e
                                .target
                                .value
                            )
                          }
                          placeholder="MAIN"
                          style={
                            tableInputStyle
                          }
                        />
                      </td>

                      {/* Batch mode */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <select
                          value={
                            row.batchMode
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "batchMode",
                              e
                                .target
                                .value
                            )
                          }
                          style={
                            tableInputStyle
                          }
                        >
                          <option value="NEW_BATCH">
                            New Batch
                          </option>

                          <option value="EXISTING_BATCH">
                            Existing Batch
                          </option>
                        </select>
                      </td>

                      {/* Existing batch code */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.batchCode
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "batchCode",
                              e
                                .target
                                .value
                            )
                          }
                          disabled={
                            row.batchMode !==
                            "EXISTING_BATCH"
                          }
                          placeholder="BA000619"
                          style={{
                            ...tableInputStyle,
                            background:
                              row.batchMode ===
                              "EXISTING_BATCH"
                                ? "#fff"
                                : "#f5f5f5"
                          }}
                        />
                      </td>

                      {/* MRP */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.mrp
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "mrp",
                              e
                                .target
                                .value
                            )
                          }
                          disabled={
                            row.batchMode !==
                            "NEW_BATCH"
                          }
                          placeholder="200"
                          style={{
                            ...tableInputStyle,
                            background:
                              row.batchMode ===
                              "NEW_BATCH"
                                ? "#fff"
                                : "#f5f5f5"
                          }}
                        />
                      </td>

                      {/* Cost */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.cost
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "cost",
                              e
                                .target
                                .value
                            )
                          }
                          disabled={
                            row.batchMode !==
                            "NEW_BATCH"
                          }
                          placeholder="150"
                          style={{
                            ...tableInputStyle,
                            background:
                              row.batchMode ===
                              "NEW_BATCH"
                                ? "#fff"
                                : "#f5f5f5"
                          }}
                        />
                      </td>

                      {/* MFD */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          type="datetime-local"
                          value={
                            row.mfd
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "mfd",
                              e
                                .target
                                .value
                            )
                          }
                          disabled={
                            row.batchMode !==
                            "NEW_BATCH"
                          }
                          style={{
                            ...tableInputStyle,
                            background:
                              row.batchMode ===
                              "NEW_BATCH"
                                ? "#fff"
                                : "#f5f5f5"
                          }}
                        />
                      </td>

                      {/* Expiry */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          type="datetime-local"
                          value={
                            row.expiryDate
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "expiryDate",
                              e
                                .target
                                .value
                            )
                          }
                          disabled={
                            row.batchMode !==
                            "NEW_BATCH"
                          }
                          style={{
                            ...tableInputStyle,
                            background:
                              row.batchMode ===
                              "NEW_BATCH"
                                ? "#fff"
                                : "#f5f5f5"
                          }}
                        />
                      </td>

                      {/* Vendor */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.vendorCode
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "vendorCode",
                              e
                                .target
                                .value
                            )
                          }
                          disabled={
                            row.batchMode !==
                            "NEW_BATCH"
                          }
                          placeholder="test_1"
                          style={{
                            ...tableInputStyle,
                            background:
                              row.batchMode ===
                              "NEW_BATCH"
                                ? "#fff"
                                : "#f5f5f5"
                          }}
                        />
                      </td>

                      {/* Vendor batch */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.vendorBatchNumber
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "vendorBatchNumber",
                              e
                                .target
                                .value
                            )
                          }
                          disabled={
                            row.batchMode !==
                            "NEW_BATCH"
                          }
                          placeholder="VB-001"
                          style={{
                            ...tableInputStyle,
                            background:
                              row.batchMode ===
                              "NEW_BATCH"
                                ? "#fff"
                                : "#f5f5f5"
                          }}
                        />
                      </td>

                      {/* SLA */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          type="number"
                          min="0"
                          value={
                            row.sla
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "sla",
                              e
                                .target
                                .value
                            )
                          }
                          style={{
                            ...tableInputStyle,
                            width:
                              "70px"
                          }}
                        />
                      </td>

                      {/* Remarks */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          value={
                            row.remarks
                          }
                          maxLength={
                            255
                          }
                          onChange={(
                            e
                          ) =>
                            updateRow(
                              index,
                              "remarks",
                              e
                                .target
                                .value
                            )
                          }
                          placeholder="Remarks"
                          style={
                            tableInputStyle
                          }
                        />

                        <small
                          style={{
                            color:
                              "#777"
                          }}
                        >
                          {
                            row
                              .remarks
                              .length
                          }
                          /255
                        </small>
                      </td>

                      {/* Action */}
                      <td
                        style={
                          tdStyle
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            removeRow(
                              index
                            )
                          }
                          disabled={
                            rows.length ===
                            1
                          }
                          style={{
                            ...buttonStyle(
                              rows.length ===
                                1
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
                  )
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "flex-end",
              marginTop:
                "20px"
            }}
          >
            <button
              type="submit"
              disabled={
                loading
              }
              style={{
                ...buttonStyle(
                  "#2e7d32"
                ),
                padding:
                  "12px 25px",
                fontSize:
                  "15px",
                opacity:
                  loading
                    ? 0.7
                    : 1
              }}
            >
              {loading
                ? "Adjusting Batch Inventory..."
                : "Adjust Batch Inventory"}
            </button>
          </div>
        </div>
      </form>

      {/* ======================================================
          RESPONSE
      ====================================================== */}

      {response && (
        <ResponseSection
          response={
            response
          }
        />
      )}
    </div>
  );
}

// ============================================================
// Summary Card
// ============================================================

function SummaryCard({
  title,
  value
}) {
  return (
    <div
      style={{
        background:
          "#fff",
        border:
          "1px solid #ddd",
        borderRadius:
          "8px",
        padding:
          "16px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.08)"
      }}
    >
      <div
        style={{
          fontSize:
            "13px",
          color:
            "#666",
          marginBottom:
            "5px"
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            "24px",
          fontWeight:
            "700"
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================
// Response
// ============================================================

function ResponseSection({
  response
}) {
  const results =
    Array.isArray(
      response.inventoryAdjustmentResponses
    )
      ? response.inventoryAdjustmentResponses
      : [];

  const errors =
    Array.isArray(
      response.errors
    )
      ? response.errors
      : [];

  const warnings =
    Array.isArray(
      response.warnings
    )
      ? response.warnings
      : [];

  return (
    <div
      style={
        cardStyle
      }
    >
      <h3
        style={{
          marginTop: 0
        }}
      >
        Uniware Response
      </h3>

      <div
        style={{
          display:
            "flex",
          gap: "10px",
          flexWrap:
            "wrap",
          marginBottom:
            "20px"
        }}
      >
        <span
          style={{
            padding:
              "7px 14px",
            borderRadius:
              "20px",
            background:
              response.successful
                ? "#e8f5e9"
                : "#ffebee",
            color:
              response.successful
                ? "#2e7d32"
                : "#c62828",
            fontWeight:
              "600"
          }}
        >
          {response.successful
            ? "SUCCESS"
            : "FAILED"}
        </span>

        {response.message && (
          <span
            style={{
              padding:
                "7px 14px",
              borderRadius:
                "20px",
              background:
                "#f5f5f5"
            }}
          >
            {
              response.message
            }
          </span>
        )}
      </div>

      {/* Top-level errors */}
      {errors.length >
        0 && (
        <div
          style={{
            marginBottom:
              "20px"
          }}
        >
          <h4
            style={{
              color:
                "#c62828"
            }}
          >
            Errors
          </h4>

          {errors.map(
            (
              error,
              index
            ) => (
              <div
                key={
                  index
                }
                style={{
                  background:
                    "#ffebee",
                  border:
                    "1px solid #ef9a9a",
                  padding:
                    "10px",
                  borderRadius:
                    "5px",
                  marginBottom:
                    "8px"
                }}
              >
                <strong>
                  {error.fieldName ||
                    "Error"}
                </strong>

                {error.message && (
                  <div>
                    {
                      error.message
                    }
                  </div>
                )}

                {error.description && (
                  <div>
                    {
                      error.description
                    }
                  </div>
                )}

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
        </div>
      )}

      {/* Warnings */}
      {warnings.length >
        0 && (
        <div
          style={{
            marginBottom:
              "20px"
          }}
        >
          <h4
            style={{
              color:
                "#ef6c00"
            }}
          >
            Warnings
          </h4>

          {warnings.map(
            (
              warning,
              index
            ) => (
              <div
                key={
                  index
                }
                style={{
                  background:
                    "#fff3e0",
                  border:
                    "1px solid #ffcc80",
                  padding:
                    "10px",
                  borderRadius:
                    "5px",
                  marginBottom:
                    "8px"
                }}
              >
                <strong>
                  {warning.message ||
                    "Warning"}
                </strong>

                {warning.description && (
                  <div>
                    {
                      warning.description
                    }
                  </div>
                )}

                {warning.code !==
                  undefined && (
                  <small>
                    Code:{" "}
                    {
                      warning.code
                    }
                  </small>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Per adjustment results */}
      {results.length >
        0 && (
        <>
          <h4>
            Adjustment Results
          </h4>

          <div
            style={{
              overflowX:
                "auto"
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "1100px"
              }}
            >
              <thead>
                <tr>
                  <th
                    style={
                      thStyle
                    }
                  >
                    SKU
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Facility
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Batch Code
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
                    Shelf
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Transfer Shelf
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Inventory Type
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Adjustment
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Status
                  </th>

                  <th
                    style={
                      thStyle
                    }
                  >
                    Errors
                  </th>
                </tr>
              </thead>

              <tbody>
                {results.map(
                  (
                    result,
                    index
                  ) => {
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
                      <tr
                        key={
                          index
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.itemSKU ||
                            "N/A"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.facilityCode ||
                            "N/A"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.batchCode ||
                            "N/A"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.quantity ??
                            "N/A"}
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
                          {item.transferToShelfCode ||
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
                          {item.adjustmentType ||
                            "N/A"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <strong
                            style={{
                              color:
                                result.successful
                                  ? "#2e7d32"
                                  : "#c62828"
                            }}
                          >
                            {result.successful
                              ? "SUCCESS"
                              : "FAILED"}
                          </strong>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
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
                            "—"
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
          marginTop:
            "20px"
        }}
      >
        <summary
          style={{
            cursor:
              "pointer",
            fontWeight:
              "600"
          }}
        >
          View Raw Response
        </summary>

        <pre
          style={{
            background:
              "#111",
            color:
              "#eee",
            padding:
              "15px",
            borderRadius:
              "6px",
            overflow:
              "auto",
            fontSize:
              "12px",
            marginTop:
              "10px"
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
  background:
    "#fff",
  border:
    "1px solid #ddd",
  borderRadius:
    "8px",
  padding:
    "20px",
  marginBottom:
    "20px",
  boxShadow:
    "0 1px 3px rgba(0,0,0,0.06)"
};

const labelStyle = {
  display:
    "block",
  fontWeight:
    "600",
  marginBottom:
    "7px"
};

const inputStyle = {
  width:
    "100%",
  padding:
    "10px 12px",
  border:
    "1px solid #ccc",
  borderRadius:
    "5px",
  boxSizing:
    "border-box",
  fontSize:
    "14px"
};

const tableInputStyle = {
  width:
    "100%",
  minWidth:
    "105px",
  padding:
    "8px",
  border:
    "1px solid #ccc",
  borderRadius:
    "4px",
  boxSizing:
    "border-box",
  fontSize:
    "13px"
};

const thStyle = {
  border:
    "1px solid #ddd",
  background:
    "#f5f5f5",
  padding:
    "10px",
  textAlign:
    "left",
  fontSize:
    "13px",
  whiteSpace:
    "nowrap"
};

const tdStyle = {
  border:
    "1px solid #ddd",
  padding:
    "8px",
  verticalAlign:
    "top",
  fontSize:
    "13px"
};

const helpStyle = {
  color:
    "#777",
  fontSize:
    "12px"
};

function buttonStyle(
  background
) {
  return {
    border:
      "none",
    background,
    color:
      "#fff",
    padding:
      "9px 14px",
    borderRadius:
      "5px",
    cursor:
      "pointer",
    fontWeight:
      "600"
  };
}

export default AdjustBatchInventoryBulk;