import React, { useEffect, useState } from "react";
import axios from "axios";

const FlipkartShipments = () => {
  const [shipments, setShipments] = useState([]);
  useEffect(()=>{ axios.get("/api/flipkart/shipments").then(r=>setShipments(r.data.shipments)); },[]);
  const markRTD = async (id) => {
    await axios.post("/api/flipkart/shipments/rtd", { shipmentId: id });
    alert("Marked Ready To Dispatch: " + id);
  };
  return (
    <div>
      <h2>Flipkart Shipments</h2>
      <table style={{width:"100%"}}>
        <thead><tr><th>Shipment ID</th><th>Order ID</th><th>Courier</th><th>Tracking</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{shipments.map(s=><tr key={s.shipmentId}><td>{s.shipmentId}</td><td>{s.orderId}</td><td>{s.courier}</td><td>{s.trackingId}</td><td>{s.status}</td><td><button onClick={()=>markRTD(s.shipmentId)}>RTD</button></td></tr>)}</tbody>
      </table>
    </div>
  );
};
export default FlipkartShipments;