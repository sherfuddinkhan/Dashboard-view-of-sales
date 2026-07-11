import React from "react";
import { NavLink } from "react-router-dom";
import { FiKey, FiGlobe, FiBook, FiShoppingCart, FiFileText, FiDollarSign, 
         FiUpload, FiList, FiSettings, FiGrid } from "react-icons/fi";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Amazon SP-API</h2>

      <NavLink to="/dashboard" end><FiGrid /> Dashboard</NavLink>

      <div className="sidebar-section">Authentication</div>
      <NavLink to="/generate-token"><FiKey /> Token Generator</NavLink>

      <div className="sidebar-section">Seller APIs</div>
      <NavLink to="/marketplace"><FiGlobe /> Marketplace</NavLink>

      <div className="sidebar-section">Catalog & Pricing</div>
      <NavLink to="/catalog"><FiBook /> Catalog Item</NavLink>
      <NavLink to="/pricing"><FiDollarSign /> Pricing</NavLink>

      <div className="sidebar-section">Listings</div>
      <NavLink to="/listings/create"><FiList /> Create Listing</NavLink>
      <NavLink to="/listings/get"><FiList /> Get Listing</NavLink>
      <NavLink to="/listings/update"><FiList /> Update Listing</NavLink>
      <NavLink to="/listings/delete"><FiList /> Delete Listing</NavLink>
      <NavLink to="/listings/submission"><FiList /> Listing Submission</NavLink>

      <div className="sidebar-section">Orders</div>
      <NavLink to="/orders"><FiShoppingCart /> Get Orders</NavLink>

      <div className="sidebar-section">Reports</div>
      <NavLink to="/reports/create"><FiFileText /> Create Report</NavLink>
      <NavLink to="/reports/get"><FiFileText /> Get Report</NavLink>

      <div className="sidebar-section">Feeds</div>
      <NavLink to="/feeds/create-document"><FiUpload /> Create Feed Document</NavLink>
      <NavLink to="/feeds/create"><FiUpload /> Create Feed</NavLink>
      <NavLink to="/feeds/get"><FiUpload /> Get Feed</NavLink>

      <div className="sidebar-section">Settings</div>
      <NavLink to="/settings"><FiSettings /> Settings</NavLink>
    </div>
  );
};

export default Sidebar;