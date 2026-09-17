import React, { useState, useEffect } from "react";
import axios from "axios";

const FlipkartProducts = ({ sellerId, customerId }) => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ skuId: "", fsn: "", mrp: "", sellingPrice: "", quantity: "" });

  useEffect(() => {
    axios.get(`/api/flipkart/products?sellerId=${sellerId}&customerId=${customerId}`)
      .then(r => setProducts(r.data.listings || r.data));
  }, [sellerId, customerId]);

  const createProduct = async () => {
    await axios.post("/api/flipkart/products/create", {
      skuId: form.skuId, fsn: form.fsn, mrp: Number(form.mrp),
      sellingPrice: Number(form.sellingPrice), quantity: Number(form.quantity),
      fulfillmentType: "FBF"
    });
    alert("Product Created - FSN: " + form.fsn);
  };

  return (
    <div>
      <h2>Flipkart Products - Listing V3</h2>
      <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10}}>
        <input placeholder="SKU ID" onChange={e=>setForm({...form, skuId:e.target.value})} />
        <input placeholder="FSN" onChange={e=>setForm({...form, fsn:e.target.value})} />
        <input placeholder="MRP" type="number" onChange={e=>setForm({...form, mrp:e.target.value})} />
        <input placeholder="Selling Price" type="number" onChange={e=>setForm({...form, sellingPrice:e.target.value})} />
        <input placeholder="Qty" type="number" onChange={e=>setForm({...form, quantity:e.target.value})} />
      </div>
      <button onClick={createProduct}>Create Listing</button>

      <table style={{width:"100%", marginTop:20}}>
        <thead><tr><th>SKU</th><th>FSN</th><th>MRP</th><th>Selling Price</th><th>Qty</th><th>Status</th></tr></thead>
        <tbody>{products.map(p=><tr key={p.skuId}><td>{p.skuId}</td><td>{p.fsn}</td><td>{p.mrp}</td><td>{p.sellingPrice}</td><td>{p.quantity}</td><td>{p.status}</td></tr>)}</tbody>
      </table>
    </div>
  );
};
export default FlipkartProducts;