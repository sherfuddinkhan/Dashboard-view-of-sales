import { useState,useEffect } from 'react';
import axios from 'axios';

const containerStyle = { padding: '20px', maxWidth: '800px', margin: '0 auto' };
const inputStyle = { width: '100%', padding: '8px', margin: '8px 0' };
const textAreaStyle = { width: '100%', padding: '8px', margin: '8px 0', minHeight: '80px' };
const buttonStyle = { padding: '12px 20px', fontSize: '16px', margin: '10px 0' };

const Pricing = () => {
  const [accessToken, setAccessToken] = useState('');
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
  const [serviceName, setServiceName] = useState("execute-api");
  const [sellerId, setSellerId] = useState("A13V1IB3VIYZZH");
  const [sku, setSku] = useState('');
  const [asin, setAsin] = useState('');
  const [marketplaceId, setMarketplaceId] = useState('');
  const [itemCondition, setItemCondition] = useState('New');
 const [customerType, setCustomerType] = useState('Consumer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
    useEffect(() => {
           const token = localStorage.getItem("amazonAccessToken");
           if (token) {
               setAccessToken(token);
           }
           const marketplace = JSON.parse(
               localStorage.getItem("amazonMarketplaceResponse") || "{}"
           );
           if (marketplace.payload?.length) {
               setMarketplaceId(marketplace.payload[0].marketplace.id);
           }
       }, []);
   const getPricing = async () => {
    if (!accessToken || !marketplaceId || (!sku && !asin)) {
      setError("Access Token, Marketplace ID, and either SKU or ASIN are required");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await axios.post("http://localhost:5000/api/pricing", {
        accessToken,
        awsAccessKey,
        awsSecretKey,
        region,
        serviceName,
        environment,
        sku,
        asin,
        marketplaceId,
        itemCondition,
        customerType
      });

      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Amazon SP-API Pricing</h2>

      <label>Access Token</label>
      <textarea rows={4} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>AWS Access Key</label>
      <input type="text" value={awsAccessKey} onChange={(e) => setAwsAccessKey(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>AWS Secret Key</label>
      <input type="password" value={awsSecretKey} onChange={(e) => setAwsSecretKey(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label>Environment</label>
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)} style={{ width: '100%' }}>
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </div>
        <div>
          <label>Region</label>
          <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <label>Service Name</label>
      <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>Marketplace ID</label>
      <input type="text" value={marketplaceId} onChange={(e) => setMarketplaceId(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>SKU (Recommended)</label>
      <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>ASIN (Fallback)</label>
      <input type="text" value={asin} onChange={(e) => setAsin(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

      <label>Item Condition</label>
      <select value={itemCondition} onChange={(e) => setItemCondition(e.target.value)} style={{ width: '100%', marginBottom: '10px' }}>
        <option value="New">New</option>
        <option value="Used">Used</option>
        <option value="Refurbished">Refurbished</option>
      </select>

      <label>Customer Type</label>
      <select value={customerType} onChange={(e) => setCustomerType(e.target.value)} style={{ width: '100%', marginBottom: '20px' }}>
        <option value="Consumer">Consumer</option>
        <option value="Business">Business</option>
      </select>

      <button onClick={getPricing} disabled={loading} style={{ padding: '12px 24px', fontSize: '16px' }}>
        {loading ? "Fetching..." : "Get Pricing"}
      </button>

      {error && <pre style={{ color: 'red', background: '#ffe6e6', padding: '15px' }}>{error}</pre>}
      {result && <pre style={{ background: '#f8f8f8', padding: '15px', overflow: 'auto' }}>{result}</pre>}
    </div>
  );
};

export default Pricing;