import React, { useEffect, useState } from "react";
import axios from "axios";

const FlipkartReturns = () => {
  const [returns, setReturns] = useState([]);
  useEffect(()=>{ axios.get("/api/flipkart/returns").then(r=>setReturns(r.data.returns)); },[]);
  const completeReturn = async (id) => {
    await axios.post("/api/flipkart/returns/complete", { returnId: id });
    alert("Return Completed: " + id);
  };
  return (
    <div>
      <h2>Flipkart Returns & Refunds</h2>
      <table style={{width:"100%"}}>
        <thead><tr><th>Return ID</th><th>Order ID</th><th>SKU</th><th>Reason</th><th>Refund</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{returns.map(r=><tr key={r.returnId}><td>{r.returnId}</td><td>{r.orderId}</td><td>{r.skuId}</td><td>{r.reason}</td><td>{r.refundAmount}</td><td>{r.status}</td><td><button onClick={()=>completeReturn(r.returnId)}>Complete</button></td></tr>)}</tbody>
      </table>
    </div>
  );
};
export default FlipkartReturns;