import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const GetFeesEstimate = () => {
  const [accessToken, setAccessToken] = useState("");
  const [sku, setSku] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [price, setPrice] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [isFBA, setIsFBA] = useState(true);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const getFees = async () => {
    if (!accessToken) return setError("Amazon Access Token (LWA) required");
    if (!sku) return setError("Identifier (ASIN/SKU) required");
    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/product-fees`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        feesRequest: {
          FeesEstimateRequest: {
            MarketplaceId: marketplaceId,
            IsAmazonFulfilled: isFBA,
            Identifier: sku,
            PriceToEstimateFees: {
              ListingPrice: {
                Amount: parseFloat(price),
                CurrencyCode: currency
              }
            }
          }
        }
      });
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <h2>Product Fees API - v0 - getMyFeesEstimate</h2>
      <p style={styles.sub}>Estimate fees for a product before listing - Referral + FBA fees</p>

      <div style={styles.card}>
        <label style={styles.label}>Amazon Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>ASIN / SKU Identifier</label>
            <input value={sku} onChange={e=>setSku(e.target.value)} style={styles.input} placeholder="B0XXXXXXX or SKU-123" />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Marketplace ID</label>
            <select value={marketplaceId} onChange={e=>setMarketplaceId(e.target.value)} style={styles.input}>
              <option value="ATVPDKIKX0DER">US - ATVPDKIKX0DER</option>
              <option value="A21TJRUUN4KGV">India - A21TJRUUN4KGV</option>
              <option value="A1F83G8C2ARO7P">UK - A1F83G8C2ARO7P</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>Listing Price</label>
            <input type="number" value={price} onChange={e=>setPrice(e.target.value)} style={styles.input} />
          </div>
          <div style={{flex:0.7}}>
            <label style={styles.label}>Currency</label>
            <select value={currency} onChange={e=>setCurrency(e.target.value)} style={styles.input}>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div style={{flex:0.8}}>
            <label style={styles.label}>Fulfillment</label>
            <select value={isFBA} onChange={e=>setIsFBA(e.target.value==="true")} style={styles.input}>
              <option value="true">FBA - Amazon Fulfilled</option>
              <option value="false">FBM - Merchant Fulfilled</option>
            </select>
          </div>
        </div>

        <button onClick={getFees} disabled={loading} style={styles.btn}>
          {loading ? "Calculating..." : "Get Fees Estimate"}
        </button>
      </div>

      {data && (
        <div style={styles.card}>
          <h3 style={{color:"green"}}>Fees Estimate</h3>
          <textarea rows={20} readOnly value={data} style={styles.payloadArea} />
          <button onClick={()=>navigator.clipboard.writeText(data)} style={styles.secondaryBtn}>Copy JSON</button>
        </div>
      )}

      {error && (
        <div style={{...styles.card, borderColor:"red"}}>
          <h3 style={{color:"red"}}>Error</h3>
          <textarea rows={8} readOnly value={error} style={styles.errorArea} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { width: 950, maxWidth:"95%", margin:"20px auto", fontFamily:"Inter, sans-serif" },
  sub: { color:"#666", marginBottom:16 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:16 },
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13, marginTop:8 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12 },
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:400, background:"#f8fafc" },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c" },
  row: { display:"flex", gap:12, marginTop:12 },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600, marginTop:12 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"8px 14px", borderRadius:6, cursor:"pointer", marginTop:8 }
};

export default GetFeesEstimate;