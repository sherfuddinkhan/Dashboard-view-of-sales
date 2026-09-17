import React, { useEffect, useState } from "react";
import axios from "axios";

const FlipkartOrders = () => {
  const [orders, setOrders] = useState([]);
  useEffect(()=>{ axios.get("/api/flipkart/orders").then(r=>setOrders(r.data.orders)); },[]);
  return (
    <div>
      <h2>Flipkart Orders</h2>
      <table style={{width:"100%"}}>
        <thead><tr><th>Order ID</th><th>Item ID</th><th>SKU</th><th>FSN</th><th>Qty</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>{orders.map(o=><tr key={o.orderId}><td>{o.orderId}</td><td>{o.orderItemId}</td><td>{o.skuId}</td><td>{o.fsn}</td><td>{o.quantity}</td><td>{o.price}</td><td>{o.status}</td></tr>)}</tbody>
      </table>
    </div>
  );
};
export default FlipkartOrders;