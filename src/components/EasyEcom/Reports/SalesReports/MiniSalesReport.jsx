import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const MiniSalesReport = () => {
  const [reportType, setReportType] = useState("MINI_SALES_REPORT");
  const [invoiceType, setInvoiceType] = useState("ALL");
  const [warehouseIds, setWarehouseIds] = useState(
    "en284227****,ne286963****"
  );
  const [dateType, setDateType] = useState("ORDER_DATE");
  const [startDate, setStartDate] = useState("2023-05-24");
  const [endDate, setEndDate] = useState("2023-06-05");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");
    setLoading(true);

    try {
      const payload = {
        reportType,
        params: {
          invoiceType,
          warehouseIds,
          dateType,
          startDate,
          endDate,
        },
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/reports/queue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to generate Mini Sales Report"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h2>Mini Sales Report</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Report Type</label>
          <input
            type="text"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Invoice Type</label>
          <select
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          >
            <option value="ALL">ALL</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Warehouse IDs</label>
          <input
            type="text"
            value={warehouseIds}
            onChange={(e) => setWarehouseIds(e.target.value)}
            placeholder="warehouse1,warehouse2"
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Date Type</label>
          <select
            value={dateType}
            onChange={(e) => setDateType(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          >
            <option value="ORDER_DATE">ORDER_DATE</option>
            <option value="INVOICE_DATE">INVOICE_DATE</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Mini Sales Report"}
        </button>
      </form>

      {error && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#ffe6e6",
            color: "red",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default MiniSalesReport;

