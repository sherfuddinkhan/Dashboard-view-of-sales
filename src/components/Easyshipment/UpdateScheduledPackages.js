import React, { useState } from "react";
import axios from "axios";

const UpdateScheduledPackages = ({ accessToken, amazonOrderId, marketplaceId, activeSlot, styles, onResult }) => {
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    if (!accessToken || !activeSlot?.slotId) return alert("Missing slot updates profile mapping.");
    setLoading(true);
    try {
      const response = await axios.patch("http://localhost:5000/easyShip/2022-03-23/package", {
        accessToken,
        amazonOrderId,
        marketplaceId,
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
      <h3>4. Reschedule Operations</h3>
      <button onClick={execute} disabled={loading} style={{ ...styles.button, backgroundColor: "#ed6c02" }}>
        {loading ? "Updating..." : "4. Modify Appointment Slot"}
      </button>
    </div>
  );
};

const sectionStyle = { borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "15px" };
export default UpdateScheduledPackages;