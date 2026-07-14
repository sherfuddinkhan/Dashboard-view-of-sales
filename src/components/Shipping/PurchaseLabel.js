import React, { useState,useEffect } from "react";
import axios from "axios";
import  AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";
import ErrorDisplay from "../Common/ErrorDisplay";

const PurchaseLabel = (props) => {
  const [shipmentId, setShipmentId] = useState("");
  const [rateId, setRateId] = useState("");
  const [label, setLabel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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

export default PurchaseLabel;