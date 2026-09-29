
import React, { useState } from "react";

const CreateKittingProduct = () => {
  const [formData, setFormData] = useState({
    AccountingSKU: "",
    AccountingUnit: "",
    Brand: "BLUESTAR",
    Category: "Refrigerator",
    Color: "Black",
    Cost: "29152.72",
    Description:
      "BLUE STAR INVERTER Refrigerator 1.0 TON 3STAR 3CNHW12OATU (BI/BO)",
    EANUPC: "124",
    Height: "2",
    ImageURL: "",
    Length: "1",
    ModelName:
      "BLUE STAR INVERTER Refrigerator 1.0 TON 3STAR 3CNHW12OATU (BI/BO)",
    ModelNumber: "BI/BO-3CNHW12OATU",
    Mrp: "44000.00",
    ProductTaxCode: "1",
    Size: "L",
    Sku: "Test_kit_11",
    TaxRuleName: "",
    Weight: "2",
    Width: "3",
    materialType: 1,
  });

  const [subProducts, setSubProducts] = useState([
    {
      sku: "cello01",
      quantity: 1,
    },
    {
      sku: "gala01",
      quantity: 2,
    },
  ]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubProductChange = (index, field, value) => {
    setSubProducts((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "sku" ? value : Number(value),
            }
          : item
      )
    );
  };

  const addSubProduct = () => {
    setSubProducts((prev) => [
      ...prev,
      {
        sku: "",
        quantity: 1,
      },
    ]);
  };

  const removeSubProduct = (index) => {
    setSubProducts((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const payload = {
        ...formData,
        materialType: Number(formData.materialType),
        subProduct: subProducts,
      };

      const res = await fetch(
        "http://localhost:5000/api/easyecom/products/create-kitting",
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
          data.message ||
            data.error ||
            "Create Kitting Product failed"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    "AccountingSKU",
    "AccountingUnit",
    "Brand",
    "Category",
    "Color",
    "Cost",
    "Description",
    "EANUPC",
    "Height",
    "ImageURL",
    "Length",
    "ModelName",
    "ModelNumber",
    "Mrp",
    "ProductTaxCode",
    "Size",
    "Sku",
    "TaxRuleName",
    "Weight",
    "Width",
    "materialType",
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto" }}>
      <h2>Create Kitting Product</h2>

      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div
            key={field}
            style={{ marginBottom: "15px" }}
          >
            <label>{field}</label>

            {field === "Description" ? (
              <textarea
                name={field}
                value={formData[field]}
                onChange={handleChange}
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                }}
              />
            ) : (
              <input
                type={
                  field === "materialType"
                    ? "number"
                    : "text"
                }
                name={field}
                value={formData[field]}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                }}
              />
            )}
          </div>
        ))}

        <h3>Sub Products</h3>

        {subProducts.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "5px",
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <label>SKU</label>
              <input
                type="text"
                value={item.sku}
                onChange={(e) =>
                  handleSubProductChange(
                    index,
                    "sku",
                    e.target.value
                  )
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleSubProductChange(
                    index,
                    "quantity",
                    e.target.value
                  )
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            {subProducts.length > 1 && (
              <button
                type="button"
                onClick={() => removeSubProduct(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addSubProduct}
          style={{ marginRight: "10px" }}
        >
          Add Sub Product
        </button>

        <button type="submit" disabled={loading}>
          {loading
            ? "Creating..."
            : "Create Kitting Product"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
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

export default CreateKittingProduct;

