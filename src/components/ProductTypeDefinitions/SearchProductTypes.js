import React, { useState } from "react";
import axios from "axios";
import ApiCredentials from "../Common/ApiCredentials";
import ErrorDisplay from "../Common/ErrorDisplay";

const SearchProductTypes = ({ 
  accessToken, setAccessToken, 
  awsAccessKey, setAwsAccessKey, 
  awsSecretKey, setAwsSecretKey, 
  region, setRegion, 
  environment, setEnvironment,
  marketplaceIds, setMarketplaceIds,
  onSelectProductType // callback to parent
}) => {
  const [keywords, setKeywords] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTypes = async () => {
    if (!keywords.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/product-types/search", {
        accessToken, awsAccessKey, awsSecretKey, region, environment, 
        marketplaceIds, keywords
      });
      setProductTypes(res.data.payload.productTypes || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (typeName) => {
    if (onSelectProductType) onSelectProductType(typeName);
  };

  return (
    <div style={styles.container}>
      <h3>1. Search Product Types</h3>
      <p>Enter keywords to find Amazon product type like LUGGAGE, BOOKS</p>
      
      <ApiCredentials 
        accessToken={accessToken} setAccessToken={setAccessToken}
        awsAccessKey={awsAccessKey} setAwsAccessKey={setAwsAccessKey}
        awsSecretKey={awsSecretKey} setAwsSecretKey={setAwsSecretKey}
        region={region} setRegion={setRegion}
        environment={environment} setEnvironment={setEnvironment}
      />
      
      <input 
        type="text" 
        placeholder="Marketplace IDs (A21TJRUUN4KGV)" 
        value={marketplaceIds} 
        onChange={e => setMarketplaceIds(e.target.value)} 
        style={styles.input} 
      />
      
      <input 
        type="text" 
        placeholder="Keywords e.g. luggage, backpack, shoes" 
        value={keywords} 
        onChange={e => setKeywords(e.target.value)} 
        style={styles.input} 
      />
      
      <button onClick={searchTypes} disabled={loading} style={styles.button}>
        {loading? "Searching..." : "Search Product Types"}
      </button>

      <ErrorDisplay error={error} onClose={() => setError(null)} />

      {productTypes.length > 0 && (
        <div style={styles.results}>
          <h4>Found {productTypes.length} product types:</h4>
          {productTypes.map(pt => (
            <div key={pt.name} style={styles.card} onClick={() => handleSelect(pt.name)}>
              <strong>{pt.displayName}</strong>
              <div style={styles.code}>{pt.name}</div>
              <button style={styles.selectBtn}>Select</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { width: '100%', marginBottom: 30 },
  input: { width: "100%", marginBottom: 15, padding: 10, fontSize: 15, border: '1px solid #cbd5e1', borderRadius: 6 },
  button: { background: "#146eb4", color: "#fff", border: "none", padding: "12px 25px", cursor: "pointer", fontSize: 16, borderRadius: 5, marginBottom: 15 },
  results: { marginTop: 20 },
  card: { border: '1px solid #e2e8f0', padding: 15, borderRadius: 8, marginBottom: 10, cursor: 'pointer' },
  code: { fontSize: 12, color: '#64748b', marginTop: 5 },
  selectBtn: { marginTop: 10, padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
};

export default SearchProductTypes;