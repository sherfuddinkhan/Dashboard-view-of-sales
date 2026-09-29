
import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CreateListing = () => {
  const [form, setForm] = useState({
    marketplaceId: "2",
    sku: "Test_listing",
    listingRefNum: "FKabcd123",
    guid: "FKguid",
    mrp: "2915",
    sellingPrice: "2500",
    category: "shirts",
    title: "shirt",
    imageURL:
      "https://contents.mediadecathlon.com/p1484240/ab565f3675dbdd7e3c486175e2c16583/p1484240.jpg",
    brand: "nike",
    size: "XL",
    weight: "200",
    height: "5",
    length: "10",
    breadth: "5",
    color: "black",
    identifier: "abcd1231",
    productUniqueCode: "123ABCD",
    cost: "2400",
    taxRate: "0.18",
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

  const createListing = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const body = {
        marketplaceId: form.marketplaceId,
        sku: form.sku,
        listingRefNum: form.listingRefNum,
        guid: form.guid,
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        category: form.category,
        title: form.title,
        imageURL: form.imageURL,
        brand: form.brand,
        size: form.size,
        weight: Number(form.weight),
        height: Number(form.height),
        length: Number(form.length),
        breadth: Number(form.breadth),
        color: form.color,
        identifier: form.identifier,
        productUniqueCode: form.productUniqueCode,
        cost: Number(form.cost),
        taxRate: form.taxRate,
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/products/create-listing`,
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
          data.message || "Failed to create listing"
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
      <h2>Create Listing</h2>

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

      <button
        onClick={createListing}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginTop: "10px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Listing"}
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

export default CreateListing;

