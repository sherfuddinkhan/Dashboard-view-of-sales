import React, { useState } from "react";
import axios from "axios";

const GetScheduledPackage = ({ accessToken, amazonOrderId, marketplaceId, styles, onResult }) => {
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    if (!accessToken || !amazonOrderId || !marketplaceId) return alert("Global configs missing.");
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/easyShip/2022-03-23/package", {
        params: { amazonOrderId, marketplaceId },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      onResult(response.data);
    } catch (err) {
      onResult({ error: err.response ? err.response.data : err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={sectionStyle}>
      <h3>2. Inspect Shipment Status</h3>
      <button onClick={execute} disabled={loading} style={{ ...styles.button, backgroundColor: "#0288d1" }}>
        {loading ? "Checking..." : "2. Check Package Status"}
      </button>
    </div>
  );
};

const sectionStyle = { borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "15px" };
export default GetScheduledPackage;