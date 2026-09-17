import React, { useState, useEffect } from "react";
import axios from "axios";
const NODE_API = "http://localhost:5000/api";
const GetQuery = () => {
  const [accessToken, setAccessToken] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID||"");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY||"");
  const [queryId, setQueryId] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(()=>{ const t=localStorage.getItem("amazonAccessToken"); if(t) setAccessToken(t); },[]);
  const load = async()=>{
    if(!accessToken||!queryId) return setError("Token and QueryId required");
    setLoading(true); setError(""); setData("");
    try{
      const res = await axios.post(`${NODE_API}/amazon/data-kiosk/get-query`,{accessToken, awsAccessKey, awsSecretKey, queryId, region:"us-east-1", environment:"production"});
      setData(JSON.stringify(res.data,null,2));
    }catch(e){ setError(e.response?JSON.stringify(e.response.data,null,2):e.message); } finally{ setLoading(false); }
  };
  return (
    <div style={{width:950, maxWidth:"95%", margin:"20px auto"}}>
      <h2>Data Kiosk - GetQuery - v2023-11-15</h2>
      <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={{width:"100%", padding:10}} placeholder="Atza|..."/>
      <input value={queryId} onChange={e=>setQueryId(e.target.value)} placeholder="queryId - from CreateQuery" style={{width:"100%", padding:10, marginTop:8}}/>
      <button onClick={load} style={{background:"#146eb4", color:"#fff", padding:"10px 18px", borderRadius:6, border:"none", marginTop:10}}>{loading?"Loading...":"Get Query Status"}</button>
      {data && <textarea rows={18} readOnly value={data} style={{width:"100%", marginTop:10, fontFamily:"monospace", background:"#f8fafc"}}/>}
      {error && <pre style={{color:"red", whiteSpace:"pre-wrap"}}>{error}</pre>}
    </div>
  );
};
export default GetQuery;