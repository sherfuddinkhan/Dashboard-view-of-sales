import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTypes = async () => {
    try { setLoading(true); const res = await axios.get("http://localhost:5000/api/flipkart/product-types"); setTypes(res.data?.data || res.data || []); }
    catch(e){ console.error(e); } finally{ setLoading(false); }
  };
  useEffect(()=>{ fetchTypes(); },[]);

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>🧱 Product Types & Categories - API 11</h2>
      <p>GET /sellers/v2/product-types</p>
      <button onClick={fetchTypes} style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", marginTop: "12px" }}>Refresh</button>
      <div style={{ marginTop: "16px" }}>{loading ? "Loading..." : types.length === 0 ? "No data - Check backend" : <ul>{types.slice(0,20).map((t,i)=><li key={i}>{t.name || t.id || JSON.stringify(t)}</li>)}</ul>}</div>
    </div>
  );
};
export default ProductTypes;