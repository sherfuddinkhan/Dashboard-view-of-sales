import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {FiKey,FiGlobe,FiBook,FiShoppingCart,FiFileText,FiDollarSign,FiUpload,FiList,FiSettings,FiGrid,FiChevronDown,FiChevronRight,FiMessageSquare,FiTruck} from "react-icons/fi";

const Sidebar = () => {
  const [open, setOpen] = useState({
    auth: true,
    seller: true,
    catalog: true,
    listings: true,
    orders: false,
    reports: false,
    feeds: false,
    fulfillment: false,
    notifications: false,
    settings: false,
  });

  const toggle = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Amazon SP-API</h2>

      <NavLink to="/dashboard" end className="sidebar-link">
        <FiGrid />
        <span>Dashboard Overview</span>
      </NavLink>

      {/* Authentication */}
      <div className="sidebar-section" onClick={() => toggle("auth")}>
        <span>Authentication</span>
        {open.auth ? <FiChevronDown /> : <FiChevronRight />}
      </div>
      {open.auth && (
        <div className="submenu">
          <NavLink to="/generate-token" className="sidebar-link">
            <FiKey />
            <span>Token Generator</span>
          </NavLink>
        </div>
      )}

      {/* Seller & Catalog */}
      <div className="sidebar-section" onClick={() => toggle("catalog")}>
        <span>Seller & Catalog</span>
        {open.catalog ? <FiChevronDown /> : <FiChevronRight />}
      </div>
    {open.catalog && (
  <div className="submenu">

    <NavLink to="/marketplace" className="sidebar-link">
      <FiGlobe />
      <span>Marketplace Participations</span>
    </NavLink>

    <NavLink to="/catalog/search" className="sidebar-link">
      <FiBook />
      <span>Catalog Item Search</span>
    </NavLink>

    <NavLink to="/catalog/item" className="sidebar-link">
      <FiBook />
      <span>Catalog Item</span>
    </NavLink>

    <NavLink to="/pricing" className="sidebar-link">
      <FiDollarSign />
      <span>Pricing</span>
    </NavLink>

  </div>
)}

      {/* Listings */}
      <div className="sidebar-section" onClick={() => toggle("listings")}>
        <span>Listings</span>
        {open.listings ? <FiChevronDown /> : <FiChevronRight />}
      </div>
      {open.listings && (
        <div className="submenu">
          <NavLink to="/listings/create" className="sidebar-link">
            <FiList />
            <span>Create Listing</span>
          </NavLink>
          <NavLink to="/listings/get" className="sidebar-link">
            <FiList />
            <span>Get Listing</span>
          </NavLink>
          <NavLink to="/listings/update" className="sidebar-link">
            <FiList />
            <span>Update Listing</span>
          </NavLink>
          <NavLink to="/listings/delete" className="sidebar-link">
            <FiList />
            <span>Delete Listing</span>
          </NavLink>
          <NavLink to="/listings/submission" className="sidebar-link">
            <FiList />
            <span>Listing Submission</span>
          </NavLink>
        </div>
      )}

      {/* Orders */}
      <div className="sidebar-section" onClick={() => toggle("orders")}>
        <span>Orders</span>
        {open.orders ? <FiChevronDown /> : <FiChevronRight />}
      </div>
      {open.orders && (
        <div className="submenu">
          <NavLink to="/orders" className="sidebar-link">
            <FiShoppingCart />
            <span>Get Orders</span>
          </NavLink>
        </div>
      )}

      {/* Fulfillment */}
    {/* Shipping */}
<div className="sidebar-section" onClick={() => toggle("shipping")}>
  <span>Shipping</span>
  {open.shipping ? <FiChevronDown /> : <FiChevronRight />}
</div>

{open.shipping && (
  <div className="submenu">
    <NavLink to="/shipping" className="sidebar-link">
      <FiTruck />
      <span>Overview</span>
    </NavLink>

    <NavLink to="/shipping/get-rates" className="sidebar-link">
      <FiTruck />
      <span>Get Rates</span>
    </NavLink>

    <NavLink to="/shipping/purchase-label" className="sidebar-link">
      <FiTruck />
      <span>Purchase Label</span>
    </NavLink>

    <NavLink to="/shipping/tracking" className="sidebar-link">
      <FiTruck />
      <span>Tracking Details</span>
    </NavLink>
  </div>
)}
{/* Messaging */}
<div className="sidebar-section" onClick={() => toggle("messaging")}>
  <span>Messaging</span>
  {open.messaging ? <FiChevronDown /> : <FiChevronRight />}
</div>

{open.messaging && (
  <div className="submenu">
    <NavLink to="/messaging" className="sidebar-link">
      <FiMessageSquare />
      <span>Overview</span>
    </NavLink>

    <NavLink to="/messaging/templates" className="sidebar-link">
      <FiMessageSquare />
      <span>Message Templates</span>
    </NavLink>

    <NavLink to="/messaging/send" className="sidebar-link">
      <FiMessageSquare />
      <span>Send Message</span>
    </NavLink>
  </div>
)}
      {/* Reports */}
      <div className="sidebar-section" onClick={() => toggle("reports")}>
        <span>Reports</span>
        {open.reports ? <FiChevronDown /> : <FiChevronRight />}
      </div>
      {open.reports && (
        <div className="submenu">
          <NavLink to="/reports/create" className="sidebar-link">
            <FiFileText />
            <span>Create Report</span>
          </NavLink>
          <NavLink to="/reports/get" className="sidebar-link">
            <FiFileText />
            <span>Get Report</span>
          </NavLink>
        </div>
      )}

      {/* Feeds & Uploads */}
      <div className="sidebar-section" onClick={() => toggle("feeds")}>
        <span>Feeds & Uploads</span>
        {open.feeds ? <FiChevronDown /> : <FiChevronRight />}
      </div>
      {open.feeds && (
        <div className="submenu">
          <NavLink to="/feeds/create-document" className="sidebar-link">
            <FiUpload />
            <span>Create Feed Document</span>
          </NavLink>
          <NavLink to="/feeds/create" className="sidebar-link">
            <FiUpload />
            <span>Create Feed</span>
          </NavLink>
          <NavLink to="/feeds/get" className="sidebar-link">
            <FiUpload />
            <span>Get Feed</span>
          </NavLink>
        </div>
      )}

      {/* Settings */}
      <div className="sidebar-section" onClick={() => toggle("settings")}>
        <span>Settings</span>
        {open.settings ? <FiChevronDown /> : <FiChevronRight />}
      </div>
      {open.settings && (
        <div className="submenu">
          <NavLink to="/settings" className="sidebar-link">
            <FiSettings />
            <span>Global Settings</span>
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default Sidebar;