import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  User,
  Store,
  Users,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import "./Sellerlist.css";

const Sellerlist = ({ marketplace: propMarketplace }) => {

  const navigate = useNavigate();
  const { marketplace: paramMarketplace } = useParams();

  // FIX FOR UNDEFINED: prop > param > fallback
  const marketplace = propMarketplace || paramMarketplace || "amazon";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/seller-customers"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to load seller customers"
        );
      }

      setCustomers(
        Array.isArray(result.data)
         ? result.data
          : []
      );

    } catch (err) {
      console.error("Seller Customer API Error:", err);
      setError(err.message || "Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [marketplace]);

  const filteredCustomers = customers.filter(
    (customer) => {
      const search = searchTerm.toLowerCase();
      return (
        String(customer.customerId).toLowerCase().includes(search) ||
        String(customer.sellerId).toLowerCase().includes(search) ||
        customer.customerCode?.toLowerCase().includes(search) ||
        customer.customerName?.toLowerCase().includes(search) ||
        customer.contactPerson?.toLowerCase().includes(search)
      );
    }
  );

  const handleViewCustomer = (customer) => {
    const sellerId = customer.sellerId;
    const customerId = customer.customerId;

    console.log("Navigating to:", marketplace, sellerId, customerId);

    // GENERALIZED + FIXED FOR MYSTORE
    if (marketplace === "mystore") {
      navigate(`/mystore/customers/${sellerId}/${customerId}`);
    } else {
      navigate(`/marketplaces/${marketplace}/customers/${sellerId}/${customerId}`);
    }
  };

  return (
    <div className="seller-list-page">
      <div className="seller-list-header">
        <div>
          <h1 style={{textTransform: 'capitalize'}}>
            {marketplace} Customers
          </h1>
          <p>View seller-specific customer information</p>
        </div>
        <button className="seller-refresh-btn" onClick={fetchCustomers} disabled={loading}>
          <RefreshCw size={17} className={loading? "seller-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="seller-summary">
        <div className="seller-summary-card">
          <div className="seller-summary-icon"><Users size={22} /></div>
          <div><span>Total Customers</span><strong>{customers.length}</strong></div>
        </div>
        <div className="seller-summary-card">
          <div className="seller-summary-icon"><CheckCircle size={22} /></div>
          <div><span>Active Customers</span><strong>{customers.filter(customer => customer.isActive).length}</strong></div>
        </div>
        <div className="seller-summary-card">
          <div className="seller-summary-icon"><Store size={22} /></div>
          <div><span>Sellers</span><strong>{new Set(customers.map(customer => customer.sellerId)).size}</strong></div>
        </div>
      </div>

      <div className="seller-toolbar">
        <div className="seller-search">
          <Search size={18} />
          <input type="text" placeholder="Search customer, code, seller ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {error && (
        <div className="seller-error">
          <span>{error}</span>
          <button onClick={fetchCustomers}>Try Again</button>
        </div>
      )}

      {loading && (
        <div className="seller-loading">
          <RefreshCw size={24} className="seller-spin" /> Loading customers...
        </div>
      )}

      {!loading &&!error && (
        <div className="seller-table-container">
          <table className="seller-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Seller ID</th>
                <th>Customer Code</th>
                <th>Customer Name</th>
                <th>Contact Person</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0? (
                filteredCustomers.map((customer) => (
                  <tr key={`${customer.sellerId}-${customer.customerId}`}>
                    <td><div className="id-cell"><User size={15} />{customer.customerId}</div></td>
                    <td><div className="id-cell"><Store size={15} />{customer.sellerId}</div></td>
                    <td><span className="customer-code">{customer.customerCode}</span></td>
                    <td><strong>{customer.customerName}</strong></td>
                    <td>{customer.contactPerson}</td>
                    <td>
                      {customer.isActive? (
                        <span className="status active"><CheckCircle size={14} /> Active</span>
                      ) : (
                        <span className="status inactive"><XCircle size={14} /> Inactive</span>
                      )}
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => handleViewCustomer(customer)}>
                        <Eye size={15} /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="no-data">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Sellerlist;