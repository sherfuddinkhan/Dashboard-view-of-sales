import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";
const toNum = (v, f = 0) => { const n = Number(v); return Number.isFinite(n)? n : f; };
const getStock = (inv = {}) => Math.max(0, toNum(inv.quantity) - toNum(inv.reservedQuantity) - toNum(inv.damagedQuantity));
const getPrice = (prices, pid, type) => prices.find(p => p.productId === pid && p.priceType === type && p.isActive) || prices.find(p => p.productId === pid && p.priceType === type) || null;
const getInv = (invs, pid) => invs.find(i => i.productId === pid) || {};

const buildPayload = (api, product, f, mode) => {
  const inventories = api?.inventories || [];
  const prices = api?.prices || [];
  const warehouseLocations = api?.warehouseLocations || [];
  const inv = product? getInv(inventories, product.productId) : {};
  const stock = toNum(f.quantity || getStock(inv) || 100);
  const offer = product? getPrice(prices, product.productId, "OfferPrice") : null;
  const mrp = product? (getPrice(prices, product.productId, "Mrp") || getPrice(prices, product.productId, "MRP")) : null;
  const cur = f.currency || offer?.currency || mrp?.currency || "INR";
  const pkg = product?.packages?.[0] || {};
  const addr = product?.addressLabel || {};
  const sku = f.sku_id || product?.sku || "PRODUCT-1";
  const product_id = f.product_id || product?.externalProductId || product?.barcode || "FSIN123456";

  if (mode === "inventory") {
    return {
      [sku]: {
        product_id: product_id,
        locations: [{ id: f.location_id || "LOC-1", inventory: stock }]
      }
    };
  }

  const locations = warehouseLocations.length? warehouseLocations.map(wl => {
    const locInv = product? inventories.find(i => i.productId === product.productId && i.warehouseId === wl.warehouseId && i.locationId === wl.locationId) : null;
    return { id: wl.locationId?.toString() || f.location_id || "LOC-1", status: f.location_status || "ENABLED", inventory: locInv? getStock(locInv) : stock };
  }) : [{ id: f.location_id || "LOC-1", status: f.location_status || "ENABLED", inventory: stock }];

  return {
    [sku]: {
      product_id: product_id,
      price: { mrp: toNum(f.mrp || mrp?.price || 5000), selling_price: toNum(f.selling_price || offer?.price || 2499), currency: cur },
      tax: { hsn: f.hsn || product?.hsnCode || "85183000", tax_code: f.tax_code || product?.taxCategory || "GST_0" },
      listing_status: f.listing_status || "ACTIVE",
      shipping_fees: { local: toNum(f.shipping_local || 40), zonal: toNum(f.shipping_zonal || 60), national: toNum(f.shipping_national || 80), currency: cur },
      fulfillment_profile: f.fulfillment_profile || "NON_FBF",
      fulfillment: { dispatch_sla: toNum(f.dispatch_sla || 1), procurement_sla: toNum(f.procurement_sla || 2), shipping_provider: f.shipping_provider || "SELLER", procurement_type: f.procurement_type || "REGULAR" },
      packages: [{
        name: f.package_name || pkg.name || `${sku}-PKG-01`,
        dimensions: { length: toNum(f.package_length || 10), breadth: toNum(f.package_breadth || 10), height: toNum(f.package_height || 10) },
        weight: toNum(f.package_weight || 0.5),
        description: f.package_description || product?.productName || "Default Package",
        package_type: f.package_type || "DEFAULT",
        handling: { fragile: f.fragile === "true", hazardous: f.hazardous === "true" },
        notional_value: { amount: toNum(f.notional_amount || 5000), unit: f.notional_unit || cur, currency: cur },
        defects: { count: toNum(f.defect_count || 0), details: f.defect_details? [f.defect_details] : [] }
      }],
      locations: locations,
      address_label: {
        manufacturer_details: [f.manufacturer_details || "Manufacturer - Binded"],
        importer_details: [f.importer_details || "Importer - Binded"],
        packer_details: [f.packer_details || "Packer - Binded"],
        countries_of_origin: [f.country_of_origin || "IN"],
        quantity: f.address_quantity || `${stock} PCS`,
        mrp: f.address_mrp || `${toNum(f.mrp || 5000)} ${cur}`,
      },
      dating_label: { mfg_date: f.mfg_date || String(Math.floor(Date.now()/1000)), shelf_life: f.shelf_life || "31536000", expiry_date: f.expiry_date || "" }
    }
  };
};

const ListingsCommonV3Api = () => {
  const { sellerId, customerId } = useParams();
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(localStorage.getItem("flipkartAccessToken") || "");
  const [apiData, setApiData] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [error, setError] = useState("");
  const [pushResult, setPushResult] = useState("");
  const [mode, setMode] = useState("full");

  const [form, setForm] = useState({
    sku_id:"TN-WBH-001", product_id:"FSIN1234567890", listing_status:"ACTIVE",
    mrp:"5000", selling_price:"2499", currency:"INR",
    hsn:"85183000", tax_code:"GST_0",
    shipping_local:"40", shipping_zonal:"60", shipping_national:"80",
    fulfillment_profile:"NON_FBF", dispatch_sla:"1", procurement_sla:"2", shipping_provider:"SELLER", procurement_type:"REGULAR",
    package_name:"TN-WBH-001-PKG-01", package_length:"10", package_breadth:"10", package_height:"10", package_weight:"0.5", package_description:"Test Product Description", package_type:"DEFAULT", fragile:"false", hazardous:"false", notional_amount:"5000", notional_unit:"INR", defect_count:"0", defect_details:"",
    location_id:"LOC-1", location_status:"ENABLED", quantity:"100",
    manufacturer_details:"Manufacturer Address - Mumbai", importer_details:"Importer Address - Delhi", packer_details:"Packer Address - Mumbai", country_of_origin:"IN", address_quantity:"100 PCS", address_mrp:"5000 INR",
    mfg_date:String(Math.floor(Date.now()/1000)), shelf_life:"31536000", expiry_date:""
  });

  const products = useMemo(() => apiData?.products || [], [apiData]);

  const initForm = (product, api) => {
    const inv = getInv(api.inventories || [], product.productId);
    const offer = getPrice(api.prices || [], product.productId, "OfferPrice");
    const mrp = getPrice(api.prices || [], product.productId, "Mrp") || getPrice(api.prices || [], product.productId, "MRP");
    const pkg = product.packages?.[0] || {};
    const addr = product.addressLabel || {};
    const wl = api.warehouseLocations?.[0] || {};
    const stock = getStock(inv);
    setForm(s=>({
     ...s,
      sku_id: product.sku || s.sku_id,
      product_id: product.externalProductId || product.barcode || String(product.productId),
      listing_status: product.isActive? "ACTIVE" : "INACTIVE",
      mrp: String(mrp?.price || s.mrp), selling_price: String(offer?.price || s.selling_price),
      hsn: product.hsnCode || s.hsn, tax_code: product.taxCategory || s.tax_code,
      shipping_local: String(product.shippingChargeLocal || s.shipping_local),
      shipping_zonal: String(product.shippingChargeRegional || s.shipping_zonal),
      shipping_national: String(product.shippingChargeNational || s.shipping_national),
      fulfillment_profile: product.fulfillmentProfile || s.fulfillment_profile,
      dispatch_sla: String(product.readyToDispatchDays || s.dispatch_sla),
      procurement_sla: String(product.procurementSla || s.procurement_sla),
      package_name: pkg.name || s.package_name,
      package_length: String(pkg.length?? product.length?? s.package_length),
      package_breadth: String(pkg.breadth?? product.width?? s.package_breadth),
      package_height: String(pkg.height?? product.height?? s.package_height),
      package_weight: String(pkg.weight?? product.weight?? s.package_weight),
      package_description: pkg.description || product.description || s.package_description,
      quantity: String(stock || s.quantity),
      location_id: wl.locationId?.toString() || s.location_id,
      manufacturer_details: addr.manufacturerDetails || s.manufacturer_details,
      importer_details: addr.importerDetails || s.importer_details,
      packer_details: addr.packerDetails || s.packer_details,
      country_of_origin: addr.countryOfOrigin || s.country_of_origin,
      mfg_date: String(addr.mfgDateEpoch || s.mfg_date),
      shelf_life: String(addr.shelfLifeSeconds || s.shelf_life),
    }));
  };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get(`${NODE_API}/SellerCustomer/${sellerId}/customers/${customerId}`);
      setApiData(data);
      const first = data.products?.[0];
      if (first) { setSelectedProductId(String(first.productId)); initForm(first, data); }
    } catch (e) {
      setError("SellerCustomer API failed - Using default binded values - " + (e.response? JSON.stringify(e.response.data) : e.message));
    } finally { setLoading(false); }
  }, [sellerId, customerId]);

  useEffect(() => { load(); }, [load]);

  const onProdChange = (e) => {
    const pid = e.target.value; setSelectedProductId(pid);
    const p = products.find(x => String(x.productId) === pid);
    if (p && apiData) initForm(p, apiData);
  };

  const payloadObj = useMemo(() => {
    const prod = products.find(p => String(p.productId) === selectedProductId) || products[0] || null;
    return buildPayload(apiData || {}, prod, form, mode);
  }, [products, selectedProductId, apiData, form, mode]);

  const payload = useMemo(() => JSON.stringify(payloadObj, null, 2), [payloadObj]);

  const push = async () => {
    if (!accessToken) return setError("Paste Flipkart Access Token first - REQUIRED for LIST TO FLIPKART");
    setPushLoading(true); setError(""); setPushResult("");
    try {
      localStorage.setItem("flipkartAccessToken", accessToken);
      const url = mode === "inventory"? `${NODE_API}/flipkart/listings/inventory/${sellerId}/${customerId}` : `${NODE_API}/flipkart/listings/push/${sellerId}/${customerId}`;
      const res = await axios.post(url, payloadObj, { headers: { accessToken } });
      setPushResult(JSON.stringify(res.data, null, 2));
    } catch (e) { setError(e.response? JSON.stringify(e.response.data,null,2): e.message); } finally { setPushLoading(false); }
  };

  const upd = (k,v) => setForm(s=>({...s,[k]:v}));
  const Field = ({ label, k, from, req }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
      <label style={{ fontSize:9, fontWeight:800 }}>{label} {req? <span style={{ color: req==="MANDATORY"? "#dc2626":"#d97706"}}>*{req}</span> : ""}</label>
      <input value={form[k]||""} onChange={e=>upd(k,e.target.value)} style={{ padding:"6px 8px", border:"1px solid #d1d5db", borderRadius:5, background: req==="MANDATORY"? "#fef2f2" : "#fffbeb", fontSize:11, borderLeft: `3px solid ${req==="MANDATORY"? "#dc2626":"#2874F0"}` }} />
      <span style={{ fontSize:8, color:"#6b7280" }}>from: {from} | BINDED: {form[k]}</span>
    </div>
  );

  return (
    <div style={{ width:1280, maxWidth:"97%", margin:"20px auto", fontFamily:"Inter" }}>
      <button onClick={()=>navigate("/marketplaces/flipkart/sellers")} style={{ padding:"6px 12px", borderRadius:6, border:"1px solid #ddd", background:"#fff", cursor:"pointer", marginBottom:10 }}>Back - Flipkart - Sidebar for Every Route</button>
      <h2 style={{ fontSize:15, color:"#2874F0" }}>Flipkart V3 - Seller {sellerId} / Customer {customerId} - Binded Payload at Bottom</h2>

      <div style={{ background:"#fff", border:"2px solid #2874F0", borderRadius:8, padding:12, marginBottom:12 }}>
        <label style={{ fontWeight:800, fontSize:12, color:"#dc2626" }}>Flipkart Access Token - REQUIRED - Paste here then click LIST TO FLIPKART</label>
        <textarea rows={2} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={{ width:"100%", padding:8, borderRadius:6, border:"2px solid #2874F0", fontFamily:"monospace", fontSize:11, marginTop:6 }} placeholder="Bearer eyJ... - REQUIRED" />

        <div style={{ display:"flex", gap:10, marginTop:12, flexWrap:"wrap" }}>
          <button onClick={push} disabled={pushLoading} style={{ background: pushLoading? "#999" : "#2874F0", color:"#fff", border:"none", padding:"14px 24px", borderRadius:8, cursor:"pointer", fontWeight:900, fontSize:14, pointerEvents:"auto" }}>
            {pushLoading? "Listing..." : `🚀 LIST TO FLIPKART - ${form.sku_id}`}
          </button>

          <button onClick={load} disabled={loading} style={{ background:"#fff", border:"1px solid #d1d5db", padding:"12px 16px", borderRadius:8, cursor:"pointer", fontSize:11 }}>
            {loading? "Loading SellerCustomer..." : `Reload ${sellerId}/${customerId}`}
          </button>

          <select value={selectedProductId} onChange={onProdChange} style={{ padding:10, borderRadius:6, border:"1px solid #d1d5db", fontSize:11 }}>
            {products.length? products.map(p=><option key={p.productId} value={p.productId}>{p.productName} - {p.sku}</option>) : <option>Default - {form.sku_id} - Binded Values</option>}
          </select>

          <select value={mode} onChange={e=>setMode(e.target.value)} style={{ padding:10, borderRadius:6, border:"1px solid #d1d5db", fontSize:11, fontWeight:700 }}>
            <option value="full">FULL LISTING - update listings</option>
            <option value="inventory">INVENTORY ONLY</option>
          </select>
        </div>
        <div style={{ fontSize:10, color:"#16a34a", marginTop:6, fontWeight:700 }}>✅ Button is CLICKABLE now - payload always built from form - Not dependent on API - Seller {sellerId} Customer {customerId} Binded</div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:12, marginBottom:12 }}>
        <div style={{ background:"#0f172a", color:"#fbbf24", padding:8, borderRadius:6, fontSize:11, fontWeight:800, marginBottom:10 }}>ALL FIELDS - BINDED - EDITABLE TEXT BOXES - Seller {sellerId} Customer {customerId}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          <Field label="sku_id" k="sku_id" from="products.sku" req="MANDATORY" />
          <Field label="product_id" k="product_id" from="externalProductId" req="MANDATORY" />
          <Field label="listing_status" k="listing_status" from="isActive" req="MANDATORY" />
          <Field label="mrp" k="mrp" from="Mrp price" req="MANDATORY" />
          <Field label="selling_price" k="selling_price" from="OfferPrice" req="MANDATORY" />
          <Field label="currency" k="currency" from="currency" req="MANDATORY" />
          <Field label="hsn" k="hsn" from="hsnCode" req="MANDATORY" />
          <Field label="tax_code" k="tax_code" from="taxCategory" req="MANDATORY" />
          <Field label="shipping_local" k="shipping_local" from="shippingChargeLocal" req="CONDITIONAL" />
          <Field label="shipping_zonal" k="shipping_zonal" from="shippingChargeRegional" req="CONDITIONAL" />
          <Field label="shipping_national" k="shipping_national" from="shippingChargeNational" req="CONDITIONAL" />
          <Field label="fulfillment_profile" k="fulfillment_profile" from="fulfillmentProfile" req="MANDATORY" />
          <Field label="dispatch_sla" k="dispatch_sla" from="readyToDispatchDays" req="CONDITIONAL" />
          <Field label="procurement_sla" k="procurement_sla" from="procurementSla" req="CONDITIONAL" />
          <Field label="shipping_provider" k="shipping_provider" from="shippingProvider" req="MANDATORY" />
          <Field label="procurement_type" k="procurement_type" from="procurementType" req="MANDATORY" />
          <Field label="package_name" k="package_name" from="packages.name" req="MANDATORY" />
          <Field label="package_length" k="package_length" from="length" req="MANDATORY" />
          <Field label="package_breadth" k="package_breadth" from="width" req="MANDATORY" />
          <Field label="package_height" k="package_height" from="height" req="MANDATORY" />
          <Field label="package_weight" k="package_weight" from="weight" req="CONDITIONAL" />
          <Field label="location_id" k="location_id" from="warehouseLocations.locationId" req="MANDATORY" />
          <Field label="location_status" k="location_status" from="isActive" req="MANDATORY" />
          <Field label="quantity" k="quantity" from="quantity - reserved - damaged" req="MANDATORY" />
          <Field label="manufacturer_details" k="manufacturer_details" from="manufacturerDetails" req="MANDATORY" />
          <Field label="packer_details" k="packer_details" from="packerDetails" req="MANDATORY" />
          <Field label="country_of_origin" k="country_of_origin" from="countryOfOrigin" req="MANDATORY" />
          <Field label="mfg_date" k="mfg_date" from="mfgDateEpoch" req="CONDITIONAL" />
          <Field label="shelf_life" k="shelf_life" from="shelfLifeSeconds" req="CONDITIONAL" />
        </div>
      </div>

      {/* ===== BINDED PAYLOAD AT BOTTOM - ALWAYS VISIBLE ===== */}
      <div style={{ background:"#0f172a", border:"2px solid #fbbf24", borderRadius:10, padding:14, marginBottom:20 }}>
        <h3 style={{ color:"#fbbf24", fontSize:13, margin:"0 0 8px" }}>📦 BINDED FLIPKART PAYLOAD - Bottom - Seller {sellerId} Customer {customerId} - SKU {form.sku_id} - Real Flipkart V3 Exact - All Fields Binded - Route /marketplaces/flipkart/listings/v3/{sellerId}/{customerId}</h3>
        <div style={{ fontSize:10, color:"#94a3b8", marginBottom:8 }}>BINDED VALUES: product_id={form.product_id} | mrp={form.mrp} selling={form.selling_price} {form.currency} | hsn={form.hsn} | qty={form.quantity} loc={form.location_id} | fulfillment={form.fulfillment_profile}</div>
        <textarea rows={30} readOnly value={payload} style={{ width:"100%", padding:12, borderRadius:8, border:"1px solid #fbbf24", fontFamily:"monospace", fontSize:11, background:"#111", color:"#fbbf24", minHeight:500 }} />
        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          <button onClick={push} disabled={pushLoading} style={{ background:"#fbbf24", color:"#000", border:"none", padding:"14px 26px", borderRadius:8, cursor:"pointer", fontWeight:900, fontSize:14 }}>
            {pushLoading? "Listing to Flipkart..." : `🚀 LIST TO FLIPKART NOW - BOTTOM BUTTON - ${form.sku_id}`}
          </button>
          <button onClick={()=>navigator.clipboard.writeText(payload)} style={{ background:"#fff", border:"1px solid #ddd", padding:"12px 18px", borderRadius:8, cursor:"pointer", fontSize:12 }}>Copy Binded JSON</button>
        </div>
      </div>

      {pushResult && <div style={{ background:"#fff", border:"1px solid green", borderRadius:8, padding:12 }}><h3 style={{ color:"green", fontSize:12 }}>✅ Listed to Flipkart - Success</h3><textarea rows={10} readOnly value={pushResult} style={{ width:"100%", fontFamily:"monospace", fontSize:11, padding:8, border:"1px solid green", borderRadius:6 }} /></div>}
      {error && <div style={{ background:"#fff", border:"1px solid red", borderRadius:8, padding:12, marginTop:12 }}><h3 style={{ color:"red", fontSize:12 }}>Error / Info</h3><textarea rows={4} readOnly value={error} style={{ width:"100%", fontFamily:"monospace", fontSize:11, color:"#b91c1c", padding:8, border:"1px solid #ef4444", borderRadius:6 }} /></div>}
    </div>
  );
};

export default ListingsCommonV3Api;