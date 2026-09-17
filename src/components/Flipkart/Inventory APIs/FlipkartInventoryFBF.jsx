import React, { useState } from "react";
import axios from "axios";

const FlipkartInventoryFBF = () => {
  const [form, setForm] = useState({ skuId: "", locationId: "DEFAULT", inventory: "", fulfillmentType: "FBF" });

  const updateInventory = async () => {
    const res = await axios.post("/api/flipkart/inventory/fbf/update", form);
    alert(res.data.message);
  };

  return (
    <div>
      <h2>Inventory - FBF / FBF Lite</h2>
      <p>Fields: skuId, locationId, inventory, fulfillmentType</p>
      <input placeholder="SKU ID" value={form.skuId} onChange={e=>setForm({...form, skuId:e.target.value})} />
      <input placeholder="Location ID" value={form.locationId} onChange={e=>setForm({...form, locationId:e.target.value})} />
      <input placeholder="Quantity" type="number" value={form.inventory} onChange={e=>setForm({...form, inventory:e.target.value})} />
      <select value={form.fulfillmentType} onChange={e=>setForm({...form, fulfillmentType:e.target.value})}>
        <option value="FBF">FBF - Flipkart Fulfilled</option>
        <option value="FBF_LITE">FBF Lite</option>
        <option value="NFBF">NFBF - Non FBF</option>
      </select>
      <button onClick={updateInventory}>Update Inventory</button>
    </div>
  );
};
export default FlipkartInventoryFBF;