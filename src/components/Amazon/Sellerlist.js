import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  User,
  Store,
  Users,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

import "./Sellerlist.css";

const Sellerlist = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // =====================================================
  // GET ALL SELLER CUSTOMERS
  // =====================================================

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
          result.message || "Failed to load seller customers"
        );
      }

      setCustomers(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();

    return (
      String(customer.customerId)
        .toLowerCase()
        .includes(search) ||

      String(customer.sellerId)
        .toLowerCase()
        .includes(search) ||

      customer.customerCode
        ?.toLowerCase()
        .includes(search) ||

      customer.customerName
        ?.toLowerCase()
        .includes(search) ||

      customer.contactPerson
        ?.toLowerCase()
        .includes(search)
    );
  });

  // =====================================================
  // OPEN CUSTOMER
  // =====================================================

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="seller-list-page">

      {/* HEADER */}
      <div className="seller-list-header">

        <div>
          <h1>Seller Customers</h1>

          <p>
            View and manage seller customer information
          </p>
        </div>

        <button
          className="seller-refresh-btn"
          onClick={fetchCustomers}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading ? "seller-spin" : ""
            }
          />

          Refresh
        </button>

      </div>


      {/* SUMMARY */}
      <div className="seller-summary">

        <div className="seller-summary-card">

          <div className="seller-summary-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Customers</span>

            <strong>
              {customers.length}
            </strong>
          </div>

        </div>


        <div className="seller-summary-card">

          <div className="seller-summary-icon">
            <CheckCircle size={22} />
          </div>

          <div>
            <span>Active Customers</span>

            <strong>
              {
                customers.filter(
                  (customer) =>
                    customer.isActive
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="seller-summary-card">

          <div className="seller-summary-icon">
            <Store size={22} />
          </div>

          <div>
            <span>Sellers</span>

            <strong>
              {
                new Set(
                  customers.map(
                    (customer) =>
                      customer.sellerId
                  )
                ).size
              }
            </strong>
          </div>

        </div>

      </div>


      {/* SEARCH */}
      <div className="seller-toolbar">

        <div className="seller-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search customer, code, seller ID..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

        </div>

      </div>


      {/* ERROR */}
      {error && (
        <div className="seller-error">

          <span>{error}</span>

          <button onClick={fetchCustomers}>
            Try Again
          </button>

        </div>
      )}


      {/* LOADING */}
      {loading && (
        <div className="seller-loading">

          <RefreshCw
            size={24}
            className="seller-spin"
          />

          Loading customers...

        </div>
      )}


      {/* TABLE */}
      {!loading && !error && (
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

              {filteredCustomers.length > 0 ? (

                filteredCustomers.map(
                  (customer) => (

                    <tr
                      key={customer.customerId}
                    >

                      {/* CUSTOMER ID */}
                      <td>

                        <div className="id-cell">

                          <User size={15} />

                          {customer.customerId}

                        </div>

                      </td>


                      {/* SELLER ID */}
                      <td>

                        <div className="id-cell">

                          <Store size={15} />

                          {customer.sellerId}

                        </div>

                      </td>


                      {/* CUSTOMER CODE */}
                      <td>

                        <span className="customer-code">

                          {customer.customerCode}

                        </span>

                      </td>


                      {/* CUSTOMER NAME */}
                      <td>

                        <strong>
                          {customer.customerName}
                        </strong>

                      </td>


                      {/* CONTACT PERSON */}
                      <td>

                        {customer.contactPerson}

                      </td>


                      {/* STATUS */}
                      <td>

                        {customer.isActive ? (

                          <span className="status active">

                            <CheckCircle size={14} />

                            Active

                          </span>

                        ) : (

                          <span className="status inactive">

                            <XCircle size={14} />

                            Inactive

                          </span>

                        )}

                      </td>


                      {/* ACTION */}
                      <td>

                        <button
                          className="view-btn"
                          onClick={() =>
                            handleViewCustomer(
                              customer
                            )
                          }
                        >

                          <Eye size={15} />

                          View

                        </button>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="no-data"
                  >
                    No customers found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>
      )}


      {/* CUSTOMER DETAILS */}
      {selectedCustomer && (

        <div
          className="seller-modal-overlay"
          onClick={() =>
            setSelectedCustomer(null)
          }
        >

          <div
            className="seller-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="seller-modal-header">

              <div>

                <h2>
                  Customer Details
                </h2>

                <p>
                  {selectedCustomer.customerName}
                </p>

              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedCustomer(null)
                }
              >
                ×
              </button>

            </div>


            <div className="seller-details-grid">

              <div>
                <span>Customer ID</span>
                <strong>
                  {selectedCustomer.customerId}
                </strong>
              </div>

              <div>
                <span>Seller ID</span>
                <strong>
                  {selectedCustomer.sellerId}
                </strong>
              </div>

              <div>
                <span>Customer Code</span>
                <strong>
                  {selectedCustomer.customerCode}
                </strong>
              </div>

              <div>
                <span>Customer Name</span>
                <strong>
                  {selectedCustomer.customerName}
                </strong>
              </div>

              <div>
                <span>Contact Person</span>
                <strong>
                  {selectedCustomer.contactPerson}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedCustomer.email}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {selectedCustomer.phone}
                </strong>
              </div>

              <div>
                <span>GSTIN</span>
                <strong>
                  {selectedCustomer.gstin}
                </strong>
              </div>

              <div>
                <span>City</span>
                <strong>
                  {selectedCustomer.city}
                </strong>
              </div>

              <div>
                <span>State</span>
                <strong>
                  {selectedCustomer.state}
                </strong>
              </div>

              <div>
                <span>Credit Limit</span>
                <strong>
                  ₹{" "}
                  {Number(
                    selectedCustomer.creditLimit || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedCustomer.isActive
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Sellerlist;