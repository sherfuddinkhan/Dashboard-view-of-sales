import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetInventoryDetails = () => {
  const [form, setForm] = useState({
    includeLocations: "1",
    limit: "50",
    inlcudeCustomers: "0",
    sku: "112233",
    get_back_orders: "false",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setForm({
      includeLocations: "1",
      limit: "50",
      inlcudeCustomers: "0",
      sku: "",
      get_back_orders: "false",
    });

    setResponse(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const params = new URLSearchParams({
        includeLocations: form.includeLocations,
        limit: form.limit,
        inlcudeCustomers: form.inlcudeCustomers,
        sku: form.sku,
        get_back_orders: form.get_back_orders,
      });

      const res = await fetch(
        `${SERVER_URL}/api/getInventoryDetailsV3?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get inventory details."
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
        maxWidth: "900px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Inventory Details</h2>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          <div>
            <label>Include Locations</label>
            <select
              name="includeLocations"
              value={form.includeLocations}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            >
              <option value="1">1 - Yes</option>
              <option value="0">0 - No</option>
            </select>
          </div>

          <div>
            <label>Limit</label>
            <input
              type="number"
              name="limit"
              min="1"
              value={form.limit}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label>Include Customers</label>
            <select
              name="inlcudeCustomers"
              value={form.inlcudeCustomers}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            >
              <option value="0">0 - No</option>
              <option value="1">1 - Yes</option>
            </select>
          </div>

          <div>
            <label>SKU</label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="112233"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label>Get Back Orders</label>
            <select
              name="get_back_orders"
              value={form.get_back_orders}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            >
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              marginRight: "10px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Get Inventory Details"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            border: "1px solid #ff9999",
            background: "#ffe5e5",
            color: "#b00000",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetInventoryDetails;