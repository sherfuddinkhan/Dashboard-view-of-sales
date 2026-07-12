import React, { useState } from "react";
import axios from "axios";
import ApiCredentials from "../Common/ApiCredentials";
import ErrorDisplay from "../Common/ErrorDisplay";

const ProductTypeDefinitions = ({ 
  accessToken, setAccessToken, 
  awsAccessKey, setAwsAccessKey, 
  awsSecretKey, setAwsSecretKey, 
  region, setRegion, 
  environment, setEnvironment,
  marketplaceIds, setMarketplaceIds
}) => {
  const [productTypes, setProductTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);

  const getProductTypes = async () => {
    setError(null);
    try {
      const res = await axios.post("http://localhost:5000/api/product-types/search", {
        accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds
      });
      setProductTypes(res.data.payload.productTypes);
    } catch (err) {
      setError(err);
    }
  };

  const getSchema = async () => {
    if (!selectedType) return;
    setError(null); setSchema(null);
    try {
      const res = await axios.post("http://localhost:5000/api/product-types/definition", {
        accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds, productType: selectedType
      });
      setSchema(res.data);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Product Type Definitions API</h2>
      <p>Get JSON schema for any Amazon category. Required fields for listings.</p>
      
      <ApiCredentials 
        accessToken={accessToken} setAccessToken={setAccessToken}
        awsAccessKey={awsAccessKey} setAwsAccessKey={setAwsAccessKey}
        awsSecretKey={awsSecretKey} setAwsSecretKey={setAwsSecretKey}
        region={region} setRegion={setRegion}
        environment={environment} setEnvironment={setEnvironment}
      />
      
      <input 
        type="text" 
        placeholder="Marketplace IDs" 
        value={marketplaceIds} 
        onChange={e => setMarketplaceIds(e.target.value)} 
        style={styles.input} 
      />
      <button onClick={getProductTypes} style={styles.button}>1. Search Product Types</button>

      {productTypes.length > 0 && (
        <>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={styles.input}>
            <option value="">Select Product Type</option>
            {productTypes.map(pt => (
              <option key={pt.name} value={pt.name}>{pt.displayName} ({pt.name})</option>
            ))}
          </select>
          <button onClick={getSchema} disabled={!selectedType} style={styles.button}>2. Get Schema</button>
        </>
      )}

      <ErrorDisplay error={error} onClose={() => setError(null)} />
      {schema && <><h3>Schema for {selectedType}</h3><pre style={styles.pre}>{JSON.stringify(schema, null, 2)}</pre></>}
    </div>
  );
};

const styles = {
  container: { width: '100%' },
  input: { width: "100%", marginBottom: 15, padding: 10, fontSize: 15, border: '1px solid #cbd5e1', borderRadius: 6 },
  button: { background: "#146eb4", color: "#fff", border: "none", padding: "12px 25px", cursor: "pointer", fontSize: 16, borderRadius: 5, marginBottom: 15 },
  pre: { background: '#f1f5f9', padding: 15, borderRadius: 6, overflow: 'auto', fontSize: 12 }
};

export default ProductTypeDefinitions;