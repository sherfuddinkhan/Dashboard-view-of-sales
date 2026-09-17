import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

// ================= HELPERS =================
const toNumber = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n)? n : f;
};

const getAvailableStock = (inv = {}) => {
  return Math.max(0, toNumber(inv.quantity) - toNumber(inv.reservedQuantity) - toNumber(inv.damagedQuantity));
};

const getPrice = (prices, productId, type) => {
  return (
    prices.find(p => p.productId === productId && p.priceType === type && p.isActive) ||
    prices.find(p => p.productId === productId && p.priceType === type) || null
  );
};

const getInventory = (inventories, productId) =>
  inventories.find(i => i.productId === productId) || {};

// ================= FLIPKART V3 PAYLOAD BUILDER =================
const buildFlipkartPayload = (api, product) => {
  const { inventories = [], prices = [], warehouseLocations = [], warehouses = [] } = api;

  const inventory = getInventory(inventories, product.productId);
  const availableStock = getAvailableStock(inventory);

  const offerPrice = getPrice(prices, product.productId, "OfferPrice");
  const mrpPrice = getPrice(prices, product.productId, "Mrp") || getPrice(prices, product.productId, "MRP");
  const currency = offerPrice?.currency || mrpPrice?.currency || "INR";

  const packageData = product.packages?.[0] || {};
  const addressLabel = product.addressLabel || {};
  const sku = product.sku || `PRODUCT-${product.productId}`;
  const externalProductId = product.externalProductId || product.barcode || String(product.productId);

  const locations = warehouseLocations.map(wl => {
    const locInv = inventories.find(i => i.productId === product.productId && i.warehouseId === wl.warehouseId && i.locationId === wl.locationId);
    const wh = warehouses.find(w => w.warehouseId === wl.warehouseId);
    return {
      id: wl.locationId?.toString() || null,
      status: wl.isActive? "ENABLED" : "DISABLED",
      inventory: locInv? getAvailableStock(locInv) : 0,
      listing_status: wl.listingStatus || (product.isActive? "ACTIVE" : "INACTIVE"),
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
        mrp: mrpPrice? toNumber(mrpPrice.price) : null,
        selling_price: toNumber(offerPrice?.price),
        currency,
      },
      tax: {
        hsn: product.hsnCode || null,
        tax_code: product.taxCategory || null,
      },
      listing_status: product.isActive? "ACTIVE" : "INACTIVE",
      shipping_fees: {
        local: toNumber(product.shippingChargeLocal),
        zonal: toNumber(product.shippingChargeRegional),
        national: toNumber(product.shippingChargeNational),
        currency,
      },
      fulfillment_profile: product.fulfillmentProfile || (product.fulfillmentType === "SELF"? "NON_FBF" : "FBF_LITE"),
      fulfillment: {
        dispatch_sla: toNumber(product.readyToDispatchDays),
        procurement_sla: product.procurementSla!= null? toNumber(product.procurementSla) : 2,
        shipping_provider: product.shippingProvider || "SELLER",
        procurement_type: product.procurementType || "REGULAR",
      },
      packages: [{
        name: packageData.name || `${sku}-PKG-01`,
        dimensions: {
          length: toNumber(packageData.length?? product.length),
          breadth: toNumber(packageData.breadth?? product.width),
          height: toNumber(packageData.height?? product.height),
        },
        weight: toNumber(packageData.weight?? product.weight),
        description: packageData.description || product.description || product.productName,
        package_type: packageData.packageType || "DEFAULT",
        handling: { fragile: Boolean(packageData.isFragile), hazardous: Boolean(packageData.isHazardous) },
        notional_value: { amount: toNumber(mrpPrice?.price?? offerPrice?.price), unit: currency, currency },
        defects: { count: toNumber(packageData.defectCount), details: packageData.defectDetails? [packageData.defectDetails] : [] },
      }],
      locations,
      address_label: {
        manufacturer_details: [addressLabel.manufacturerDetails || null],
        importer_details: [addressLabel.importerDetails || null],
        packer_details: [addressLabel.packerDetails || null],
        countries_of_origin: [addressLabel.countryOfOrigin || null],
        quantity: `${availableStock} ${product.unitOfMeasure || "PCS"}`,
        mrp: mrpPrice? `${mrpPrice.price} ${currency}` : null,
      },
      dating_label: {
        mfg_date: addressLabel.mfgDateEpoch?.toString() || null,
        shelf_life: addressLabel.shelfLifeSeconds?.toString() || null,
        expiry_date: addressLabel.expiryDateEpoch?.toString() || null,
      },
    },
  };
};

// ================= COMPONENT =================
const ListingsCommonV3Api = () => {
  const { sellerId, customerId } = useParams();
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState("");
  const [apiData, setApiData] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [response, setResponse] = useState("");
  const [flipkartPayload, setFlipkartPayload] = useState("");

  const [loading, setLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [error, setError] = useState("");
  const [pushResult, setPushResult] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("flipkartAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const products = useMemo(() => apiData?.products || [], [apiData]);

  const loadSellerCustomer = useCallback(async () => {
    if (!sellerId ||!customerId) return setError("SellerId / CustomerId missing");

    setLoading(true);
    setError(""); setResponse(""); setFlipkartPayload(""); setPushResult("");

    try {
      const { data } = await axios.get(`${NODE_API}/SellerCustomer/${sellerId}/customers/${customerId}`);
      setApiData(data);
      setResponse(JSON.stringify(data, null, 2));

      const first = data.products?.[0];
      if (!first) throw new Error("No products found for this Seller/Customer");

      setSelectedProductId(String(first.productId));
      setFlipkartPayload(JSON.stringify(buildFlipkartPayload(data, first), null, 2));
    } catch (err) {
      setError(err.response? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setLoading(false);
    }
  }, [sellerId, customerId]);

  useEffect(() => { loadSellerCustomer(); }, [loadSellerCustomer]);

  const onProductChange = (e) => {
    const pid = e.target.value;
    setSelectedProductId(pid);
    const product = products.find(p => String(p.productId) === pid);
    if (!product) return;
    try {
      setFlipkartPayload(JSON.stringify(buildFlipkartPayload(apiData, product), null, 2));
      setPushResult("");
      setError("");
    } catch (err) { setError(err.message); }
  };

  const pushToFlipkart = async () => {
    if (!flipkartPayload) return setError("No payload to push");
    if (!accessToken) return setError("Please enter Flipkart Access Token");

    setPushLoading(true); setPushResult(""); setError("");
    try {
      const payloadObj = JSON.parse(flipkartPayload);
      const res = await axios.post(
        `${NODE_API}/flipkart/listings/push/${sellerId}/${customerId}`,
        payloadObj,
        { headers: { accessToken } }
      );
      setPushResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setPushLoading(false);
    }
  };

  if (!sellerId ||!customerId) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate("/marketplaces/flipkart/sellers")} style={styles.backButton}>← Back to Sellers</button>
        <p>Missing SellerId / CustomerId. Go to Sellers → View</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/marketplaces/flipkart/sellers")} style={styles.backButton}>← Back to Sellers</button>
      <h2 style={styles.title}>Flipkart V3 - Seller {sellerId} / Customer {customerId}</h2>

      <div style={styles.card}>
        <label style={styles.label}>Flipkart Access Token</label>
        <textarea rows={2} value={accessToken} onChange={e => setAccessToken(e.target.value)} style={styles.textArea} placeholder="Bearer Token" />
        <div style={styles.row}>
          <button onClick={loadSellerCustomer} disabled={loading} style={styles.primaryBtn}>{loading? "Loading..." : "Reload Data"}</button>
          {products.length > 0 && <span style={styles.badge}>{products.length} Products Found</span>}
        </div>
      </div>

      {products.length > 0 && (
        <div style={styles.card}>
          <label style={styles.label}>Select Product</label>
          <select value={selectedProductId} onChange={onProductChange} style={styles.input}>
            {products.map(p => <option key={p.productId} value={p.productId}>{p.productName || p.sku} — {p.sku} (ID:{p.productId})</option>)}
          </select>
        </div>
      )}

      {flipkartPayload && (
        <div style={styles.card}>
          <h3>Flipkart V3 Payload — SKU: {Object.keys(JSON.parse(flipkartPayload))[0]}</h3>
          <textarea rows={28} readOnly value={flipkartPayload} style={styles.payloadArea} />
          <div style={styles.row}>
            <button onClick={pushToFlipkart} disabled={pushLoading} style={{...styles.primaryBtn, background: pushLoading? "#999" : "#0a7e07" }}>
              {pushLoading? "Pushing..." : `🚀 Push to Flipkart`}
            </button>
            <button onClick={() => navigator.clipboard.writeText(flipkartPayload)} style={styles.secondaryBtn}>Copy JSON</button>
            <button onClick={() => { setFlipkartPayload(""); setPushResult(""); }} style={styles.secondaryBtn}>Clear</button>
          </div>
        </div>
      )}

      {pushResult && (
        <div style={{...styles.card, borderColor: "green" }}>
          <h3 style={{ color: "green" }}>✅ Push Success</h3>
          <textarea rows={10} readOnly value={pushResult} style={{...styles.textArea, border: "2px solid green" }} />
        </div>
      )}

      {error && (
        <div style={{...styles.card, borderColor: "red" }}>
          <h3 style={{ color: "red" }}>❌ Error</h3>
          <textarea rows={6} readOnly value={error} style={styles.errorArea} />
        </div>
      )}

      {response && (
        <div style={styles.card}>
          <h4>Source API — SellerCustomer Data</h4>
          <textarea rows={12} readOnly value={response} style={styles.textArea} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { width: 1000, maxWidth: "96%", margin: "20px auto", fontFamily: "Inter, sans-serif" },
  title: { marginBottom: 16 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  label: { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13 },
  input: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db" },
  textArea: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 12 },
  payloadArea: { width: "100%", padding: 12, borderRadius: 6, border: "1px solid #146eb4", fontFamily: "monospace", fontSize: 12, minHeight: 450, background: "#f8fafc" },
  errorArea: { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ef4444", fontFamily: "monospace", fontSize: 12, color: "#b91c1c" },
  row: { display: "flex", gap: 10, alignItems: "center", marginTop: 12 },
  primaryBtn: { background: "#146eb4", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
  secondaryBtn: { background: "#fff", color: "#111", border: "1px solid #d1d5db", padding: "10px 18px", borderRadius: 6, cursor: "pointer" },
  backButton: { padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", marginBottom: 12 },
  badge: { background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
};

export default ListingsCommonV3Api;