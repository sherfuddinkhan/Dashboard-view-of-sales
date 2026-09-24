import React, { useState } from "react";
import axios from "axios";

const ListingsUpdate = () => {
  const [sku, setSku] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGet = async () => {
    try { setLoading(true); const res = await axios.get(`http://localhost:5000/api/flipkart/listings/${sku}`); setResult(res.data); }
    catch(e){ alert(e.message); } finally{ setLoading(false); }
  };
  const handleUpdate = async () => {
    try { setLoading(true); const res = await axios.put(`http://localhost:5000/api/flipkart/listings/${sku}`, { sku, price: 999 }); setResult(res.data); alert("Updated"); }
    catch(e){ alert(e.message); } finally{ setLoading(false); }
  };

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>📦 Listings Update & Get - API 10</h2>
      <p>PUT /sellers/v3/listings/{`{sku}`} | GET /sellers/v3/listings/{`{sku}`}</p>
      <input placeholder="Enter SKU" value={sku} onChange={e=>setSku(e.target.value)} style={{ padding: "10px", margin: "10px 10px 10px 0", borderRadius: "6px", border: "1px solid #ddd", width: "300px" }} />
      <button onClick={handleGet} disabled={loading} style={{ padding: "10px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", marginRight: "8px" }}>Get Listing</button>
      <button onClick={handleUpdate} disabled={loading} style={{ padding: "10px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px" }}>Update Listing</button>
      {result && <pre style={{ marginTop: "16px", background: "#f3f4f6", padding: "12px", borderRadius: "6px" }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};
export default ListingsUpdate;