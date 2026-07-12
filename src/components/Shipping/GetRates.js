import React, { useState } from "react";
import axios from "axios";
import  AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";
import ErrorDisplay from "../Common/ErrorDisplay";

const GetRates = (props) => {
  const [orderId, setOrderId] = useState("");
  const [weight, setWeight] = useState("1.0");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("8");
  const [height, setHeight] = useState("6");
  const [rates, setRates] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      <AmazonTokenGenerator {...props} />
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

export default GetRates;