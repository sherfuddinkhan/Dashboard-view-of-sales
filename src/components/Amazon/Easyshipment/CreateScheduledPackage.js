import React, { useState } from "react";
import axios from "axios";

const CreateScheduledPackage = ({ accessToken, amazonOrderId, marketplaceId, activeSlot, styles, onResult }) => {
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    if (!accessToken || !activeSlot?.slotId) return alert("Missing slot selection parameters.");
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/easyShip/2022-03-23/package", {
        accessToken,
        amazonOrderId,
        marketplaceId,
        packageDimensions: { length: 20, width: 15, height: 10, unit: "cm" },
        packageWeight: { value: 1.5, unit: "kg" },
        handOverTimeSlot: activeSlot
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
      <h3>3. Commit Courier Pickup</h3>
      <button onClick={execute} disabled={loading} style={styles.button}>
        {loading ? "Scheduling..." : "3. Confirm Initial Schedule"}
      </button>
    </div>
  );
};

const sectionStyle = { borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "15px" };
export default CreateScheduledPackage;