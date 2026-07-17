import React, { useState } from "react";
import axios from "axios";

const ListHandoverSlots = ({ accessToken, amazonOrderId, marketplaceId, styles, onSlotsFound }) => {
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("15");
  const [height, setHeight] = useState("10");
  const [dimensionUnit, setDimensionUnit] = useState("cm");
  const [weightValue, setWeightValue] = useState("1.5");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    if (!accessToken || !amazonOrderId || !marketplaceId) return alert("Global configs missing.");
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/easyShip/2022-03-23/timeSlot", {
        accessToken,
        amazonOrderId,
        marketplaceId,
        packageDimensions: { length: parseFloat(length), width: parseFloat(width), height: parseFloat(height), unit: dimensionUnit },
        packageWeight: { value: parseFloat(weightValue), unit: weightUnit }
      });
      onSlotsFound(response.data);
    } catch (err) {
      onSlotsFound({ error: err.response ? err.response.data : err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={sectionStyle}>
      <h3>1. Package Matrix & Available Slots</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        <input type="number" placeholder="L" value={length} onChange={(e) => setLength(e.target.value)} style={{ ...styles.input, width: "70px" }} />
        <input type="number" placeholder="W" value={width} onChange={(e) => setWidth(e.target.value)} style={{ ...styles.input, width: "70px" }} />
        <input type="number" placeholder="H" value={height} onChange={(e) => setHeight(e.target.value)} style={{ ...styles.input, width: "70px" }} />
        <input type="text" placeholder="Unit" value={dimensionUnit} onChange={(e) => setDimensionUnit(e.target.value)} style={{ ...styles.input, width: "70px" }} />
        <input type="number" placeholder="Weight" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} style={{ ...styles.input, width: "90px", marginLeft: "10px" }} />
        <input type="text" placeholder="Unit" value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} style={{ ...styles.input, width: "70px" }} />
      </div>
      <button onClick={execute} disabled={loading} style={{ ...styles.button, backgroundColor: "#2e7d32" }}>
        {loading ? "Searching..." : "1. Find Handover Slots"}
      </button>
    </div>
  );
};

const sectionStyle = { borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "15px" };
export default ListHandoverSlots;