import React, { useState, useEffect } from "react";
import axios from "axios";

const InventoryNonFBF = () => {
  const [locations, setLocations] = useState([]);
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("");

  const fetchLocations = async () => {
    try { const res = await axios.get("http://localhost:5000/api/flipkart/warehouses"); setLocations(res.data?.data || []); }
    catch(e){ console.error(e); }
  };
  const updateStock = async () => {
    try { await axios.post("http://localhost:5000/api/flipkart/inventory/non-fbf", { sku, quantity: qty }); alert("Non-FBF Stock Updated"); }
    catch(e){ alert(e.message); }
  };
  useEffect(()=>{ fetchLocations(); },[]);

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>📦 Inventory Non-FBF & Warehouses - API 12</h2>
      <p>POST /sellers/v3/stocks | GET /sellers/v2/warehouses</p>
      <div style={{ marginTop: "16px" }}>
        <h4>Warehouses: {locations.length}</h4>
        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <input placeholder="SKU" value={sku} onChange={e=>setSku(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
          <input placeholder="Quantity" value={qty} onChange={e=>setQty(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
          <button onClick={updateStock} style={{ padding: "10px 16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: "6px" }}>Update Non-FBF</button>
        </div>
      </div>
    </div>
  );
};
export default InventoryNonFBF;