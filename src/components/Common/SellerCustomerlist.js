import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, XCircle, CheckCircle2, Search, Package, Globe } from "lucide-react";

const NODE_API = "http://localhost:5000/api";

const formatLabel = (k) => String(k).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/-/g, " ").replace(/^./, s => s.toUpperCase()).trim();
const formatValue = (v) => v==null?"": typeof v==="boolean"? (v?"Yes":"No") : typeof v==="object"? JSON.stringify(v) : String(v);
const isObject = (v) => v!==null && typeof v==="object" &&!Array.isArray(v);

const flattenObject = (obj, prefix="") => {
  let res={};
  Object.entries(obj||{}).forEach(([k,v])=>{
    const full=prefix?`${prefix}.${k}`:k;
    if(isObject(v)){
      Object.assign(res, flattenObject(v, full));
    } else if(!Array.isArray(v)){
      res[full]=v;
    } else if(Array.isArray(v) && v.length>0 && typeof v[0]!=="object"){
      res[full]=v.join(", ");
    }
  });
  return res;
};

const MARKETPLACES = [
  { name: "Amazon", path: "amazon", color: "#FF9900", icon: "🛒", route: "/marketplaces/amazon" },
  { name: "Flipkart", path: "flipkart", color: "#2874F0", icon: "🛍", route: "/marketplaces/flipkart" },
  { name: "MyStore", path: "mystore", color: "#673AB7", icon: "🏪", route: "/mystore" },
  { name: "Meesho", path: "meesho", color: "#E91E63", icon: "👗", route: "/marketplaces/meesho" },
  { name: "Blinkit", path: "blinkit", color: "#F7C600", icon: "⚡", route: "/marketplaces/blinkit" },
];

const SellerCustomerlist = ({ marketplace: propMarketplace, sellerId: propSellerId, customerId: propCustomerId, onBack }) => {
  const navigate = useNavigate();
  const { marketplace: paramMarketplace, sellerId: paramSellerId, customerId: paramCustomerId } = useParams();

  const marketplace = propMarketplace || paramMarketplace || "mystore";
  const sellerId = propSellerId || paramSellerId;
  const customerId = propCustomerId || paramCustomerId;

  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [search, setSearch] = useState("");

  const fetchCustomer = async () => {
    if(!sellerId ||!customerId){ setError("Seller ID and Customer ID are required"); setLoading(false); return; }
    try{
      setLoading(true); setError("");
      const res = await fetch(`${NODE_API}/seller-customer/${sellerId}/customers/${customerId}`);
      const result = await res.json();
      if(!res.ok) throw new Error(result?.message || "Failed to load");
      setCustomerData(result?.data?? result);
    }catch(e){ setError(e.message); }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchCustomer(); }, [sellerId, customerId]);

  const allScalarFields = useMemo(()=>{
    if(!customerData) return [];
    return Object.keys(customerData).filter(k=>!Array.isArray(customerData[k]) &&!isObject(customerData[k]));
  }, [customerData]);

  const allDatasets = useMemo(()=>{
    if(!customerData) return [];
    const list=[];
    Object.entries(customerData).forEach(([k,v])=>{
      if(Array.isArray(v) && v.length>0){
        list.push({ key:k, title:formatLabel(k), data:v });
      } else if(isObject(v)){
        Object.entries(v).forEach(([k2,v2])=>{
          if(Array.isArray(v2) && v2.length>0){
            list.push({ key:k2, title:formatLabel(k2), data:v2, parent:k });
          }
        });
      }
    });
    return list;
  }, [customerData]);

  const filteredDatasets = useMemo(()=>{
    if(!search) return allDatasets;
    const q=search.toLowerCase();
    return allDatasets.map(s=>{
      const f=s.data.filter(item=> Object.values(flattenObject(item)).some(val=> formatValue(val).toLowerCase().includes(q)) );
      return {...s, data:f};
    }).filter(s=> s.data.length>0);
  }, [allDatasets, search]);

  const handleMarketplaceSwitch = (target) => {
    if(target.path===marketplace) return;
    if(target.path==="mystore"){
      navigate(`/mystore/customers/${sellerId}/${customerId}`, { state: { from: marketplace } });
    } else {
      navigate(`/marketplaces/${target.path}/customers/${sellerId}/${customerId}`, { state: { from: marketplace } });
    }
  };

  // ✅ FIXED - Now takes target marketplace
  const handleListToMarketplace = (targetMarketplace, productItem) => {
    // Support both calling styles: handleListToMarketplace(prod) or handleListToMarketplace("flipkart", prod)
    let target = targetMarketplace;
    let product = productItem;

    // If first arg is product object (old call style)
    if (typeof targetMarketplace === "object" && targetMarketplace!== null) {
      product = targetMarketplace;
      target = marketplace; // fallback to current
    }

    // If target is string but product is missing, use first product
    if (typeof product === "undefined" || product === null) {
      product = customerData?.products?.[0];
    }

    const fullData = {
      fromCustomer: customerData,
      product: product || customerData?.products?.[0],
      sellerId: String(sellerId),
      customerId: String(customerId),
    };

    localStorage.setItem("bindedProductData", JSON.stringify(fullData));

    if (target === "amazon") {
      navigate(`/marketplaces/amazon/listings/create?sellerId=${sellerId}&customerId=${customerId}`, { state: fullData });
    } else if (target === "mystore") {
      navigate(`/mystore/add-product?sellerId=${sellerId}&customerId=${customerId}`, { state: fullData });
    } else if (target === "flipkart") {
      // ✅ FIXED - No more redirect to mystore
      navigate(`/marketplaces/flipkart/listings/v3/${sellerId}/${customerId}`, { state: { fromCustomer: customerData, product: product } });
    } else {
      navigate(`/marketplaces/${target}/listings/${sellerId}/${customerId}`, { state: fullData });
    }
  };

  if(loading) return <div style={{ padding:40, textAlign:"center" }}><RefreshCw className="animate-spin" /> Loading Seller {sellerId} Customer {customerId}...</div>;
  if(error) return <div style={{ padding:40, textAlign:"center" }}><XCircle size={40} color="red"/><h3>Unable to Load Records</h3><p>{error}</p><button type="button" onClick={fetchCustomer} style={{ padding:"8px 16px", borderRadius:6, border:"1px solid #ddd", cursor:"pointer" }}>Retry</button></div>;

  return (
    <div style={{ padding:16, background:"#f5f7fb", minHeight:"100vh" }}>
      <div style={{ background:"#fff", padding:16, borderRadius:12, marginBottom:12, border:"1px solid #e5e7eb" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
          <div>
            <button type="button" onClick={()=> onBack? onBack() : navigate(marketplace==="mystore"? "/mystore" : `/marketplaces/${marketplace}/sellers`)} style={{ padding:"6px 12px", borderRadius:6, border:"1px solid #ddd", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><ArrowLeft size={16}/> Back to {marketplace}</button>
            <h1 style={{ margin:"12px 0 4px 0", fontSize:22, fontWeight:800 }}>{customerData?.customerName || "ABC Electronics Customer"} - Seller: {sellerId} | Customer: {customerId} | Marketplace: {marketplace}</h1>
            <p style={{ fontSize:12, color:"#6b7280", margin:0 }}>Auto-generates textboxes for any new field - No code change needed in future - Binded values shown in AddProduct UI</p>
          </div>
          <span style={{ background: customerData?.isActive?"#dcfce7":"#fee2e2", color: customerData?.isActive?"#16a34a":"#dc2626", padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
            {customerData?.isActive?<CheckCircle2 size={14}/>:<XCircle size={14}/>} {customerData?.isActive?"Active Account":"Inactive"}
          </span>
        </div>

        <div style={{ marginTop:16, padding:12, background:"#f8fafc", borderRadius:8, border:"1px dashed #d1d5db" }}>
          <div style={{ fontSize:12, fontWeight:700, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}><Globe size={14}/> Navigate this same customer data to different marketplaces & bind with respective components:</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {MARKETPLACES.map(mp=>(
              <button type="button" key={mp.path} onClick={()=>handleMarketplaceSwitch(mp)} disabled={mp.path===marketplace}
                style={{ padding:"8px 14px", borderRadius:20, border: mp.path===marketplace?"2px solid #111":"1px solid #e5e7eb", background: mp.path===marketplace?"#111":"#fff", color: mp.path===marketplace?"#fff":mp.color, cursor: mp.path===marketplace?"not-allowed":"pointer", fontWeight:600, fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
                <span>{mp.icon}</span> {mp.name} {mp.path===marketplace?"(Current)":"→"}
              </button>
            ))}
          </div>
        </div>

        {customerData?.products && customerData.products.length>0 && (
          <div style={{ marginTop:12, padding:12, background:"#fff7ed", borderRadius:8, border:"1px solid #fed7aa" }}>
            <div style={{ fontSize:12, fontWeight:700, marginBottom:8 }}>Quick List - Binded values will show in AddProduct UI:</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {customerData.products.slice(0,3).map((prod, i)=>(
                <div key={i} style={{ display:"flex", gap:6, alignItems:"center", background:"#fff", padding:"6px 10px", borderRadius:20, border:"1px solid #e5e7eb" }}>
                  <span style={{ fontSize:11, fontWeight:600 }}>{prod.productName || prod.name} - {prod.sku}</span>
                  <button type="button" onClick={()=>handleListToMarketplace("mystore", prod)} style={{ padding:"5px 10px", background:"#673AB7", color:"#fff", border:"none", borderRadius:12, cursor:"pointer", fontSize:11, fontWeight:700 }}>List to MyStore</button>
                  <button type="button" onClick={()=>handleListToMarketplace("flipkart", prod)} style={{ padding:"5px 10px", background:"#2874F0", color:"#fff", border:"none", borderRadius:12, cursor:"pointer", fontSize:11, fontWeight:700 }}>List to Flipkart</button>
                  <button type="button" onClick={()=>handleListToMarketplace("amazon", prod)} style={{ padding:"5px 10px", background:"#FF9900", color:"#000", border:"none", borderRadius:12, cursor:"pointer", fontSize:11, fontWeight:700 }}>List to Amazon</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb" }}>
        <div style={{ display:"flex", gap:8, padding:12, borderBottom:"1px solid #eee", flexWrap:"wrap" }}>
          <button type="button" onClick={()=>setActiveTab("info")} style={{ padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", background: activeTab==="info"?"#4f46e5":"#f3f4f6", color: activeTab==="info"?"#fff":"#000", fontWeight:600 }}>Customer Profile ({allScalarFields.length} fields - auto)</button>
          <button type="button" onClick={()=>setActiveTab("data")} style={{ padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", background: activeTab==="data"?"#059669":"#f3f4f6", color: activeTab==="data"?"#fff":"#000", fontWeight:600 }}>All API Datasets ({allDatasets.length} groups - auto)</button>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, border:"1px solid #ddd", padding:"6px 10px", borderRadius:8 }}><Search size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search any field..." style={{ border:"none", outline:"none", fontSize:12 }} /></div>
        </div>

        {activeTab==="info" && (
          <div style={{ padding:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
              {allScalarFields.map(key=>(
                <div key={key} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#374151" }}>{formatLabel(key)} *</label>
                  <input disabled value={formatValue(customerData[key])} style={{ padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:6, background:"#f9fafb", fontSize:13 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==="data" && (
          <div style={{ padding:20 }}>
            {filteredDatasets.map(sec=>(
              <div key={sec.key} style={{ border:"1px solid #e5e7eb", borderRadius:10, marginBottom:16, overflow:"hidden" }}>
                <div style={{ background:"#f8fafc", padding:"10px 14px", fontWeight:700, display:"flex", justifyContent:"space-between", fontSize:13 }}>
                  <span><Package size={16} style={{ marginRight:6 }}/>{sec.title} ({sec.data.length})</span>
                </div>
                {sec.data.map((item, idx)=>{
                  const isProductGroup = sec.key==="products";
                  return (
                    <div key={idx} style={{ padding:14, borderTop:"1px solid #f1f5f9", background:"#fff" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:8 }}>
                        <div style={{ fontWeight:700, fontSize:12 }}>Record #{idx+1}</div>
                        {isProductGroup && (
                          <div style={{ display:"flex", gap:6 }}>
                            <button type="button" onClick={()=>handleListToMarketplace("mystore", item)} style={{ padding:"5px 10px", background:"#673AB7", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700 }}>List to MyStore</button>
                            <button type="button" onClick={()=>handleListToMarketplace("flipkart", item)} style={{ padding:"5px 10px", background:"#2874F0", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700 }}>List to Flipkart</button>
                            <button type="button" onClick={()=>handleListToMarketplace("amazon", item)} style={{ padding:"5px 10px", background:"#FF9900", color:"#000", border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700 }}>List to Amazon</button>
                          </div>
                        )}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
                        {Object.entries(flattenObject(item)).map(([k,v])=>(
                          <div key={k} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            <label style={{ fontSize:10, fontWeight:600, color:"#6b7280" }}>{formatLabel(k.split(".").pop())}</label>
                            <input disabled value={formatValue(v)} style={{ padding:"6px 8px", border:"1px solid #d1d5db", borderRadius:6, background:"#f9fafb", fontSize:12 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerCustomerlist;