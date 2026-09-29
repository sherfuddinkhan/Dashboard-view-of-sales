import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const UpdateMasterProduct = () => {
  const [form, setForm] = useState({
    productId: "70479716",
    Color: "DarkGrey",
    Cost: "3200.00",
    Description: "It is used to test update product api",
    ModelName: "12345",
    shelf_life: "50",
    Mrp: "42000.00",
  });

  const [customFields, setCustomFields] = useState({
    Door: "3",
    Warranty: "10",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomFieldChange = (e) => {
    setCustomFields({
      ...customFields,
      [e.target.name]: e.target.value,
    });
  };

  const updateProduct = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const body = {
        productId: Number(form.productId),
        Color: form.Color,
        Cost: form.Cost,
        Description: form.Description,
        ModelName: form.ModelName,
        shelf_life: Number(form.shelf_life),
        Mrp: form.Mrp,
        customFields,
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/products/update-master`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to update master product"
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
    <div style={{ padding: "20px" }}>
      <h2>Update Master Product</h2>

      {Object.entries(form).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "12px" }}>
          <label>{key}</label>
          <br />

          <input
            type="text"
            name={key}
            value={value}
            onChange={handleChange}
            style={{
              width: "500px",
              padding: "8px",
            }}
          />
        </div>
      ))}

      <h3>Custom Fields</h3>

      {Object.entries(customFields).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "12px" }}>
          <label>{key}</label>
          <br />

          <input
            type="text"
            name={key}
            value={value}
            onChange={handleCustomFieldChange}
            style={{
              width: "300px",
              padding: "8px",
            }}
          />
        </div>
      ))}

      <button
        onClick={updateProduct}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginTop: "10px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Updating..." : "Update Master Product"}
      </button>

      {error && (
        <div
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          {error}
        </div>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflow: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default UpdateMasterProduct;

