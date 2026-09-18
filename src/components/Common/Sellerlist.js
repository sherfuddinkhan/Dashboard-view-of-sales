import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, RefreshCw, User, Store, Users, CheckCircle, XCircle, Eye } from "lucide-react";
import "./Sellerlist.css";

const Sellerlist = ({ marketplace: propMarketplace, onSellerClick, onCustomerClick }) => {
  const navigate = useNavigate();
  const { marketplace: paramMarketplace } = useParams();
  const marketplace = propMarketplace || paramMarketplace || "mystore";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/seller-customers");
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to load seller customers");
      setCustomers(Array.isArray(result.data)? result.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c => {
    const s = searchTerm.toLowerCase();
    return String(c.customerId).toLowerCase().includes(s) || String(c.sellerId).toLowerCase().includes(s) || c.customerName?.toLowerCase().includes(s);
  });

  const handleView = (customer) => {
    // OPTION 1: if parent gave callback, use it (no navigation)
    if (onCustomerClick) {
      return onCustomerClick(customer.sellerId, customer.customerId);
    }
    if (onSellerClick &&!customer.customerId) {
      return onSellerClick(customer.sellerId);
    }
    // OPTION 2: navigate
    if (marketplace === "mystore") navigate(`/mystore/customers/${customer.sellerId}/${customer.customerId}`);
    else navigate(`/marketplaces/${marketplace}/customers/${customer.sellerId}/${customer.customerId}`);
  };

  return (
    <div className="seller-list-page">
      <div className="seller-list-header">
        <div><h1 style={{ textTransform: 'capitalize' }}>{marketplace} Customers</h1><p>Click View to open profile - Seller ID + Customer ID will be passed</p></div>
        <button className="seller-refresh-btn" onClick={fetchCustomers}><RefreshCw size={17} className={loading? "seller-spin" : ""} /> Refresh</button>
      </div>
      {error && <div className="seller-error">{error} <button onClick={fetchCustomers}>Try Again</button></div>}
      <div className="seller-table-container">
        <table className="seller-table">
          <thead><tr><th>Customer ID</th><th>Seller ID</th><th>Customer Name</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={`${c.sellerId}-${c.customerId}`}>
                <td>{c.customerId}</td><td>{c.sellerId}</td><td><strong>{c.customerName}</strong></td>
                <td>{c.isActive? <span className="status active"><CheckCircle size={14} /> Active</span> : <span className="status inactive"><XCircle size={14} /> Inactive</span>}</td>
                <td><button className="view-btn" onClick={() => handleView(c)}><Eye size={15} /> View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sellerlist;