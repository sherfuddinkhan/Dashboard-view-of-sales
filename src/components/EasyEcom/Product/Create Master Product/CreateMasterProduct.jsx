import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CreateMasterProduct = () => {
  const [form, setForm] = useState({
    AccountingSKU: "test_shirt1121",
    AccountingUnit: "12451",
    Brand: "Test1",
    Category: "Shirt1",
    Color: "Black",
    Cost: "2152.72",
    shelf_life: "30",
    Description: "It is an test product",
    EANUPC: "1223456",
    Height: "3",
    Length: "2",
    ModelName: "shirt model name",
    ModelNumber: "Shirt1451",
    Mrp: "2400.00",
    ProductTaxCode: "123",
    Size: "L",
    Sku: "Test_kit_11",
    TaxRuleName: "3",
    ImageURL:
      "https://contents.mediadecathlon.com/p1484240/ab565f3675dbdd7e3c486175e2c16583/p1484240.jpg",
    Weight: "10",
    Width: "2",
    itemType: "2",
    materialType: "1",
  });

  const [subProduct, setSubProduct] = useState([
    {
      sku: "A101",
      quantity: "1",
    },
    {
      sku: "A102",
      quantity: "2",
    },
  ]);

  const [customFields, setCustomFields] = useState({
    Door: "2",
    "With Adapter": "yes",
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

  const handleSubProductChange = (index, field, value) => {
    const updated = [...subProduct];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setSubProduct(updated);
  };

  const handleCustomFieldChange = (key, value) => {
    setCustomFields({
      ...customFields,
      [key]: value,
    });
  };

  const createProduct = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const body = {
        ...form,
        shelf_life: Number(form.shelf_life),
        materialType: Number(form.materialType),

        subProduct: subProduct.map((item) => ({
          sku: item.sku,
          quantity: Number(item.quantity),
        })),

        customFields,
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/products/create-master`,
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
          data.message || "Failed to create master product"
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
      <h2>Create Master Product</h2>

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

      <h3>Sub Products</h3>

      {subProduct.map((item, index) => (
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
            placeholder="SKU"
            value={item.sku}
            onChange={(e) =>
              handleSubProductChange(
                index,
                "sku",
                e.target.value
              )
            }
            style={{ padding: "8px" }}
          />

          <input
            type="number"
            placeholder="Quantity"
            value={item.quantity}
            onChange={(e) =>
              handleSubProductChange(
                index,
                "quantity",
                e.target.value
              )
            }
            style={{ padding: "8px", width: "120px" }}
          />
        </div>
      ))}

      <h3>Custom Fields</h3>

      {Object.entries(customFields).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "10px" }}>
          <label>{key}</label>
          <br />

          <input
            type="text"
            value={value}
            onChange={(e) =>
              handleCustomFieldChange(key, e.target.value)
            }
            style={{
              width: "300px",
              padding: "8px",
            }}
          />
        </div>
      ))}

      <button
        onClick={createProduct}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginTop: "10px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Master Product"}
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

export default CreateMasterProduct;

