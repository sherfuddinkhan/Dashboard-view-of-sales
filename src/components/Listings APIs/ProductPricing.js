import React, { useState } from "react";
import axios from "axios";

const MARKETPLACES = [
  { id: "A21TJRUUN4KGV", name: "India (IN)" },
  { id: "ATVPDKIKX0DER", name: "United States (US)" },
  { id: "A1F83G8C2ARO7P", name: "United Kingdom (UK)" },
  { id: "A1PA6795UKMFR9", name: "Germany (DE)" },
  { id: "A13V1IB3VIYZZH", name: "France (FR)" },
  { id: "A1VC38T7YXB528", name: "Japan (JP)" }
];

const ProductPricing = () => {
  // Consolidating search parameters into a clean state object
  const [searchParams, setSearchParams] = useState({
    asin: "",
    marketplaceId: "A21TJRUUN4KGV",
  });

  const [uiState, setUiState] = useState({
    loading: false,
    error: "",
    pricingData: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const getPricing = async (e) => {
    e.preventDefault(); // Prevents page reload on form submit
    
    if (!searchParams.asin.trim()) {
      setUiState((prev) => ({ ...prev, error: "Please enter a valid ASIN" }));
      return;
    }

    setUiState({ loading: true, error: "", pricingData: null });

    try {
      const response = await axios.get("http://localhost:5000/api/product-pricing", {
        params: {
          asin: searchParams.asin.trim().toUpperCase(),
          marketplaceId: searchParams.marketplaceId
        }
      });

      setUiState({
        loading: false,
        error: "",
        pricingData: response.data
      });
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Unable to connect to the pricing server";
      setUiState({
        loading: false,
        error: errorMessage,
        pricingData: null
      });
    }
  };

  const { pricingData, loading, error } = uiState;

  return (
    <div className="pricing-container" style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2>Amazon Product Pricing Dashboard</h2>
      
      {/* Wrapped inputs in a form so users can just hit "Enter" to search */}
      <form onSubmit={getPricing} className="search-box" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label htmlFor="marketplaceId" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Marketplace
            </label>
            <select
              id="marketplaceId"
              name="marketplaceId"
              value={searchParams.marketplaceId}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px" }}
            >
              {MARKETPLACES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1", minWidth: "200px" }}>
            <label htmlFor="asin" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              ASIN
            </label>
            <input
              id="asin"
              type="text"
              name="asin"
              placeholder="e.g., B08L5VJYV2"
              value={searchParams.asin}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: "0.5rem 1.5rem", borderRadius: "4px", cursor: "pointer" }}
          >
            {loading ? "Fetching..." : "Get Pricing"}
          </button>
        </div>
      </form>

      {/* Status Messages */}
      {loading && <div className="loading" style={{ textAlign: "center", margin: "2rem 0" }}>Gathering real-time Amazon values...</div>}
      {error && <div className="error" style={{ color: "red", padding: "1rem", border: "1px solid red", borderRadius: "4px", margin: "1rem 0" }}>{error}</div>}

      {/* Data Visualization Grid */}
      {pricingData && (
        <div className="pricing-results" style={{ marginTop: "2rem" }}>
          <h3>Metrics Summary</h3>
          <div className="cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div className="card" style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "6px" }}>
              <h4>Listing Price</h4>
              <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                {pricingData.currency} {pricingData.listingPrice ?? "N/A"}
              </p>
            </div>
            <div className="card" style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "6px" }}>
              <h4>Buy Box Price</h4>
              <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2e7d32" }}>
                {pricingData.currency} {pricingData.buyBoxPrice ?? "N/A"}
              </p>
            </div>
            <div className="card" style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "6px" }}>
              <h4>Active Offers</h4>
              <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{pricingData.offers ?? 0}</p>
            </div>
            <div className="card" style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "6px" }}>
              <h4>Condition</h4>
              <p style={{ fontSize: "1.25rem", fontWeight: "bold", textTransform: "capitalize" }}>{pricingData.condition || "New"}</p>
            </div>
          </div>

          <h3>Full Item Record</h3>
          <table className="pricing-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
                <th style={{ padding: "0.75rem", borderBottom: "2px solid #ddd" }}>ASIN</th>
                <th style={{ padding: "0.75rem", borderBottom: "2px solid #ddd" }}>Marketplace</th>
                <th style={{ padding: "0.75rem", borderBottom: "2px solid #ddd" }}>Listing Price</th>
                <th style={{ padding: "0.75rem", borderBottom: "2px solid #ddd" }}>Buy Box</th>
                <th style={{ padding: "0.75rem", borderBottom: "2px solid #ddd" }}>Offers</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>{pricingData.asin}</td>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>{pricingData.marketplace}</td>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>{pricingData.currency} {pricingData.listingPrice}</td>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>{pricingData.currency} {pricingData.buyBoxPrice}</td>
                <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>{pricingData.offers}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductPricing;