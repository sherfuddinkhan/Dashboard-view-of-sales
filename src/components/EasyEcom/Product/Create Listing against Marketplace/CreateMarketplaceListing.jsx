import React, { useState } from "react";

const CreateMarketplaceListing = () => {
  const [listings, setListings] = useState([
    {
      marketplaceId: "8",
      sku: "Nokia 7.3",
      mpSku: "MPtest81",
      mpProductId: "hgcvjhg",
    },
    {
      marketplaceId: "8",
      sku: "Sam02",
      mpSku: "MPtest70",
      mpProductId: "gfdhjbj6541",
    },
    {
      marketplaceId: "233",
      sku: "Sam06",
      mpSku: "MPtest81",
      mpProductId: "5g4h5gf5#4$",
    },
    {
      marketplaceId: "2",
      sku: "Sam06",
      mpSku: "MPtest82",
      mpProductId: "316156",
    },
    {
      marketplaceId: "517",
      sku: "Sam06",
      mpSku: "MPtest67",
      mpProductId: "894361",
    },
  ]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (index, field, value) => {
    setListings((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const addListing = () => {
    setListings((prev) => [
      ...prev,
      {
        marketplaceId: "",
        sku: "",
        mpSku: "",
        mpProductId: "",
      },
    ]);
  };

  const removeListing = (index) => {
    setListings((prev) =>
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
        data: listings,
      };

      const res = await fetch(
        "http://localhost:5000/api/easyecom/products/v2/create-listings",
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
            "Create Listing Against Marketplace failed"
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
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h2>Create Listing Against Marketplace</h2>

      <form onSubmit={handleSubmit}>
        {listings.map((listing, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "6px",
            }}
          >
            <h4>Listing {index + 1}</h4>

            <div style={{ marginBottom: "10px" }}>
              <label>Marketplace ID</label>
              <input
                type="text"
                value={listing.marketplaceId}
                onChange={(e) =>
                  handleChange(
                    index,
                    "marketplaceId",
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
              <label>SKU</label>
              <input
                type="text"
                value={listing.sku}
                onChange={(e) =>
                  handleChange(
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
              <label>Marketplace SKU</label>
              <input
                type="text"
                value={listing.mpSku}
                onChange={(e) =>
                  handleChange(
                    index,
                    "mpSku",
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
              <label>Marketplace Product ID</label>
              <input
                type="text"
                value={listing.mpProductId}
                onChange={(e) =>
                  handleChange(
                    index,
                    "mpProductId",
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

            {listings.length > 1 && (
              <button
                type="button"
                onClick={() => removeListing(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addListing}
          style={{ marginRight: "10px" }}
        >
          Add Listing
        </button>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Listings"}
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

export default CreateMarketplaceListing;

