import React, { useState,useEffect } from "react";
import axios from "axios";
import  AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";
import ErrorDisplay from "../Common/ErrorDisplay";

const PurchaseLabel = (props) => {
  const [accessToken, setAccessToken] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [rateId, setRateId] = useState("");
  const [label, setLabel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
  useEffect(() => {
           const token = localStorage.getItem("amazonAccessToken");
           if (token) {
               setAccessToken(token);
           }
       }, []);
  const purchaseLabel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("http://localhost:5000/api/shipping/purchase-label", {
        ...props, shipmentId, rateId
      });
      setLabel(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Purchase Shipping Label</h2>
    <label>Access Token</label>
      <textarea rows={4} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={styles. textarea}/>
      <input type="text" placeholder="Shipment ID" value={shipmentId} onChange={e => setShipmentId(e.target.value)} style={{ width: "100%", marginBottom: 15, padding: 10 }} />
      <input type="text" placeholder="Rate ID from GetRates" value={rateId} onChange={e => setRateId(e.target.value)} style={{ width: "100%", marginBottom: 15, padding: 10 }} />
      <button onClick={purchaseLabel} disabled={loading || !shipmentId || !rateId}>
        {loading ? "Purchasing..." : "Purchase Label"}
      </button>
      <ErrorDisplay error={error} onClose={() => setError(null)} />
      {label && (
        <>
          <h3>Label PDF URL</h3>
          <a href={label.labelDocument?.fileContents} target="_blank" rel="noreferrer">Download Label PDF</a>
          <pre>{JSON.stringify(label, null, 2)}</pre>
        </>
      )}
    </div>
  );
};
const styles = {
  container: {
    maxWidth: "850px",
    margin: "20px auto",
    padding: "25px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  button: {
    padding: "12px 25px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  response: {
    marginTop: "20px",
    padding: "15px",
    background: "#f5f5f5",
    borderRadius: "5px",
  },

  error: {
    marginTop: "20px",
    padding: "15px",
    background: "#ffebee",
    color: "#b71c1c",
    borderRadius: "5px",
  },
};

export default PurchaseLabel;