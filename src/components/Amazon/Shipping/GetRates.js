import React, { useState,useEffect} from "react";
import axios from "axios";
import  AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";
import ErrorDisplay from "../Common/ErrorDisplay";

const GetRates = (props) => {
  const [accessToken, setAccessToken] = useState("");
  const [orderId, setOrderId] = useState("");
  const [weight, setWeight] = useState("1.0");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("8");
  const [height, setHeight] = useState("6");
  const [rates, setRates] = useState(null);
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

  const getRates = async () => {
    setLoading(true);
    setError(null);
    setRates(null);
    try {
      const res = await axios.post("http://localhost:5000/api/shipping/rates", {
        ...props, orderId, weight, dimensions: { length, width, height }
      });
      setRates(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Get Shipping Rates</h2>
     <label>Access Token</label>
      <textarea rows={4} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={styles. textarea}/>
      <input type="text" placeholder="Amazon Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} style={{ width: "100%", marginBottom: 15, padding: 10 }} />
      <div style={{ display: 'flex', gap: '10px', marginBottom: 15 }}>
        <input type="number" placeholder="Weight (lb)" value={weight} onChange={e => setWeight(e.target.value)} style={{ flex: 1, padding: 10 }} />
        <input type="number" placeholder="L (in)" value={length} onChange={e => setLength(e.target.value)} style={{ flex: 1, padding: 10 }} />
        <input type="number" placeholder="W (in)" value={width} onChange={e => setWidth(e.target.value)} style={{ flex: 1, padding: 10 }} />
        <input type="number" placeholder="H (in)" value={height} onChange={e => setHeight(e.target.value)} style={{ flex: 1, padding: 10 }} />
      </div>
      <button onClick={getRates} disabled={loading}>
        {loading ? "Loading..." : "Get Shipping Rates"}
      </button>
      <ErrorDisplay error={error} onClose={() => setError(null)} />
      {rates && <pre>{JSON.stringify(rates, null, 2)}</pre>}
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


export default GetRates;