import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";

const AmazonDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [productSales, setProductSales] = useState([]);
  const [customerSales, setCustomerSales] = useState([]);
  const [finance, setFinance] = useState([]);
  const [shipping, setShipping] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch according to 9 base tables -> 5 views
  const fetchData = async () => {
    try {
      setLoading(true);

      // vwProductSales -> Uses FactSales + DimProduct (TotalUnitsSold, TotalSales)
      if (activeTab === "products") {
        const res = await axios.get(`${API_BASE_URL}/vwProductSales`);
        setProductSales(res.data.data || res.data || []);
      }

      // vwCustomerSales -> Uses FactSales + DimCustomer (TotalOrders, TotalRevenue, AverageOrderValue)
      if (activeTab === "customers") {
        const res = await axios.get(`${API_BASE_URL}/vwCustomerSales`);
        setCustomerSales(res.data.data || res.data || []);
      }

      // vwFinance -> Uses FactFinance + DimSeller (Charges, Fees, Taxes, Settlement)
      if (activeTab === "finance") {
        const res = await axios.get(`${API_BASE_URL}/vwFinance`);
        setFinance(res.data.data || res.data || []);
      }

      // vwShipping -> Uses FactShipping (ShipmentStatus, DeliveryDays, Returned)
      if (activeTab === "shipping") {
        const res = await axios.get(`${API_BASE_URL}/vwShipping`);
        setShipping(res.data.data || res.data || []);
      }

      // vwListings -> Uses FactListings + FactInventory + DimProduct
      if (activeTab === "listings") {
        const res = await axios.get(`${API_BASE_URL}/vwListings`);
        setListings(res.data.data || res.data || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // ML Algorithms mapping to your 9 base tables
  const mlModels = {
    products: { model: "Random Forest", func: "listing_prediction()", file: "random_forest.py" },
    customers: { model: "KMeans", func: "CustomerSegmentation().perform_clustering()", file: "kmeans.py" },
    finance: { model: "Isolation Forest", func: "detect_anomaly()", file: "isolation_forest.py" },
    shipping: { model: "Decision Tree", func: "return_prediction()", file: "decision_tree.py" },
    listings: { model: "ABC Analysis", func: "abc_analysis()", file: "abc_analysis.py" }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AmazonSellerAnalytics - 19 Tables</h1>
      <p>9 Base: DimCustomer, DimProduct, DimDate, DimSeller, FactSales, FactFinance, FactInventory, FactListings, FactShipping</p>
      <p>10 SP-API: ProductPricing, Reports, Feeds, Notifications, MerchantShipments, AmazonShipping, RestrictedTokens, Uploads, MarketplaceParticipations, Authorizations</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {["products", "customers", "finance", "shipping", "listings"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ fontWeight: activeTab === tab? "bold" : "normal" }}>
            {tab}
          </button>
        ))}
      </div>

      {loading? <p>Loading from {activeTab}...</p> : (
        <div style={{ marginTop: 20 }}>
          {activeTab === "products" && (
            <table border="1">
              <thead>
                <tr>
                  <th>ProductKey</th><th>ASIN</th><th>SKU</th><th>ProductName</th><th>Category</th><th>TotalUnitsSold</th><th>TotalSales</th>
                </tr>
              </thead>
              <tbody>
                {productSales.map((p, i) => (
                  <tr key={i}>
                    <td>{p.ProductKey}</td><td>{p.ASIN}</td><td>{p.SKU}</td><td>{p.ProductName}</td><td>{p.Category}</td><td>{p.TotalUnitsSold}</td><td>{p.TotalSales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "customers" && (
            <table border="1">
              <thead>
                <tr>
                  <th>CustomerName</th><th>TotalOrders</th><th>TotalQuantity</th><th>TotalRevenue</th><th>AverageOrderValue</th>
                </tr>
              </thead>
              <tbody>
                {customerSales.map((c, i) => (
                  <tr key={i}>
                    <td>{c.CustomerName}</td><td>{c.TotalOrders}</td><td>{c.TotalQuantity}</td><td>{c.TotalRevenue}</td><td>{c.AverageOrderValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 20, background: "#f5f5f5", padding: 10 }}>
            <p>ML Model: {mlModels[activeTab].model}</p>
            <code>{mlModels[activeTab].file} - {mlModels[activeTab].func}</code>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmazonDashboard;