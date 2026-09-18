import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const NODE_API = "http://localhost:5000/api";
const ENTITY_URL = `${NODE_API}/mystore/products`;

const fmtLabel = (k) => String(k).replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/_/g," ").replace(/^./,s=>s.toUpperCase());

const AddProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBindedData = () => {
    try{
      const saved = localStorage.getItem("bindedProductData");
      const parsed = saved? JSON.parse(saved) : null;
      return {
        fromCustomer: location.state?.fromCustomer || parsed?.fromCustomer || null,
        product: location.state?.product || parsed?.product || null,
        orderItem: location.state?.orderItem || parsed?.orderItem || parsed?.fromCustomer?.marketplaceOrderItems?.[0] || null,
        sellerId: location.state?.sellerId || parsed?.sellerId || "6",
        customerId: location.state?.customerId || parsed?.customerId || "3",
      };
    }catch{ return { fromCustomer:null, product:null, orderItem:null, sellerId:"6", customerId:"3" } }
  };

  const bind = useMemo(()=>getBindedData(), []);
  const customerRaw = bind.fromCustomer;
  const prodRaw = customerRaw?.products?.[0] || bind.product;
  const priceRaw = customerRaw?.prices?.[0];
  const invRaw = customerRaw?.inventories?.[0];
  const catRaw = customerRaw?.categories?.[0];
  const brandRaw = customerRaw?.brands?.[0];
  const addrRaw = customerRaw?.customerAddresses?.[0];
  const attrRaw = customerRaw?.attributes?.[0];
  const orderRaw = customerRaw?.marketplaceOrderItems?.[0] || bind.orderItem;
  const imgRaw = customerRaw?.images || [];

  const [form, setForm] = useState({
    // --- SellerCustomer binded ---
    sellerId: String(bind.sellerId),
    customerId: String(bind.customerId),
    customerCode: customerRaw?.customerCode || "CUST-F10EA404",
    customerName: customerRaw?.customerName || "TechNova Retail Customer",
    email: customerRaw?.email || "priya@technovasolutions.com",
    phone: customerRaw?.phone || "9123456790",
    gstin: customerRaw?.gstin || "29KLMNO7890P1Z3",
    tradeName: customerRaw?.tradeName || "TechNova Retail",
    contactPerson: customerRaw?.contactPerson || "Priya Nair",
    city: addrRaw?.city || "Bengaluru",
    state: addrRaw?.state || "Karnataka",
    postalCode: addrRaw?.postalCode || "560001",
    addressLine1: addrRaw?.addressLine1 || "45 MG Road, Near City Mall",

    // --- Product binded ---
    productId: prodRaw?.productId || 6,
    name: prodRaw?.productName || orderRaw?.productTitle || "TechNova Wireless Bluetooth Headphones",
    productTitle: orderRaw?.productTitle || prodRaw?.productName || "TechNova Wireless Bluetooth Headphones",
    sku: prodRaw?.sku || orderRaw?.sku || "TN-WBH-001",
    barcode: prodRaw?.barcode || "8901234567890",
    description: prodRaw?.description || "Wireless Bluetooth headphones with Bluetooth 5.3 connectivity and long battery life",
    brandName: prodRaw?.brandName || brandRaw?.brandName || "Samsung",
    categoryId: prodRaw?.categoryId || catRaw?.categoryId || 5,
    categoryName: catRaw?.categoryName || "Consumer Electronics",
    weight: prodRaw?.weight || 0.5,
    hsnCode: prodRaw?.hsnCode || "85183000",

    // --- Price binded ---
    price: String(priceRaw?.price || 2499),
    compare_price: String(orderRaw?.unitPrice || 5000),
    unitPrice: orderRaw?.unitPrice || 5000,
    taxAmount: orderRaw?.taxAmount || 1800,
    totalAmount: orderRaw?.totalAmount || 11800,
    quantity: orderRaw?.quantity || 2,

    // --- Inventory binded ---
    inventory_quantity: String(invRaw?.quantity || 100),
    reservedQuantity: invRaw?.reservedQuantity || 5,
    warehouseId: invRaw?.warehouseId || 1,

    // --- ms.products fixed ---
    categories: [catRaw?.categoryName || "fashion"],
    location_availability_mode: "zip_codes",
    zip_codes: [addrRaw?.postalCode || "560001", "122050", "171010"],
    country_of_origin: prodRaw?.addressLabel?.countryOfOrigin || "IN",
    net_quantity: "100",
    ondc_cancellable: "yes",
    ondc_returnable: "no",
    ondc_time_to_ship: 4320,
    manufacturerDetails: prodRaw?.addressLabel?.manufacturerDetails || "",
  });

  useEffect(()=>{
    if(customerRaw){
      setForm(p=>({
      ...p,
        sellerId: String(customerRaw.sellerId || p.sellerId),
        customerId: String(customerRaw.customerId || p.customerId),
        customerCode: customerRaw.customerCode || p.customerCode,
        customerName: customerRaw.customerName || p.customerName,
        email: customerRaw.email || p.email,
        phone: customerRaw.phone || p.phone,
        gstin: customerRaw.gstin || p.gstin,
        name: customerRaw.products?.[0]?.productName || p.name,
        sku: customerRaw.products?.[0]?.sku || p.sku,
        barcode: customerRaw.products?.[0]?.barcode || p.barcode,
        description: customerRaw.products?.[0]?.description || p.description,
        brandName: customerRaw.brands?.[0]?.brandName || p.brandName,
        categoryName: customerRaw.categories?.[0]?.categoryName || p.categoryName,
        price: String(customerRaw.prices?.[0]?.price || p.price),
        inventory_quantity: String(customerRaw.inventories?.[0]?.quantity || p.inventory_quantity),
        city: customerRaw.customerAddresses?.[0]?.city || p.city,
        postalCode: customerRaw.customerAddresses?.[0]?.postalCode || p.postalCode,
      }));
    }
  }, [customerRaw]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (k,v) => setForm(s=>({...s,[k]:v}));

  const handleSubmit = async () => {
    try{
      setLoading(true); setError(""); setResponse(null);

      const payload = {
        name: form.name,
        description: form.description,
        sku: form.sku,
        barcode: form.barcode,
        price: form.price,
        compare_price: form.compare_price,
        categories: [form.categoryName],
        inventory_quantity: form.inventory_quantity,
        location_availability_mode: form.location_availability_mode,
        zip_codes: Array.isArray(form.zip_codes)? form.zip_codes : String(form.zip_codes).split(","),
        country_of_origin: form.country_of_origin,
        net_quantity: form.net_quantity,
        weight: Number(form.weight),
        hsnCode: form.hsnCode,
        brand: form.brandName,
        ondc: {
          cancellable: form.ondc_cancellable,
          returnable: form.ondc_returnable,
          time_to_ship: Number(form.ondc_time_to_ship)
        },
        // Perfect binding extra info
        sellerId: Number(form.sellerId),
        customerId: Number(form.customerId),
        productId: Number(form.productId),
        customerCode: form.customerCode,
        customerName: form.customerName,
        manufacturerDetails: form.manufacturerDetails,
        options: [
          { name: "size", values: ["s","xs"] },
          { name: "color", values: ["blue","white"] },
         ...(attrRaw? [{ name: attrRaw.attributeName, values: [attrRaw.attributeValue] }] : []),
         ...(brandRaw? [{ name: "brand", values: [brandRaw.brandName] }] : []),
        ],
        option_set: "",
        default_variant: {
          inventory_management: "automatic",
          inventory_quantity: form.inventory_quantity,
          price: form.price,
          compare_price: form.compare_price,
          variant_id: "white|s",
          options: [{ name: "color", value: "white" }, { name: "size", value: "s" }]
        },
        variants: [
          { options:[{name:"color",value:"white"},{name:"size",value:"s"}], price: form.price, compare_price: form.compare_price, inventory_management:"automatic", inventory_quantity: form.inventory_quantity, variant_id:"white|s", sku: `${form.sku}-white-s` },
          { options:[{name:"color",value:"white"},{name:"size",value:"xs"}], price: form.price, compare_price: form.compare_price, inventory_management:"automatic", inventory_quantity: form.inventory_quantity, variant_id:"white|xs", sku: `${form.sku}-white-xs` },
          { options:[{name:"color",value:"blue"},{name:"size",value:"s"}], price: form.price, compare_price: form.compare_price, inventory_management:"automatic", inventory_quantity: form.inventory_quantity, variant_id:"blue|s", sku: `${form.sku}-blue-s` },
          { options:[{name:"color",value:"blue"},{name:"size",value:"xs"}], price: form.price, compare_price: form.compare_price, inventory_management:"automatic", inventory_quantity: form.inventory_quantity, variant_id:"blue|xs", sku: `${form.sku}-blue-xs` },
        ],
        images: imgRaw.length>0? imgRaw.slice(0,2).map((im,i)=>({
          image: { type:"image/png", uploadType:"url", name: `${form.name}-${i+1}`, data: im.imageUrl }
        })) : [
          { image: { type:"image/png", uploadType:"url", name: form.name, data:"https://cdn.pixabay.com/photo/2022/01/11/21/48/link-6931554_960_720.png" } }
        ]
      };

      const res = await axios.post(ENTITY_URL, payload);
      setResponse(res.data);
    }catch(e){
      setError(e.response?.data?.message || e.response?.data || e.message);
    }finally{ setLoading(false); }
  };

  const Section = ({ title, children }) => (
    <div style={{ border:"1px solid #e5e7eb", borderRadius:10, marginBottom:14, overflow:"hidden" }}>
      <div style={{ background:"#f8fafc", padding:"8px 12px", fontWeight:700, fontSize:12 }}>{title}</div>
      <div style={{ padding:12, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>{children}</div>
    </div>
  );

  const Field = ({ k, v }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <label style={{ fontSize:10, fontWeight:700, color:"#374151" }}>{fmtLabel(k)} * binded</label>
      <input value={Array.isArray(v)? v.join(", "): String(v??"")} onChange={e=>update(k, e.target.value)} style={{ padding:"7px 9px", border:"1px solid #d1d5db", borderRadius:6, background:"#f0fdf4", fontSize:12, borderLeft:"3px solid #10b981" }} />
      <span style={{ fontSize:9, color:"#9ca3af" }}>from API: {k}</span>
    </div>
  );

  return (
    <div style={{ padding:16, background:"#f5f7fb", minHeight:"100vh" }}>
      <div style={{ background:"#fff", padding:14, borderRadius:12, border:"1px solid #e5e7eb" }}>
        <button type="button" onClick={()=>navigate(-1)} style={{ padding:"6px 12px", border:"1px solid #ddd", borderRadius:6, background:"#fff", cursor:"pointer" }}>← Back Seller {form.sellerId} Customer {form.customerId}</button>
        <h2 style={{ margin:"10px 0 4px 0", fontSize:18 }}>AddProduct - Perfect Binding - ms.products - Seller {form.sellerId} Customer {form.customerId} - {form.sku}</h2>
        <div style={{ background:"#ecfdf5", padding:10, borderRadius:8, border:"1px solid #6ee7b7", fontSize:12 }}>
          ✅ <b>Total Binded:</b> {form.productTitle} | SKU: <b>{form.sku}</b> | Brand: {form.brandName} | Category: {form.categoryName} | Price: {form.price} | Qty: {form.inventory_quantity} | City: {form.city} | GSTIN: {form.gstin} | 37 product fields + 24 groups binded
        </div>

        <div style={{ marginTop:12 }}>
          <Section title={`Customer Profile - ${form.customerName} - Auto Textbox`}>
            {["customerCode","customerName","tradeName","contactPerson","email","phone","gstin","creditLimit","city","state","postalCode","addressLine1"].map(k=> <Field key={k} k={k} v={form[k]?? customerRaw?.[k]?? ""} />)}
          </Section>

          <Section title={`Product Details - ${form.name} - ${form.sku} - Perfect Binded`}>
            {["name","productTitle","sku","barcode","description","brandName","categoryName","categoryId","productId","weight","hsnCode","manufacturerDetails"].map(k=> <Field key={k} k={k} v={form[k]} />)}
          </Section>

          <Section title="Price & Inventory - Binded from prices[] & inventories[]">
            {["price","compare_price","unitPrice","taxAmount","totalAmount","inventory_quantity","reservedQuantity","warehouseId","quantity"].map(k=> <Field key={k} k={k} v={form[k]} />)}
          </Section>

          <Section title="ms.products ONDC Fields - Auto Binded">
            {["categories","location_availability_mode","zip_codes","country_of_origin","net_quantity","ondc_cancellable","ondc_returnable","ondc_time_to_ship"].map(k=> <Field key={k} k={k} v={form[k]} />)}
          </Section>
        </div>

        <button type="button" onClick={handleSubmit} disabled={loading} style={{ marginTop:10, padding:"12px 20px", background:"#111", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
          {loading? "Listing to ms.products...": `List to ms.products - Seller ${form.sellerId} Customer ${form.customerId} - ${form.sku} - Perfect Binding`}
        </button>

        {error && <pre style={{ color:"red", background:"#fee2e2", padding:10, borderRadius:6, marginTop:10, fontSize:12, whiteSpace:"pre-wrap" }}>{typeof error==="string"? error : JSON.stringify(error,null,2)}</pre>}
        {response && <pre style={{ background:"#f3f4f6", padding:12, borderRadius:6, marginTop:10, fontSize:12 }}>{JSON.stringify(response,null,2)}</pre>}

        <details style={{ marginTop:12 }} open>
          <summary style={{ cursor:"pointer", fontSize:12, fontWeight:700 }}>View Perfect Binded Payload - POST {ENTITY_URL} - Seller {form.sellerId} Customer {form.customerId}</summary>
          <pre style={{ background:"#111", color:"#0f0", padding:12, borderRadius:6, fontSize:11, maxHeight:500, overflow:"auto" }}>{JSON.stringify({
            name: form.name,
            price: form.price,
            compare_price: form.compare_price,
            categories: [form.categoryName],
            inventory_quantity: form.inventory_quantity,
            location_availability_mode: form.location_availability_mode,
            zip_codes: form.zip_codes,
            country_of_origin: form.country_of_origin,
            net_quantity: form.net_quantity,
            ondc: { cancellable: form.ondc_cancellable, returnable: form.ondc_returnable, time_to_ship: Number(form.ondc_time_to_ship) },
            sellerId: Number(form.sellerId),
            customerId: Number(form.customerId),
            customerRaw: { customerCode: form.customerCode, customerName: form.customerName, city: form.city, gstin: form.gstin },
            productRaw: { productId: form.productId, sku: form.sku, barcode: form.barcode, brand: form.brandName }
          },null,2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default AddProduct;