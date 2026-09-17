import React, { useState, useEffect } from "react";
import axios from "axios";
const NODE_API = "http://localhost:5000/api";
const ListOrders = () => {
  const [accessToken, setAccessToken] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID||"");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY||"");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(()=>{ const t=localStorage.getItem("amazonAccessToken"); if(t) setAccessToken(t); },[]);
  const load = async()=>{
    setLoading(true);
    try{
      const res = await axios.post(`${NODE_API}/amazon/orders/list`,{accessToken, awsAccessKey, awsSecretKey, marketplaceIds:[marketplaceId], region:"us-east-1", environment:"production"});
      setData(JSON.stringify(res.data,null,2));
    }catch(e){ setData(JSON.stringify(e.response?.data||e.message,null,2)); } finally{ setLoading(false); }
  };
  return (
    <div style={{width:950, maxWidth:"95%", margin:"20px auto"}}>
      <h2>Orders API - ListOrders v0</h2>
      <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={{width:"100%", padding:10}} placeholder="Atza|..."/>
      <input value={marketplaceId} onChange={e=>setMarketplaceId(e.target.value)} style={{width:"100%", padding:10, marginTop:8}} placeholder="MarketplaceId"/>
      <button onClick={load} style={{background:"#146eb4", color:"#fff", padding:"10px 18px", borderRadius:6, border:"none", marginTop:10}}>{loading?"Loading...":"List Orders"}</button>
      {data && <textarea rows={25} readOnly value={data} style={{width:"100%", marginTop:10, fontFamily:"monospace", background:"#f8fafc"}}/>}
    </div>
  );
};
export default ListOrders;