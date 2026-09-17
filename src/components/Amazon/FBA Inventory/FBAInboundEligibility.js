import React, { useState } from "react";
import axios from "axios";

const FBAInboundEligibility = () => {
  const [asin, setAsin] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("A21TJRUUN4KGV");
  const [result, setResult] = useState("");

  const checkEligibility = async () => {
    const res = await axios.post("http://localhost:5000/api/amazon/fba/inbound/eligibility", {
      accessToken: localStorage.getItem("amazonAccessToken"),
      awsAccessKey: "YOUR_AWS_KEY", awsSecretKey: "YOUR_AWS_SECRET",
      region: "us-east-1", environment: "production",
      asin, marketplaceId, program: "INBOUND"
    });
    setResult(JSON.stringify(res.data, null, 2));
  };

  return (
    <div>
      <h2>FBA Inbound Eligibility API - v1</h2>
      <p>Get eligibility preview before shipping to FBA</p>
      <input value={asin} onChange={e=>setAsin(e.target.value)} placeholder="Enter ASIN" style={{padding:10, width:300, marginRight:10}} />
      <button onClick={checkEligibility} style={{padding:"10px 18px", background:"#146eb4", color:"#fff", border:"none", borderRadius:6}}>Check Eligibility</button>
      <pre style={{marginTop:20, background:"#f8fafc", padding:10, border:"1px solid #ddd"}}>{result}</pre>
    </div>
  );
};

export default FBAInboundEligibility;