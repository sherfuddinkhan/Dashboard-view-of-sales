import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000"; // Node
// const SERVER_URL = "https://localhost:7203"; //.NET

function MarketplaceCustomerForm() {
  const [form, setForm] = useState({
    sellerId: 6,
    customerId: 3,
    marketplaceCustomerId: "",
    marketplaceName: "MANUAL",
    companyName: "Tamil Nadu Client",
    gstin: "33AARFB4347G042",
    email: "tn.client@gmail.com",
    phone: "9876543210",
    address: "T Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    stateCode: "33",
    pincode: "600017",
    createdAt: new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
     ...prev,
      [name]: value,
     ...(name === "gstin"? { stateCode: value.substring(0, 2) } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
       ...form,
        sellerId: Number(form.sellerId),
        customerId: Number(form.customerId),
        createdAt: new Date().toISOString()
      };

      const res = await axios.post(`${SERVER_URL}/api/marketplace/customers`, payload, {
        headers: { "Content-Type": "application/json" }
      });

      setResult(res.data);
      alert(`Created ID: ${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>Create Marketplace Customer</h3>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input name="sellerId" value={form.sellerId} onChange={handleChange} placeholder="Seller ID" />
        <input name="customerId" value={form.customerId} onChange={handleChange} placeholder="Customer ID" />
        <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name" required />
        <input name="gstin" value={form.gstin} onChange={handleChange} placeholder="GSTIN" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
        <div style={{ display: "flex", gap: 10 }}>
          <input name="city" value={form.city} onChange={handleChange} placeholder="City" style={{ flex: 1 }} />
          <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" style={{ flex: 1 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input name="state" value={form.state} onChange={handleChange} placeholder="State" style={{ flex: 1 }} />
          <input name="stateCode" value={form.stateCode} onChange={handleChange} placeholder="State Code" style={{ flex: 1 }} />
        </div>
        <select name="marketplaceName" value={form.marketplaceName} onChange={handleChange}>
          <option value="MANUAL">MANUAL</option>
          <option value="AMAZON">AMAZON</option>
          <option value="FLIPKART">FLIPKART</option>
        </select>
        <button type="submit" disabled={loading} style={{ padding: 10, background: "#1976d2", color: "#fff", border: 0, borderRadius: 4 }}>
          {loading? "Creating..." : "Create Customer"}
        </button>
      </form>

      {result && (
        <pre style={{ marginTop: 20, background: "#f5f5f5", padding: 10 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default MarketplaceCustomerForm;