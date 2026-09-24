import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const CreateListing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBinded = () => {
    try{
      const saved = localStorage.getItem("bindedProductData");
      const parsed = saved? JSON.parse(saved): null;
      const fromCustomer = location.state?.fromCustomer || parsed?.fromCustomer || null;
      return {
        fromCustomer,
        product: fromCustomer?.products?.[0] || null,
        price: fromCustomer?.prices?.[0] || null,
        inv: fromCustomer?.inventories?.[0] || null,
        brand: fromCustomer?.brands?.[0] || null,
        attr: fromCustomer?.attributes?.[0] || null,
        orderItem: fromCustomer?.marketplaceOrderItems?.[0] || null,
        sellerId: fromCustomer?.sellerId || 6,
        customerId: fromCustomer?.customerId || 3
      };
    }catch{ return { fromCustomer:null, product:null, price:null, inv:null, brand:null, attr:null, orderItem:null, sellerId:6, customerId:3 }; }
  };

  const bind = useMemo(()=>getBinded(), []);
  const c = bind.fromCustomer;
  const p = bind.product;
  const pr = bind.price;
  const inv = bind.inv;
  const b = bind.brand;

  // --- Amazon Credentials - No field missing ---
  const [accessToken, setAccessToken] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
  const [serviceName, setServiceName] = useState("execute-api");
  const [sellerId, setSellerId] = useState("A13V1IB3VIYZZH");
  const [marketplaceId, setMarketplaceId] = useState("");

  // --- Amazon Listing Fields - All binded - No missing ---
  const [form, setForm] = useState({
    sku: p?.sku || c?.marketplaceOrderItems?.[0]?.sku || "TN-WBH-001",
    productType: "PRODUCT",
    requirements: "LISTING",
    item_name: p?.productName || "TechNova Wireless Bluetooth Headphones",
    brand: b?.brandName || p?.brandName || "Samsung",
    manufacturer: p?.addressLabel?.manufacturerDetails?.split(",")[0] || "TechNova Pvt Ltd",
    condition_type: "new_new",
    list_price_value: String(pr?.price || 2499),
    list_price_currency: pr?.currency || "INR",
    quantity: String(inv?.quantity || 100),
    fulfillment_channel_code: "DEFAULT",
    description: p?.description || "Wireless Bluetooth headphones with Bluetooth 5.3 connectivity and long battery life",
    bullet_point_1: `Brand: ${b?.brandName || "Samsung"} - Model TN-WBH-001`,
    bullet_point_2: `Bluetooth Version: ${bind.attr?.attributeValue || "Bluetooth 5.3"}`,
    bullet_point_3: `Weight: ${p?.weight || 0.5} kg - HSN: ${p?.hsnCode || "85183000"}`,
    bullet_point_4: `Seller: ${bind.sellerId} Customer: ${bind.customerId} - ${c?.customerName || "TechNova Retail"}`,
    ean: p?.barcode || "8901234567890",
    ean_type: "EAN",
    item_type_keyword: "wireless-headphones",
  });

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
    const mp = JSON.parse(localStorage.getItem("amazonMarketplaceResponse") || "{}");
    if (mp.payload?.length) setMarketplaceId(mp.payload[0].marketplace.id);
    else setMarketplaceId("A21TJRUUN4KGV");
    if (p) setForm(f=>({
     ...f,
      sku: p.sku || f.sku,
      item_name: p.productName || f.item_name,
      brand: b?.brandName || p.brandName || f.brand,
      manufacturer: p.addressLabel?.manufacturerDetails?.split(",")[0] || f.manufacturer,
      description: p.description || f.description,
      list_price_value: String(pr?.price || f.list_price_value),
      quantity: String(inv?.quantity || f.quantity),
      ean: p.barcode || f.ean,
    }));
  }, []);

  const upd = (k,v) => setForm(s=>({...s,[k]:v}));

  const amazonPayload = useMemo(()=>({
    productType: form.productType,
    requirements: form.requirements,
    attributes: {
      item_name: [{ value: form.item_name }],
      brand: [{ value: form.brand }],
      manufacturer: [{ value: form.manufacturer }],
      condition_type: [{ value: form.condition_type }],
      item_type_keyword: [{ value: form.item_type_keyword }],
      description: [{ value: form.description }],
      bullet_point: [
        { value: form.bullet_point_1 },
        { value: form.bullet_point_2 },
        { value: form.bullet_point_3 },
        { value: form.bullet_point_4 },
      ],
      list_price: [{ value: Number(form.list_price_value), currency: form.list_price_currency }],
      fulfillment_availability: [{ fulfillment_channel_code: form.fulfillment_channel_code, quantity: Number(form.quantity) }],
      externally_assigned_product_identifier: form.ean? [{ type: form.ean_type, value: form.ean }] : [],
    }
  }), [form]);

  const [listings, setListings] = useState([{ sku: form.sku, payload: "" }]);
  useEffect(()=>{ setListings([{ sku: form.sku, payload: JSON.stringify(amazonPayload, null, 2) }]); }, [amazonPayload, form.sku]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const createBulkListings = async () => {
    setLoading(true); setError(""); setResult("");
    try{
      const finalListings = listings.map(l=>({ sku: l.sku, payload: JSON.parse(l.payload) }));
      const res = await axios.post("http://localhost:5000/api/listings/bulk-create", {
        accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, sellerId,
        marketplaceIds: [marketplaceId],
        listings: finalListings,
      });
      setResult(JSON.stringify(res.data, null, 2));
    }catch(e){ setError(e.response? JSON.stringify(e.response.data, null, 2) : e.message); }finally{ setLoading(false); }
  };

  const Field = ({ label, k, bindedFrom }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <label style={{ fontSize:10, fontWeight:700 }}>{label} * binded</label>
      <input value={form[k]||""} onChange={e=>upd(k, e.target.value)} style={{ padding:"7px 9px", border:"1px solid #d1d5db", borderRadius:6, background:"#fffbeb", fontSize:12, borderLeft:"3px solid #f59e0b" }} />
      <span style={{ fontSize:9, color:"#6b7280" }}>from: {bindedFrom}</span>
    </div>
  );

  return (
    <div style={{ maxWidth:1100, margin:"20px auto", padding:16, background:"#fff", borderRadius:12 }}>
      <button type="button" onClick={()=>navigate(-1)} style={{ padding:"6px 12px", border:"1px solid #ddd", borderRadius:6, background:"#fff", cursor:"pointer" }}>← Back Seller {bind.sellerId} Customer {bind.customerId}</button>
      <h2 style={{ margin:"10px 0" }}>Create Listing - Amazon SP-API - Perfect Binding - No Field Missing</h2>

      <div style={{ background:"#fffbeb", padding:10, borderRadius:8, border:"1px solid #fbbf24", fontSize:12, marginBottom:12 }}>
        ✅ Binded: <b>{form.item_name}</b> | SKU: <b>{form.sku}</b> | Brand: {form.brand} | Seller: {bind.sellerId} Customer: {bind.customerId} | Price: {form.list_price_value} {form.list_price_currency} | Qty: {form.quantity} | EAN: {form.ean} | GSTIN: {c?.gstin}
      </div>

      {/* Credentials - No Missing */}
      <div style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:12, marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:12, marginBottom:8, background:"#f8fafc", padding:6, borderRadius:6 }}>Amazon Credentials - All Fields</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}><label style={{ fontSize:10, fontWeight:700 }}>Seller ID * REQUIRED</label><input value={sellerId} onChange={e=>setSellerId(e.target.value)} style={{ padding:7, border:"1px solid #d1d5db", borderRadius:6 }} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}><label style={{ fontSize:10, fontWeight:700 }}>Marketplace ID * REQUIRED - India A21TJRUUN4KGV</label><input value={marketplaceId} onChange={e=>setMarketplaceId(e.target.value)} style={{ padding:7, border:"1px solid #d1d5db", borderRadius:6 }} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}><label style={{ fontSize:10, fontWeight:700 }}>Access Token * REQUIRED - localStorage amazonAccessToken</label><textarea rows={2} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={{ padding:7, border:"1px solid #d1d5db", borderRadius:6, fontSize:11 }} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}><label style={{ fontSize:10, fontWeight:700 }}>AWS Access Key * REQUIRED</label><input value={awsAccessKey} onChange={e=>setAwsAccessKey(e.target.value)} style={{ padding:7, border:"1px solid #d1d5db", borderRadius:6 }} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}><label style={{ fontSize:10, fontWeight:700 }}>AWS Secret Key * REQUIRED</label><input type="password" value={awsSecretKey} onChange={e=>setAwsSecretKey(e.target.value)} style={{ padding:7, border:"1px solid #d1d5db", borderRadius:6 }} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}><label style={{ fontSize:10, fontWeight:700 }}>Region * REQUIRED</label><input value={region} onChange={e=>setRegion(e.target.value)} style={{ padding:7, border:"1px solid #d1d5db", borderRadius:6 }} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}><label style={{ fontSize:10, fontWeight:700 }}>Service Name</label><input value={serviceName} onChange={e=>setServiceName(e.target.value)} style={{ padding:7, border:"1px solid #d1d5db", borderRadius:6 }} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}><label style={{ fontSize:10, fontWeight:700 }}>Environment</label><select value={environment} onChange={e=>setEnvironment(e.target.value)} style={{ padding:7, border:"1px solid #d1d5db", borderRadius:6 }}><option value="sandbox">Sandbox</option><option value="production">Production</option></select></div>
        </div>
      </div>

      {/* Amazon Product Fields - All REQUIRED + binded */}
      <div style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:12, marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:12, marginBottom:8, background:"#ecfdf5", padding:6, borderRadius:6, border:"1px solid #6ee7b7" }}>Amazon Product Fields - REQUIRED - All Binded - No Missing</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          <Field label="SKU * REQUIRED - Top Level" k="sku" bindedFrom="products[0].sku" />
          <Field label="productType * REQUIRED" k="productType" bindedFrom="PRODUCT" />
          <Field label="requirements * REQUIRED" k="requirements" bindedFrom="LISTING" />
          <Field label="item_name * REQUIRED" k="item_name" bindedFrom="products[0].productName" />
          <Field label="brand * REQUIRED" k="brand" bindedFrom="brands[0].brandName / products[0].brandName" />
          <Field label="manufacturer * REQUIRED" k="manufacturer" bindedFrom="products[0].addressLabel.manufacturerDetails" />
          <Field label="condition_type * REQUIRED" k="condition_type" bindedFrom="new_new" />
          <Field label="list_price_value * REQUIRED" k="list_price_value" bindedFrom="prices[0].price 2499" />
          <Field label="list_price_currency" k="list_price_currency" bindedFrom="prices[0].currency INR" />
          <Field label="quantity * REQUIRED fulfillment_availability" k="quantity" bindedFrom="inventories[0].quantity 100" />
          <Field label="fulfillment_channel_code * REQUIRED" k="fulfillment_channel_code" bindedFrom="DEFAULT" />
          <Field label="EAN / Barcode" k="ean" bindedFrom="products[0].barcode 8901234567890" />
          <Field label="item_type_keyword" k="item_type_keyword" bindedFrom="wireless-headphones" />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10, marginTop:10 }}>
          <Field label="description" k="description" bindedFrom="products[0].description" />
          <Field label="bullet_point_1" k="bullet_point_1" bindedFrom="brand + model" />
          <Field label="bullet_point_2" k="bullet_point_2" bindedFrom="attributes[0].Bluetooth 5.3" />
          <Field label="bullet_point_3" k="bullet_point_3" bindedFrom="weight + hsnCode" />
          <Field label="bullet_point_4" k="bullet_point_4" bindedFrom="sellerId customerId customerName" />
        </div>
      </div>

      {/* Final Payload + Listing Button */}
      <div style={{ border:"2px solid #f59e0b", borderRadius:8, padding:12, background:"#fffbeb", marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:12, marginBottom:8 }}>Final Amazon Payload - Auto Updated - Seller {bind.sellerId} Customer {bind.customerId} - {form.sku}</div>
        <textarea rows={20} value={listings[0]?.payload || ""} onChange={e=>{ const u=[...listings]; u[0].payload=e.target.value; setListings(u); }} style={{ width:"100%", fontFamily:"monospace", fontSize:11, padding:10, borderRadius:6, border:"1px solid #d1d5db", background:"#111", color:"#fbbf24" }} />
        <div style={{ display:"flex", gap:10, marginTop:10 }}>
          <button type="button" onClick={createBulkListings} disabled={loading} style={{ padding:"12px 20px", background:"#FF9900", color:"#000", border:"none", borderRadius:8, fontWeight:800, cursor:"pointer", fontSize:14 }}>
            {loading? "Listing to Amazon...": `🚀 List to Amazon - Seller ${bind.sellerId} Customer ${bind.customerId} - ${form.sku} - Real SP-API`}
          </button>
        </div>
      </div>

      {result && (<><h3>✅ Amazon Response - Success</h3><pre style={{ background:"#ecfdf5", padding:12, borderRadius:6, fontSize:11, border:"1px solid #6ee7b7" }}>{result}</pre></>)}
      {error && (<><h3 style={{ color:"red" }}>❌ Amazon Error</h3><pre style={{ color:"red", background:"#fee2e2", padding:10, borderRadius:6, whiteSpace:"pre-wrap" }}>{error}</pre></>)}
    </div>
  );
};

export default CreateListing;