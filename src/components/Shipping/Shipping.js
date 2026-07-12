import React, { useState } from "react";
import axios from "axios";
import ApiCredentials from "../Common/ApiCredentials";
import ErrorDisplay from "../Common/ErrorDisplay";

const Shipping = ({ 
  accessToken, setAccessToken, 
  awsAccessKey, setAwsAccessKey, 
  awsSecretKey, setAwsSecretKey, 
  region, setRegion, 
  environment, setEnvironment 
}) => {
  const [orderId, setOrderId] = useState("");
  const [weight, setWeight] = useState("1.0");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("8");
  const [height, setHeight] = useState("6");
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(null);

  const getRates = async () => {
    setError(null); setRates(null);
    try {
      const res = await axios.post("http://localhost:5000/api/shipping/rates", {
        accessToken, awsAccessKey, awsSecretKey, region, environment,
        orderId, weight, dimensions: { length, width, height }
      });
      setRates(res.data);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Shipping API</h2>
      <p>Get Amazon-partnered carrier rates for FBM orders</p>
      
      <ApiCredentials 
        accessToken={accessToken} setAccessToken={setAccessToken}
        awsAccessKey={awsAccessKey} setAwsAccessKey={setAwsAccessKey}
        awsSecretKey={awsSecretKey} setAwsSecretKey={setAwsSecretKey}
        region={region} setRegion={setRegion}
        environment={environment} setEnvironment={setEnvironment}
      />
      
      <input type="text" placeholder="Amazon Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} style={styles.input} />
      
      <div style={styles.row}>
        <input type="number" placeholder="Weight (lb)" value={weight} onChange={e => setWeight(e.target.value)} style={styles.inputSmall} />
        <input type="number" placeholder="L (in)" value={length} onChange={e => setLength(e.target.value)} style={styles.inputSmall} />
        <input type="number" placeholder="W (in)" value={width} onChange={e => setWidth(e.target.value)} style={styles.inputSmall} />
        <input type="number" placeholder="H (in)" value={height} onChange={e => setHeight(e.target.value)} style={styles.inputSmall} />
      </div>
      
      <button onClick={getRates} style={styles.button}>Get Shipping Rates</button>

      <ErrorDisplay error={error} onClose={() => setError(null)} />
      {rates && <><h3>Available Rates</h3><pre style={styles.pre}>{JSON.stringify(rates, null, 2)}</pre></>}
    </div>
  );
};

const styles = {
  container: { width: '100%' },
  input: { width: "100%", marginBottom: 15, padding: 10, fontSize: 15, border: '1px solid #cbd5e1', borderRadius: 6 },
  inputSmall: { flex: 1, padding: 10, fontSize: 15, border: '1px solid #cbd5e1', borderRadius: 6 },
  row: { display: 'flex', gap: '10px', marginBottom: 15 },
  button: { background: "#146eb4", color: "#fff", border: "none", padding: "12px 25px", cursor: "pointer", fontSize: 16, borderRadius: 5 },
  pre: { background: '#f1f5f9', padding: 15, borderRadius: 6, overflow: 'auto', fontSize: 12 }
};

export default Shipping;