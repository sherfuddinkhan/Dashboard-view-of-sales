import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GATEPASS_TYPES = [
  "RETURNABLE",
  "NON_RETURNABLE",
  "RETURN_TO_VENDOR",
  "STOCK_TRANSFER"
];

const GATEPASS_STATUSES = [
  "CREATED",
  "CLOSED",
  "DISCARDED",
  "RETURN_AWAITED"
];

function SearchGatepasses() {
  // ----------------------------------------------------------
  // Default dates
  // ----------------------------------------------------------

  const getDefaultFromDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    return date.toISOString().slice(0, 16);
  };

  const getDefaultToDate = () => {
    return new Date().toISOString().slice(0, 16);
  };

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  const [facility, setFacility] = useState("MAIN");

  const [fromDate, setFromDate] = useState(
    getDefaultFromDate()
  );

  const [toDate, setToDate] = useState(
    getDefaultToDate()
  );

  const [type, setType] = useState("");

  const [toParty, setToParty] = useState("");

  const [statusCode, setStatusCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const [selectedGatepass, setSelectedGatepass] =
    useState(null);

  // ----------------------------------------------------------
  // Request Preview
  // ----------------------------------------------------------

  const requestPreview = useMemo(() => {
    const payload = {
      facility,
      fromDate,
      toDate
    };

    if (type) {
      payload.type = type;
    }

    if (toParty.trim()) {
      payload.toParty = toParty.trim();
    }

    if (statusCode) {
      payload.statusCode = statusCode;
    }

    return payload;
  }, [
    facility,
    fromDate,
    toDate,
    type,
    toParty,
    statusCode
  ]);

  // ----------------------------------------------------------
  // Search
  // ----------------------------------------------------------

  const handleSearch = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setSelectedGatepass(null);

    if (!facility.trim()) {
      setError("Facility is required.");
      return;
    }

    if (!fromDate) {
      setError("From date is required.");
      return;
    }

    if (!toDate) {
      setError("To date is required.");
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (Number.isNaN(from.getTime())) {
      setError("Invalid from date.");
      return;
    }

    if (Number.isNaN(to.getTime())) {
      setError("Invalid to date.");
      return;
    }

    if (from > to) {
      setError(
        "From date cannot be greater than to date."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        facility: facility.trim(),
        fromDate,
        toDate
      };

      if (type) {
        payload.type = type;
      }

      if (toParty.trim()) {
        payload.toParty = toParty.trim();
      }

      if (statusCode) {
        payload.statusCode = statusCode;
      }

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/gatepasses/search`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      console.error(
        "Search Gatepasses Error:",
        err
      );

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to search gatepasses."
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
    setFromDate(getDefaultFromDate());
    setToDate(getDefaultToDate());
    setType("");
    setToParty("");
    setStatusCode("");
    setResult(null);
    setError("");
    setSelectedGatepass(null);
  };

  // ----------------------------------------------------------
  // Format timestamp
  // ----------------------------------------------------------

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  // ----------------------------------------------------------
  // Status badge
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

  // ----------------------------------------------------------
  // Select Gatepass
  // ----------------------------------------------------------

  const handleSelectGatepass = (gatepass) => {
    setSelectedGatepass(gatepass);
  };

  return (
    <div
      style={{
        maxWidth: "1250px",
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
              color: "#1565c0"
            }}
          >
            Search Gatepasses
          </h2>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px"
            }}
          >
            Search Uniware gatepasses using date,
            type, party and status filters.
          </p>
        </div>

        {/* Search Form */}

        <form onSubmit={handleSearch}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "18px"
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
                  setFacility(e.target.value)
                }
                placeholder="MAIN"
                style={inputStyle}
              />

              <small style={helpStyle}>
                Uniware Facility code.
              </small>
            </div>

            {/* To Party */}

            <div>
              <label style={labelStyle}>
                To Party
              </label>

              <input
                type="text"
                value={toParty}
                onChange={(e) =>
                  setToParty(e.target.value)
                }
                placeholder="Unique Exports"
                style={inputStyle}
              />

              <small style={helpStyle}>
                Optional party name.
              </small>
            </div>

            {/* From Date */}

            <div>
              <label style={labelStyle}>
                From Date *
              </label>

              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(e.target.value)
                }
                style={inputStyle}
              />
            </div>

            {/* To Date */}

            <div>
              <label style={labelStyle}>
                To Date *
              </label>

              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) =>
                  setToDate(e.target.value)
                }
                style={inputStyle}
              />
            </div>

            {/* Type */}

            <div>
              <label style={labelStyle}>
                Gatepass Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
                style={inputStyle}
              >
                <option value="">
                  All Types
                </option>

                {GATEPASS_TYPES.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Status */}

            <div>
              <label style={labelStyle}>
                Gatepass Status
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
                <option value="">
                  All Statuses
                </option>

                {GATEPASS_STATUSES.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Buttons */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "22px"
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
                ? "Searching..."
                : "Search Gatepasses"}
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
              marginTop: "20px",
              padding: "14px",
              background: "#ffebee",
              border: "1px solid #ef9a9a",
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
            marginTop: "24px"
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

        {/* Search Result */}

        {result && (
          <div style={{ marginTop: "28px" }}>
            {/* Result Summary */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "15px",
                padding: "15px",
                background: "#f5f7fa",
                borderRadius: "8px"
              }}
            >
              <div>
                <strong>
                  Search Result
                </strong>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#666",
                    fontSize: "13px"
                  }}
                >
                  {result.message ||
                    "Gatepass search completed."}
                </div>
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700"
                }}
              >
                {result.totalRecords ??
                  result.elements?.length ??
                  0}
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
                    padding: "14px",
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
                          marginTop:
                            "8px"
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
                    padding: "14px",
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
                          marginTop:
                            "8px"
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

            {/* Table */}

            {Array.isArray(
              result.elements
            ) &&
            result.elements.length > 0 ? (
              <div
                style={{
                  overflowX: "auto",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px"
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth: "900px"
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
                        style={thStyle}
                      >
                        #
                      </th>

                      <th
                        style={thStyle}
                      >
                        Gatepass Code
                      </th>

                      <th
                        style={thStyle}
                      >
                        Type
                      </th>

                      <th
                        style={thStyle}
                      >
                        Status
                      </th>

                      <th
                        style={thStyle}
                      >
                        Created
                      </th>

                      <th
                        style={thStyle}
                      >
                        To Party
                      </th>

                      <th
                        style={thStyle}
                      >
                        Reference
                      </th>

                      <th
                        style={thStyle}
                      >
                        Username
                      </th>

                      <th
                        style={thStyle}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.elements.map(
                      (gatepass, index) => {
                        const statusStyle =
                          getStatusStyle(
                            gatepass.statusCode
                          );

                        return (
                          <tr
                            key={
                              gatepass.code ||
                              index
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
                              {index + 1}
                            </td>

                            <td
                              style={{
                                ...tdStyle,
                                fontWeight:
                                  "600",
                                color:
                                  "#1565c0"
                              }}
                            >
                              {
                                gatepass.code
                              }
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {
                                gatepass.type ||
                                "N/A"
                              }
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <span
                                style={{
                                  ...statusStyle,
                                  display:
                                    "inline-block",
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "12px",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "600"
                                }}
                              >
                                {
                                  gatepass.statusCode ||
                                  "N/A"
                                }
                              </span>
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {formatDate(
                                gatepass.created
                              )}
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {
                                gatepass.toParty ||
                                "N/A"
                              }
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {gatepass.reference ||
                                "N/A"}
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {
                                gatepass.username ||
                                "N/A"
                              }
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectGatepass(
                                    gatepass
                                  )
                                }
                                style={
                                  smallButtonStyle
                                }
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
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
                No gatepasses found for the
                selected filters.
              </div>
            )}

            {/* Selected Gatepass */}

            {selectedGatepass && (
              <div
                style={{
                  marginTop: "22px",
                  padding: "18px",
                  background: "#e3f2fd",
                  border:
                    "1px solid #90caf9",
                  borderRadius: "8px"
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    color: "#1565c0"
                  }}
                >
                  Selected Gatepass
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "12px"
                  }}
                >
                  <InfoItem
                    label="Gatepass Code"
                    value={
                      selectedGatepass.code
                    }
                  />

                  <InfoItem
                    label="Type"
                    value={
                      selectedGatepass.type
                    }
                  />

                  <InfoItem
                    label="Status"
                    value={
                      selectedGatepass.statusCode
                    }
                  />

                  <InfoItem
                    label="To Party"
                    value={
                      selectedGatepass.toParty
                    }
                  />

                  <InfoItem
                    label="Reference"
                    value={
                      selectedGatepass.reference
                    }
                  />

                  <InfoItem
                    label="Username"
                    value={
                      selectedGatepass.username
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    background: "#fff",
                    borderRadius: "6px",
                    fontSize: "13px"
                  }}
                >
                  <strong>
                    Next step:
                  </strong>{" "}
                  Use this gatepass code with your
                  Get Gatepass API to retrieve the
                  complete gatepass details.
                </div>
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
// Reusable UI
// ------------------------------------------------------------

function InfoItem({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "12px",
        borderRadius: "6px"
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#777",
          marginBottom: "4px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: "600"
        }}
      >
        {value || "N/A"}
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

const smallButtonStyle = {
  padding: "7px 12px",
  border: "none",
  borderRadius: "5px",
  background: "#1565c0",
  color: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600"
};

const thStyle = {
  padding: "12px 10px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  borderBottom: "1px solid #ddd"
};

const tdStyle = {
  padding: "11px 10px",
  fontSize: "13px",
  verticalAlign: "middle"
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

export default SearchGatepasses;