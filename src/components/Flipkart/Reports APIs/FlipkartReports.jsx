import React, { useState } from "react";
import axios from "axios";

const FlipkartReports = () => {
  const [type, setType] = useState("sales");
  const [data, setData] = useState([]);
  const fetchReport = async () => {
    const res = await axios.get(`/api/flipkart/reports/${type}`);
    setData(res.data.data);
  };
  return (
    <div>
      <h2>Flipkart Reports</h2>
      <select value={type} onChange={e=>setType(e.target.value)}>
        <option value="sales">Sales Report</option>
        <option value="inventory">Inventory Report</option>
        <option value="returns">Returns Report</option>
      </select>
      <button onClick={fetchReport}>Get Report</button>
      <table style={{width:"100%", marginTop:20}}>
        <thead><tr><th>Date</th><th>SKU</th><th>Sales</th><th>Revenue</th><th>Returns</th></tr></thead>
        <tbody>{data.map((r,i)=><tr key={i}><td>{r.date}</td><td>{r.skuId}</td><td>{r.sales}</td><td>{r.revenue}</td><td>{r.returns}</td></tr>)}</tbody>
      </table>
    </div>
  );
};
export default FlipkartReports;