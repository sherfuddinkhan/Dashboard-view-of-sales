import React, { useState } from "react";
import axios from "axios";

const FlipkartPricing = () => {
  const [form, setForm] = useState({ skuId: "", mrp: "", sellingPrice: "", specialPrice: "" });
  const updatePrice = async () => {
    const res = await axios.post("/api/flipkart/pricing/update", {
      skuId: form.skuId, mrp: Number(form.mrp), sellingPrice: Number(form.sellingPrice), specialPrice: Number(form.specialPrice)
    });
    alert(res.data.message);
  };
  return (
    <div>
      <h2>Flipkart Pricing - MRP / Selling Price / Special Price</h2>
      <input placeholder="SKU ID" onChange={e=>setForm({...form, skuId:e.target.value})} />
      <input placeholder="MRP" type="number" onChange={e=>setForm({...form, mrp:e.target.value})} />
      <input placeholder="Selling Price" type="number" onChange={e=>setForm({...form, sellingPrice:e.target.value})} />
      <input placeholder="Special Price (Big Billion Days)" type="number" onChange={e=>setForm({...form, specialPrice:e.target.value})} />
      <button onClick={updatePrice}>Update Price</button>
    </div>
  );
};
export default FlipkartPricing;