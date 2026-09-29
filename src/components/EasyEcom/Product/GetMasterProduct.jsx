import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetMasterProduct() {
  const [form, setForm] = useState({
    category: "",
    includeLocations: 0,
    cpIds: "",
    limit: 200,
    product_type: "",
    active: "",
    updated_after: "",
    custom_fields: 0
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getMasterProducts = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const params = {};

      if (form.category.trim()) {
        params.category = form.category.trim();
      }

      if (form.includeLocations !== "") {
        params.includeLocations = Number(form.includeLocations);
      }

      if (form.cpIds.trim()) {
        params.cpIds = form.cpIds.trim();
      }

      if (form.limit !== "") {
        params.limit = Number(form.limit);
      }

      if (form.product_type !== "") {
        params.product_type = Number(form.product_type);
      }

      if (form.active !== "") {
        params.active = Number(form.active);
      }

      if (form.updated_after.trim()) {
        params.updated_after = form.updated_after.trim();
      }

      if (form.custom_fields !== "") {
        params.custom_fields = Number(form.custom_fields);
      }

      const result = await axios.get(
        `${SERVER_URL}/api/easyecom/products/master`,
        {
          params
        }
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data ||
        {
          message: err.message
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Get Master Product</h2>

      <p>
        Get EasyEcom master products according to location and optional
        filters.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(250px, 1fr))",
          gap: "16px",
          maxWidth: "900px"
        }}
      >
        <div>
          <label>Category</label>

          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          />
        </div>

        <div>
          <label>Include Locations</label>

          <select
            name="includeLocations"
            value={form.includeLocations}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          >
            <option value="0">
              0 - Current Location
            </option>

            <option value="1">
              1 - All Locations
            </option>
          </select>
        </div>

        <div>
          <label>CP IDs</label>

          <input
            type="text"
            name="cpIds"
            value={form.cpIds}
            onChange={handleChange}
            placeholder="Example: 12345,12346"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          />

          <small>
            Maximum 10 comma-separated product IDs.
          </small>
        </div>

        <div>
          <label>Limit</label>

          <input
            type="number"
            name="limit"
            value={form.limit}
            min="1"
            max="200"
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          />
        </div>

        <div>
          <label>Product Type</label>

          <select
            name="product_type"
            value={form.product_type}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          >
            <option value="">All Product Types</option>
            <option value="0">0 - Normal Product</option>
            <option value="1">1 - Combo</option>
            <option value="2">2 - Kit/BOM</option>
            <option value="3">3 - Variant Parent</option>
          </select>
        </div>

        <div>
          <label>Active</label>

          <select
            name="active"
            value={form.active}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          >
            <option value="">All</option>
            <option value="1">1 - Active</option>
            <option value="0">0 - Inactive</option>
          </select>
        </div>

        <div>
          <label>Updated After</label>

          <input
            type="text"
            name="updated_after"
            value={form.updated_after}
            onChange={handleChange}
            placeholder="Example: 2026-07-01 00:00:00"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          />
        </div>

        <div>
          <label>Custom Fields</label>

          <select
            name="custom_fields"
            value={form.custom_fields}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          >
            <option value="0">
              0 - Without Custom Fields
            </option>

            <option value="1">
              1 - Include Custom Fields
            </option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          onClick={getMasterProducts}
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Loading..." : "Get Master Products"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: "20px" }}>
          <h3>Error</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflow: "auto"
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>EasyEcom Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflow: "auto",
              maxHeight: "600px"
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default GetMasterProduct;