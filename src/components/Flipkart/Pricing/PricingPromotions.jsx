import React, { useState } from "react";
import axios from "axios";

const PricingPromotions = () => {
  const [sku, setSku] = useState("");
  const [mrp, setMrp] = useState("");
  const [discount, setDiscount] = useState("");

  const createPromo = async () => {
    try { await axios.post("http://localhost:5000/api/flipkart/pricing/promo", { sku, mrp, discount }); alert("Promotion Created"); }
    catch(e){ alert(e.message); }
  };

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>💰 Pricing Promotions & MRP - API 13</h2>
      <p>POST /sellers/promotions | PUT /sellers/v3/pricing</p>
      <div style={{ maxWidth: "400px", marginTop: "20px" }}>
        <input placeholder="SKU" value={sku} onChange={e=>setSku(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
        <input placeholder="MRP" value={mrp} onChange={e=>setMrp(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
        <input placeholder="Discount %" value={discount} onChange={e=>setDiscount(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
        <button onClick={createPromo} style={{ width: "100%", padding: "10px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "6px" }}>Create Promotion</button>
      </div>
    </div>
  );
};
export default PricingPromotions;