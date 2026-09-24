import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const VendorBackorderItems = () => {
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [warnings, setWarnings] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);

  const [vendorId, setVendorId] = useState("");
  const [itemTypeName, setItemTypeName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [noVendors, setNoVendors] = useState(false);

  const [searchKey, setSearchKey] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [sortColumnIndex, setSortColumnIndex] = useState(0);
  const [sortDirection, setSortDirection] = useState("asc");

  const totalPages = useMemo(() => {
    if (!totalRecords) return 1;

    return Math.ceil(totalRecords / pageSize);
  }, [totalRecords, pageSize]);

  const fetchBackorderItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setWarnings([]);

      const payload = {
        vendorId: vendorId ? Number(vendorId) : 0,

        itemTypeName: itemTypeName.trim(),

        categoryCode: categoryCode.trim()
          ? categoryCode.trim()
          : null,

        noVendors,

        searchOptions: {
          searchKey: searchKey.trim(),

          displayLength: pageSize,

          displayStart: page * pageSize,

          columns: 0,

          sortingCols: 1,

          sortColumnIndex,

          sortDirection,

          columnNames: "",

          getCount: true
        }
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/purchase/vendor-backorder-items`,
        payload
      );

      const data = response.data;

      if (data.successful === false) {
        setError(data.message || "Unable to fetch backorder items");
        setItems([]);
        setTotalRecords(0);
        return;
      }

      setItems(Array.isArray(data.elements) ? data.elements : []);

      setTotalRecords(Number(data.totalRecords || 0));

      setMessage(data.message || "");

      setWarnings(
        Array.isArray(data.warnings)
          ? data.warnings
          : []
      );
    } catch (err) {
      console.error(err);

      setItems([]);
      setTotalRecords(0);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch vendor backorder items"
      );
    } finally {
      setLoading(false);
    }
  }, [
    vendorId,
    itemTypeName,
    categoryCode,
    noVendors,
    searchKey,
    page,
    pageSize,
    sortColumnIndex,
    sortDirection
  ]);

  useEffect(() => {
    fetchBackorderItems();
  }, [fetchBackorderItems]);

  const handleSearch = () => {
    setPage(0);

    // fetchBackorderItems will run because page changes.
    if (page === 0) {
      fetchBackorderItems();
    }
  };

  const handleReset = () => {
    setVendorId("");
    setItemTypeName("");
    setCategoryCode("");
    setNoVendors(false);
    setSearchKey("");
    setPage(0);
    setSortColumnIndex(0);
    setSortDirection("asc");
  };

  const handleSort = (columnIndex) => {
    if (sortColumnIndex === columnIndex) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortColumnIndex(columnIndex);
      setSortDirection("asc");
    }

    setPage(0);
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "#f5f6f8",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              Vendor Backorder Items
            </h2>

            <div
              style={{
                color: "#666",
                marginTop: "5px"
              }}
            >
              Uniware Purchase Backorder Items
            </div>
          </div>

          <button
            onClick={fetchBackorderItems}
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Filters */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "20px"
          }}
        >
          <div>
            <label style={labelStyle}>
              Vendor ID
            </label>

            <input
              type="number"
              value={vendorId}
              onChange={(e) => {
                setVendorId(e.target.value);
                setPage(0);
              }}
              placeholder="Vendor ID"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Item Type Name
            </label>

            <input
              type="text"
              value={itemTypeName}
              onChange={(e) => {
                setItemTypeName(e.target.value);
                setPage(0);
              }}
              placeholder="Item type name"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Category Code
            </label>

            <input
              type="text"
              value={categoryCode}
              onChange={(e) => {
                setCategoryCode(e.target.value);
                setPage(0);
              }}
              placeholder="Category code"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Search
            </label>

            <input
              type="text"
              value={searchKey}
              onChange={(e) => {
                setSearchKey(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="SKU / product / vendor"
              style={inputStyle}
            />
          </div>
        </div>

        {/* No Vendors */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px"
          }}
        >
          <input
            type="checkbox"
            checked={noVendors}
            onChange={(e) => {
              setNoVendors(e.target.checked);
              setPage(0);
            }}
            id="noVendors"
          />

          <label htmlFor="noVendors">
            Show items with no vendors
          </label>

          <button
            onClick={handleSearch}
            style={{
              ...buttonStyle,
              marginLeft: "15px"
            }}
          >
            Search
          </button>

          <button
            onClick={handleReset}
            style={secondaryButtonStyle}
          >
            Reset
          </button>
        </div>

        {/* Error */}

        {error && (
          <div style={errorStyle}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Message */}

        {message && !error && (
          <div style={successStyle}>
            {message}
          </div>
        )}

        {/* Warnings */}

        {warnings.length > 0 && (
          <div style={warningStyle}>
            {warnings.map((warning, index) => (
              <div key={index}>
                {warning.message ||
                  warning.description ||
                  "Warning"}
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px"
          }}
        >
          <div style={statCardStyle}>
            <div style={statLabelStyle}>
              Total Records
            </div>

            <strong style={statValueStyle}>
              {totalRecords}
            </strong>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>
              Current Page
            </div>

            <strong style={statValueStyle}>
              {page + 1}
            </strong>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>
              Items Displayed
            </div>

            <strong style={statValueStyle}>
              {items.length}
            </strong>
          </div>
        </div>

        {/* Table */}

        <div
          style={{
            overflowX: "auto",
            border: "1px solid #ddd",
            borderRadius: "8px"
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff"
            }}
          >
            <thead>
              <tr>
                <th
                  style={thStyle}
                  onClick={() => handleSort(0)}
                >
                  #
                </th>

                <th
                  style={thStyle}
                  onClick={() => handleSort(1)}
                >
                  SKU
                </th>

                <th style={thStyle}>
                  Product
                </th>

                <th style={thStyle}>
                  Brand
                </th>

                <th style={thStyle}>
                  Color
                </th>

                <th style={thStyle}>
                  Size
                </th>

                <th
                  style={thStyle}
                  onClick={() => handleSort(6)}
                >
                  Waiting Qty
                </th>

                <th style={thStyle}>
                  Vendors
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: "40px",
                      textAlign: "center"
                    }}
                  >
                    Loading vendor backorder items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#777"
                    }}
                  >
                    No backorder items found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={`${item.skuCode}-${index}`}>
                    <td style={tdStyle}>
                      {page * pageSize + index + 1}
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {item.skuCode || "N/A"}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px"
                        }}
                      >
                        {item.itemTypeImageUrl && (
                          <img
                            src={item.itemTypeImageUrl}
                            alt={item.name || "Product"}
                            style={{
                              width: "45px",
                              height: "45px",
                              objectFit: "contain",
                              border: "1px solid #ddd",
                              borderRadius: "5px"
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        )}

                        <div>
                          <div>
                            {item.name || "N/A"}
                          </div>

                          {item.itemTypePageUrl && (
                            <a
                              href={item.itemTypePageUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: "12px"
                              }}
                            >
                              View Item
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {item.brand || "N/A"}
                    </td>

                    <td style={tdStyle}>
                      {item.color || "N/A"}
                    </td>

                    <td style={tdStyle}>
                      {item.size || "N/A"}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: "bold",
                        color:
                          Number(item.waitingQuantity) > 0
                            ? "#d32f2f"
                            : "#333"
                      }}
                    >
                      {item.waitingQuantity ?? 0}
                    </td>

                    <td style={tdStyle}>
                      {item.vendorItemTypes?.length ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                          }}
                        >
                          {item.vendorItemTypes.map(
                            (vendor, vendorIndex) => (
                              <div
                                key={vendorIndex}
                                style={{
                                  padding: "8px",
                                  background: "#f7f7f7",
                                  borderRadius: "5px"
                                }}
                              >
                                <div>
                                  <strong>
                                    {vendor.vendorName ||
                                      "N/A"}
                                  </strong>
                                </div>

                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#666"
                                  }}
                                >
                                  Vendor ID:{" "}
                                  {vendor.vendorId ?? "N/A"}
                                </div>

                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#666"
                                  }}
                                >
                                  Code:{" "}
                                  {vendor.vendorCode ||
                                    "N/A"}
                                </div>

                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#666"
                                  }}
                                >
                                  Vendor SKU:{" "}
                                  {vendor.vendorSkuCode ||
                                    "N/A"}
                                </div>

                                <div
                                  style={{
                                    fontSize: "12px",
                                    marginTop: "3px"
                                  }}
                                >
                                  Unit Price: ₹
                                  {formatPrice(
                                    vendor.unitPrice
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            color: "#999"
                          }}
                        >
                          No Vendor
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px"
          }}
        >
          <div>
            Showing{" "}
            {totalRecords === 0
              ? 0
              : page * pageSize + 1}{" "}
            -{" "}
            {Math.min(
              (page + 1) * pageSize,
              totalRecords
            )}{" "}
            of {totalRecords}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              style={{
                padding: "7px"
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <button
              disabled={page === 0 || loading}
              onClick={() =>
                setPage((current) =>
                  Math.max(0, current - 1)
                )
              }
              style={secondaryButtonStyle}
            >
              Previous
            </button>

            <span>
              Page {page + 1} of {totalPages}
            </span>

            <button
              disabled={
                page >= totalPages - 1 || loading
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages - 1,
                    current + 1
                  )
                )
              }
              style={secondaryButtonStyle}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  marginBottom: "5px"
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 10px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  outline: "none"
};

const buttonStyle = {
  padding: "9px 16px",
  border: "none",
  borderRadius: "5px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600"
};

const secondaryButtonStyle = {
  padding: "8px 14px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  background: "#fff",
  cursor: "pointer"
};

const thStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
  background: "#f5f5f5",
  textAlign: "left",
  fontSize: "13px",
  cursor: "pointer",
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
  fontSize: "13px"
};

const errorStyle = {
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "5px",
  background: "#ffebee",
  color: "#c62828"
};

const successStyle = {
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "5px",
  background: "#e8f5e9",
  color: "#2e7d32"
};

const warningStyle = {
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "5px",
  background: "#fff8e1",
  color: "#8d6e00"
};

const statCardStyle = {
  minWidth: "150px",
  padding: "15px",
  background: "#f8f9fa",
  border: "1px solid #e5e5e5",
  borderRadius: "7px"
};

const statLabelStyle = {
  fontSize: "12px",
  color: "#777"
};

const statValueStyle = {
  display: "block",
  fontSize: "22px",
  marginTop: "4px"
};

export default VendorBackorderItems;