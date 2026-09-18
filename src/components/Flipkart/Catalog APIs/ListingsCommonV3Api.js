import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const toNumber = (v, f = 0) => { const n = Number(v); return Number.isFinite(n)? n : f; };
const getAvailableStock = (inv = {}) => Math.max(0, toNumber(inv.quantity) - toNumber(inv.reservedQuantity) - toNumber(inv.damagedQuantity));
const getPrice = (prices, productId, type) => prices.find(p => p.productId === productId && p.priceType === type && p.isActive) || prices.find(p => p.productId === productId && p.priceType === type) || null;
const getInventory = (inventories, productId) => inventories.find(i => i.productId === productId) || {};

// ================= REAL FLIPKART V3 PAYLOAD BUILDER - Perfect Binding =================
const buildFlipkartPayload = (api, product, formOverride) => {
  const { inventories = [], prices = [], warehouseLocations = [], warehouses = [] } = api;
  const inventory = getInventory(inventories, product.productId);
  const availableStock = toNumber(formOverride?.quantity?? getAvailableStock(inventory));
  const offerPrice = getPrice(prices, product.productId, "OfferPrice");
  const mrpPrice = getPrice(prices, product.productId, "Mrp") || getPrice(prices, product.productId, "MRP");
  const currency = formOverride?.currency || offerPrice?.currency || mrpPrice?.currency || "INR";
  const packageData = product.packages?.[0] || {};
  const addressLabel = product.addressLabel || {};
  const sku = formOverride?.sku_id || product.sku || `PRODUCT-${product.productId}`;
  const externalProductId = formOverride?.product_id || product.externalProductId || product.barcode || String(product.productId);

  const locations = warehouseLocations.map(wl => {
    const locInv = inventories.find(i => i.productId === product.productId && i.warehouseId === wl.warehouseId && i.locationId === wl.locationId);
    const wh = warehouses.find(w => w.warehouseId === wl.warehouseId);
    return {
      id: wl.locationId?.toString() || null,
      status: wl.isActive? "ENABLED" : "DISABLED",
      inventory: locInv? getAvailableStock(locInv) : availableStock,
      listing_status: formOverride?.listing_status || wl.listingStatus || (product.isActive? "ACTIVE" : "INACTIVE"),
      warehouse_id: wl.warehouseId?.toString() || null,
      warehouse_name: wh?.warehouseName || null,
      fulfillment_profile: wl.fulfillmentProfile || product.fulfillmentProfile || "NON_FBF",
    };
  });

  return {
    [sku]: {
      sku_id: sku,
      product_id: externalProductId,
      price: {
        mrp: toNumber(formOverride?.mrp?? mrpPrice?.price),
        selling_price: toNumber(formOverride?.selling_price?? offerPrice?.price),
        currency,
      },
      tax: {
        hsn: formOverride?.hsn || product.hsnCode || null,
        tax_code: formOverride?.tax_code || product.taxCategory || null,
      },
      listing_status: formOverride?.listing_status || (product.isActive? "ACTIVE" : "INACTIVE"),
      shipping_fees: {
        local: toNumber(formOverride?.shipping_local?? product.shippingChargeLocal),
        zonal: toNumber(formOverride?.shipping_zonal?? product.shippingChargeRegional),
        national: toNumber(formOverride?.shipping_national?? product.shippingChargeNational),
        currency,
      },
      fulfillment_profile: formOverride?.fulfillment_profile || product.fulfillmentProfile || (product.fulfillmentType === "SELF"? "NON_FBF" : "FBF_LITE"),
      fulfillment: {
        dispatch_sla: toNumber(formOverride?.dispatch_sla?? product.readyToDispatchDays),
        procurement_sla: toNumber(formOverride?.procurement_sla?? product.procurementSla?? 2),
        shipping_provider: formOverride?.shipping_provider || product.shippingProvider || "SELLER",
        procurement_type: formOverride?.procurement_type || product.procurementType || "REGULAR",
      },
      packages: [{
        name: formOverride?.package_name || packageData.name || `${sku}-PKG-01`,
        dimensions: {
          length: toNumber(formOverride?.package_length?? packageData.length?? product.length),
          breadth: toNumber(formOverride?.package_breadth?? packageData.breadth?? product.width),
          height: toNumber(formOverride?.package_height?? packageData.height?? product.height),
        },
        weight: toNumber(formOverride?.package_weight?? packageData.weight?? product.weight),
        description: formOverride?.package_description || packageData.description || product.description || product.productName,
        package_type: packageData.packageType || "DEFAULT",
        handling: { fragile: Boolean(packageData.isFragile), hazardous: Boolean(packageData.isHazardous) },
        notional_value: { amount: toNumber(mrpPrice?.price?? offerPrice?.price), unit: currency, currency },
        defects: { count: toNumber(packageData.defectCount), details: packageData.defectDetails? [packageData.defectDetails] : [] },
      }],
      locations: locations.length? locations : [{ id: "LOC-1", status: "ENABLED", inventory: availableStock, listing_status: "ACTIVE" }],
      address_label: {
        manufacturer_details: [formOverride?.manufacturer_details || addressLabel.manufacturerDetails || null],
        importer_details: [formOverride?.importer_details || addressLabel.importerDetails || null],
        packer_details: [formOverride?.packer_details || addressLabel.packerDetails || null],
        countries_of_origin: [formOverride?.country_of_origin || addressLabel.countryOfOrigin || null],
        quantity: `${availableStock} ${product.unitOfMeasure || "PCS"}`,
        mrp: mrpPrice? `${mrpPrice.price} ${currency}` : null,
      },
      dating_label: {
        mfg_date: formOverride?.mfg_date || addressLabel.mfgDateEpoch?.toString() || null,
        shelf_life: formOverride?.shelf_life || addressLabel.shelfLifeSeconds?.toString() || null,
        expiry_date: addressLabel.expiryDateEpoch?.toString() || null,
      },
    },
  };
};

const ListingsCommonV3Api = () => {
  const { sellerId, customerId } = useParams();
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState("");
  const [apiData, setApiData] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [error, setError] = useState("");
  const [pushResult, setPushResult] = useState("");

  // Editable form - All binded - No field missing
  const [form, setForm] = useState({
    sku_id: "", product_id: "", mrp: "", selling_price: "", currency: "INR",
    hsn: "", tax_code: "", listing_status: "ACTIVE",
    shipping_local: "", shipping_zonal: "", shipping_national: "",
    fulfillment_profile: "NON_FBF", dispatch_sla: "", procurement_sla: "", shipping_provider: "SELLER", procurement_type: "REGULAR",
    package_name: "", package_length: "", package_breadth: "", package_height: "", package_weight: "", package_description: "",
    quantity: "", manufacturer_details: "", importer_details: "", packer_details: "", country_of_origin: "", mfg_date: "", shelf_life: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("flipkartAccessToken");
    if (token) setAccessToken(token);
    const binded = localStorage.getItem("bindedProductData");
    if (binded) {
      try{ const p = JSON.parse(binded); if (p.fromCustomer) setApiData(p.fromCustomer); }catch{}
    }
  }, []);

  const products = useMemo(() => apiData?.products || [], [apiData]);

  const initFormFromProduct = (product, api) => {
    const inv = getInventory(api.inventories || [], product.productId);
    const offer = getPrice(api.prices || [], product.productId, "OfferPrice");
    const mrp = getPrice(api.prices || [], product.productId, "Mrp") || getPrice(api.prices || [], product.productId, "MRP");
    setForm({
      sku_id: product.sku || `PRODUCT-${product.productId}`,
      product_id: product.externalProductId || product.barcode || String(product.productId),
      mrp: String(mrp?.price || ""),
      selling_price: String(offer?.price || ""),
      currency: offer?.currency || mrp?.currency || "INR",
      hsn: product.hsnCode || "",
      tax_code: product.taxCategory || "",
      listing_status: product.isActive? "ACTIVE" : "INACTIVE",
      shipping_local: String(product.shippingChargeLocal || 0),
      shipping_zonal: String(product.shippingChargeRegional || 0),
      shipping_national: String(product.shippingChargeNational || 0),
      fulfillment_profile: product.fulfillmentProfile || "NON_FBF",
      dispatch_sla: String(product.readyToDispatchDays || 1),
      procurement_sla: String(product.procurementSla || 2),
      shipping_provider: product.shippingProvider || "SELLER",
      procurement_type: product.procurementType || "REGULAR",
      package_name: product.packages?.[0]?.name || `${product.sku}-PKG-01`,
      package_length: String(product.packages?.[0]?.length?? product.length?? 10),
      package_breadth: String(product.packages?.[0]?.breadth?? product.width?? 10),
      package_height: String(product.packages?.[0]?.height?? product.height?? 10),
      package_weight: String(product.packages?.[0]?.weight?? product.weight?? 0.5),
      package_description: product.packages?.[0]?.description || product.description || "",
      quantity: String(getAvailableStock(inv)),
      manufacturer_details: product.addressLabel?.manufacturerDetails || "",
      importer_details: product.addressLabel?.importerDetails || "",
      packer_details: product.addressLabel?.packerDetails || "",
      country_of_origin: product.addressLabel?.countryOfOrigin || "IN",
      mfg_date: product.addressLabel?.mfgDateEpoch?.toString() || "",
      shelf_life: product.addressLabel?.shelfLifeSeconds?.toString() || ""
    });
  };

  const loadSellerCustomer = useCallback(async () => {
    if (!sellerId ||!customerId) return setError("SellerId / CustomerId missing");
    setLoading(true); setError(""); setPushResult("");
    try {
      const { data } = await axios.get(`${NODE_API}/SellerCustomer/${sellerId}/customers/${customerId}`);
      setApiData(data);
      setResponse(JSON.stringify(data, null, 2));
      const first = data.products?.[0];
      if (first) { setSelectedProductId(String(first.productId)); initFormFromProduct(first, data); }
    } catch (err) { setError(err.response? JSON.stringify(err.response.data, null, 2) : err.message); } finally { setLoading(false); }
  }, [sellerId, customerId]);

  useEffect(() => { if (!apiData) loadSellerCustomer(); }, [loadSellerCustomer]);

  const onProductChange = (e) => {
    const pid = e.target.value; setSelectedProductId(pid);
    const product = products.find(p => String(p.productId) === pid);
    if (product && apiData) initFormFromProduct(product, apiData);
  };

  const flipkartPayload = useMemo(() => {
    const product = products.find(p => String(p.productId) === selectedProductId) || products[0];
    if (!product ||!apiData) return "";
    try { return JSON.stringify(buildFlipkartPayload(apiData, product, form), null, 2); } catch { return ""; }
  }, [products, selectedProductId, apiData, form]);

  const pushToFlipkart = async () => {
    if (!flipkartPayload) return setError("No payload");
    if (!accessToken) return setError("Enter Flipkart Access Token");
    setPushLoading(true); setPushResult(""); setError("");
    try {
      const payloadObj = JSON.parse(flipkartPayload);
      const res = await axios.post(`${NODE_API}/flipkart/listings/push/${sellerId}/${customerId}`, payloadObj, { headers: { accessToken } });
      setPushResult(JSON.stringify(res.data, null, 2));
    } catch (err) { setError(err.response? JSON.stringify(err.response.data, null, 2) : err.message); } finally { setPushLoading(false); }
  };

  const upd = (k,v) => setForm(s=>({...s,[k]:v}));
  const Field = ({ label, k, bindFrom }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <label style={{ fontSize:10, fontWeight:700 }}>{label} * binded</label>
      <input value={form[k]||""} onChange={e=>upd(k,e.target.value)} style={{ padding:"7px 9px", border:"1px solid #d1d5db", borderRadius:6, background:"#fffbeb", fontSize:12, borderLeft:"3px solid #146eb4" }} />
      <span style={{ fontSize:9, color:"#6b7280" }}>from: {bindFrom}</span>
    </div>
  );

  if (!sellerId ||!customerId) return <div style={styles.container}><button onClick={()=>navigate("/marketplaces/flipkart/sellers")} style={styles.backButton}>← Back</button><p>Missing SellerId/CustomerId</p></div>;

  return (
    <div style={styles.container}>
      <button onClick={()=>navigate("/marketplaces/flipkart/sellers")} style={styles.backButton}>← Back to Sellers - Flipkart</button>
      <h2 style={styles.title}>Flipkart V3 - Seller {sellerId} / Customer {customerId} - Perfect Binding - No Field Missing</h2>

      {apiData && <div style={{ background:"#fffbeb", padding:10, borderRadius:8, border:"1px solid #fbbf24", fontSize:12, marginBottom:12 }}>✅ Binded: <b>{apiData.products?.[0]?.productName}</b> | SKU: <b>{form.sku_id}</b> | HSN: {form.hsn} | Brand: {apiData.brands?.[0]?.brandName} | Seller {sellerId} Customer {customerId} | Price {form.selling_price} {form.currency} | Qty {form.quantity} | GSTIN {apiData.gstin}</div>}

      <div style={styles.card}>
        <label style={styles.label}>Flipkart Access Token * REQUIRED</label>
        <textarea rows={2} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Bearer Token" />
        <div style={styles.row}>
          <button onClick={loadSellerCustomer} disabled={loading} style={styles.primaryBtn}>{loading? "Loading...": "Reload SellerCustomer Data"}</button>
          {products.length>0 && <span style={styles.badge}>{products.length} Products</span>}
          <select value={selectedProductId} onChange={onProductChange} style={{...styles.input, maxWidth:400}}>{products.map(p=><option key={p.productId} value={p.productId}>{p.productName} — {p.sku} (ID:{p.productId})</option>)}</select>
        </div>
      </div>

      {/* All Flipkart Fields - Binded UI */}
      <div style={styles.card}>
        <div style={{ fontWeight:700, fontSize:12, marginBottom:8, background:"#e0f2fe", padding:6, borderRadius:6 }}>Flipkart V3 - All Fields - Binded from SellerCustomer - No Missing</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          <Field label="sku_id * REQUIRED - sku" k="sku_id" bindFrom="products[0].sku TN-WBH-001" />
          <Field label="product_id * REQUIRED - externalProductId" k="product_id" bindFrom="products[0].externalProductId / barcode" />
          <Field label="listing_status * REQUIRED" k="listing_status" bindFrom="products[0].isActive ACTIVE/INACTIVE" />
          <Field label="mrp - Mrp price" k="mrp" bindFrom="prices[0] Mrp 5000" />
          <Field label="selling_price * REQUIRED - OfferPrice" k="selling_price" bindFrom="prices[0] OfferPrice 2499" />
          <Field label="currency" k="currency" bindFrom="prices[0].currency INR" />
          <Field label="hsn * REQUIRED" k="hsn" bindFrom="products[0].hsnCode 85183000" />
          <Field label="tax_code" k="tax_code" bindFrom="products[0].taxCategory" />
          <Field label="quantity * REQUIRED - availableStock" k="quantity" bindFrom="inventories[0].quantity - reserved - damaged" />
          <Field label="fulfillment_profile" k="fulfillment_profile" bindFrom="products[0].fulfillmentProfile NON_FBF" />
          <Field label="dispatch_sla" k="dispatch_sla" bindFrom="products[0].readyToDispatchDays" />
          <Field label="procurement_sla" k="procurement_sla" bindFrom="products[0].procurementSla" />
          <Field label="shipping_provider" k="shipping_provider" bindFrom="products[0].shippingProvider SELLER" />
          <Field label="procurement_type" k="procurement_type" bindFrom="products[0].procurementType REGULAR" />
          <Field label="shipping_local" k="shipping_local" bindFrom="products[0].shippingChargeLocal" />
          <Field label="shipping_zonal" k="shipping_zonal" bindFrom="products[0].shippingChargeRegional" />
          <Field label="shipping_national" k="shipping_national" bindFrom="products[0].shippingChargeNational" />
          <Field label="package_name" k="package_name" bindFrom="packages[0].name" />
          <Field label="package_length" k="package_length" bindFrom="packages[0].length / products[0].length" />
          <Field label="package_breadth" k="package_breadth" bindFrom="packages[0].breadth / width" />
          <Field label="package_height" k="package_height" bindFrom="packages[0].height" />
          <Field label="package_weight" k="package_weight" bindFrom="packages[0].weight / 0.5" />
          <Field label="manufacturer_details" k="manufacturer_details" bindFrom="addressLabel.manufacturerDetails" />
          <Field label="importer_details" k="importer_details" bindFrom="addressLabel.importerDetails" />
          <Field label="packer_details" k="packer_details" bindFrom="addressLabel.packerDetails" />
          <Field label="country_of_origin" k="country_of_origin" bindFrom="addressLabel.countryOfOrigin IN" />
          <Field label="mfg_date epoch" k="mfg_date" bindFrom="addressLabel.mfgDateEpoch" />
          <Field label="shelf_life seconds" k="shelf_life" bindFrom="addressLabel.shelfLifeSeconds" />
        </div>
        <div style={{ marginTop:10 }}><Field label="package_description" k="package_description" bindFrom="products[0].description" /></div>
      </div>

      {flipkartPayload && (
        <div style={styles.card}>
          <h3>Flipkart V3 Final Payload — SKU: {Object.keys(JSON.parse(flipkartPayload))[0]} — Auto Updated</h3>
          <textarea rows={28} readOnly value={flipkartPayload} style={styles.payloadArea} />
          <div style={styles.row}>
            <button onClick={pushToFlipkart} disabled={pushLoading} style={{...styles.primaryBtn, background: pushLoading? "#999" : "#0a7e07", padding:"12px 20px", fontSize:14, fontWeight:800}}> {pushLoading? "Pushing...": `🚀 Push to Flipkart - Seller ${sellerId} Customer ${customerId} - ${form.sku_id}`} </button>
            <button onClick={()=>navigator.clipboard.writeText(flipkartPayload)} style={styles.secondaryBtn}>Copy JSON</button>
          </div>
        </div>
      )}

      {pushResult && <div style={{...styles.card, borderColor:"green"}}><h3 style={{color:"green"}}>✅ Push Success</h3><textarea rows={10} readOnly value={pushResult} style={{...styles.textArea, border:"2px solid green"}} /></div>}
      {error && <div style={{...styles.card, borderColor:"red"}}><h3 style={{color:"red"}}>❌ Error</h3><textarea rows={6} readOnly value={error} style={styles.errorArea} /></div>}
    </div>
  );
};

const styles = {
  container: { width: 1100, maxWidth:"96%", margin:"20px auto", fontFamily:"Inter, sans-serif" },
  title: { marginBottom:16 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:18, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12 },
  payloadArea: { width:"100%", padding:12, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:11, minHeight:450, background:"#111", color:"#fbbf24" },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c" },
  row: { display:"flex", gap:10, alignItems:"center", marginTop:12, flexWrap:"wrap" },
  primaryBtn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  secondaryBtn: { background:"#fff", color:"#111", border:"1px solid #d1d5db", padding:"10px 18px", borderRadius:6, cursor:"pointer" },
  backButton: { padding:"6px 12px", borderRadius:6, border:"1px solid #ddd", background:"#fff", cursor:"pointer", marginBottom:12 },
  badge: { background:"#e0f2fe", color:"#0369a1", padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:600 },
};

export default ListingsCommonV3Api;