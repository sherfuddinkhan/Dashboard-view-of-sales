import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Boxes,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Globe,
  Layers,
  Edit3,
  Save,
  Package
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./SellerCustomerlist.css";

const formatLabel = (key) => {
  if (!key) return "";
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const flattenObject = (obj, prefix = "") => {
  return Object.keys(obj || {}).reduce((acc, k) => {
    const pre = prefix ? `${prefix}.` : "";
    if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

const COLOR_PALETTE = [
  "theme-indigo",
  "theme-emerald",
  "theme-purple",
  "theme-amber",
  "theme-rose",
  "theme-cyan",
  "theme-teal",
  "theme-orange"
];

const SellerCustomerlist = () => {
  const navigate = useNavigate();
  const { sellerId, customerId } = useParams();

  const [customerData, setCustomerData] = useState(null);
  const [formData, setFormData] = useState({});
  const [dataSections, setDataSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("info");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchCustomer = async () => {
    if (!sellerId || !customerId) {
      setError("Seller ID and Customer ID are required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const url = `http://localhost:5000/api/seller-customer/${sellerId}/customers/${customerId}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load customer profile.");
      }

      const rawData = result.data ?? result;
      parseAndStructureData(rawData);
    } catch (err) {
      setError(err.message || "Failed to load customer profile.");
    } finally {
      setLoading(false);
    }
  };

  const parseAndStructureData = (raw) => {
    setCustomerData(raw);
    setFormData(raw);

    const dynamicSections = [];

    const extractArrays = (sourceObj, parentKey = "") => {
      Object.keys(sourceObj || {}).forEach((key) => {
        const val = sourceObj[key];
        const sectionKey = parentKey ? `${parentKey}_${key}` : key;

        if (Array.isArray(val) && val.length > 0) {
          dynamicSections.push({
            key: sectionKey,
            rawKey: key,
            title: formatLabel(key),
            data: val
          });
        } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
          extractArrays(val, key);
        }
      });
    };

    extractArrays(raw);
    setDataSections(dynamicSections);
  };

  useEffect(() => {
    fetchCustomer();
  }, [sellerId, customerId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="scl-page-container scl-centered-layout">
        <div className="scl-card scl-center-card scl-pulse-glow">
          <RefreshCw size={44} className="scl-spin scl-accent-glow-icon" />
          <h2 className="scl-loading-title">Loading Customer Profile...</h2>
          <p className="scl-subtext">
            Seller: <span className="scl-chip">{sellerId}</span> | Customer: <span className="scl-chip">{customerId}</span>
          </p>
        </div>
      </div>
    );
  }

  if (error || !customerData) {
    return (
      <div className="scl-page-container scl-centered-layout">
        <div className="scl-card scl-center-card scl-error-card">
          <XCircle size={52} className="scl-error-icon" />
          <h2>Unable to Load Records</h2>
          <p>{error || "No customer account matches the provided credentials."}</p>
          <button className="scl-btn scl-btn-gradient" onClick={fetchCustomer}>
            <RefreshCw size={18} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const scalarFields = Object.keys(formData).filter(
    (k) => typeof formData[k] !== "object" && k !== "isActive"
  );

  const identifierKeys = scalarFields.filter((k) => k.toLowerCase().includes("id") || k.toLowerCase().includes("code") || k.toLowerCase().includes("name"));
  const contactKeys = scalarFields.filter((k) => k.toLowerCase().includes("email") || k.toLowerCase().includes("phone") || k.toLowerCase().includes("contact") || k.toLowerCase().includes("gst"));
  const locationKeys = scalarFields.filter((k) => k.toLowerCase().includes("city") || k.toLowerCase().includes("state") || k.toLowerCase().includes("country") || k.toLowerCase().includes("address") || k.toLowerCase().includes("postal"));
  const remainingKeys = scalarFields.filter((k) => !identifierKeys.includes(k) && !contactKeys.includes(k) && !locationKeys.includes(k));

  return (
    <div className="scl-page-container scl-centered-layout">
      {/* Top Banner Header */}
      <div className="scl-header-banner">
        <div className="scl-header-left">
          <button className="scl-btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="scl-title-block">
            <div className="scl-title-row">
              <h1 className="scl-title">{customerData.customerName || "Customer Record"}</h1>
              <span className={`scl-status-pill-lg ${formData.isActive ? "active" : "inactive"}`}>
                {formData.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {formData.isActive ? "Active Account" : "Inactive"}
              </span>
            </div>
            <span className="scl-subtitle">Seller Customer Management Console</span>
          </div>
        </div>

        <div className="scl-header-badges">
          <div className="scl-badge-card">
            <span className="scl-badge-label">SELLER ID</span>
            <span className="scl-badge-val">{sellerId}</span>
          </div>
          <div className="scl-badge-card">
            <span className="scl-badge-label">CUSTOMER ID</span>
            <span className="scl-badge-val">{customerId}</span>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="scl-card scl-main-card">
        {/* Navigation Tabs */}
        <div className="scl-tabs-header scl-tabs-centered">
          <button
            className={`scl-tab ${activeTab === "info" ? "active indigo" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <User size={20} /> Profile Details ({scalarFields.length})
          </button>
          <button
            className={`scl-tab ${activeTab === "data" ? "active emerald" : ""}`}
            onClick={() => setActiveTab("data")}
          >
            <Boxes size={20} /> Datasets & Sub-Types ({dataSections.length})
          </button>
        </div>

        {activeTab === "info" ? (
          <div className="scl-tab-content">
            <div className="scl-form-top-bar">
              <div>
                <h2>Customer Overview & Attributes</h2>
                <p>System attributes mapped from backend payload</p>
              </div>
              <button
                className={`scl-btn ${isEditing ? "scl-btn-save" : "scl-btn-edit"}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                {isEditing ? "Save Configuration" : "Edit Profile"}
              </button>
            </div>

            {identifierKeys.length > 0 && (
              <div className="scl-section-box scl-theme-indigo-box">
                <div className="scl-section-header">
                  <ShieldCheck size={22} className="scl-section-icon" />
                  <h3>Account & System Identifiers</h3>
                </div>
                <div className="scl-form-grid-3col">
                  {identifierKeys.map((key) => (
                    <FormInput
                      key={key}
                      label={formatLabel(key)}
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      disabled={!isEditing || key.toLowerCase().includes("id")}
                      themeClass="theme-indigo-input"
                    />
                  ))}
                </div>
              </div>
            )}

            {contactKeys.length > 0 && (
              <div className="scl-section-box scl-theme-emerald-box">
                <div className="scl-section-header">
                  <User size={22} className="scl-section-icon" />
                  <h3>Contact & Communication Info</h3>
                </div>
                <div className="scl-form-grid-3col">
                  {contactKeys.map((key) => (
                    <FormInput
                      key={key}
                      label={formatLabel(key)}
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      themeClass="theme-emerald-input"
                    />
                  ))}
                </div>
              </div>
            )}

            {locationKeys.length > 0 && (
              <div className="scl-section-box scl-theme-purple-box">
                <div className="scl-section-header">
                  <Globe size={22} className="scl-section-icon" />
                  <h3>Address & Location Details</h3>
                </div>
                <div className="scl-form-grid-3col">
                  {locationKeys.map((key) => (
                    <FormInput
                      key={key}
                      label={formatLabel(key)}
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      themeClass="theme-purple-input"
                    />
                  ))}
                </div>
              </div>
            )}

            {remainingKeys.length > 0 && (
              <div className="scl-section-box scl-theme-amber-box">
                <div className="scl-section-header">
                  <Layers size={22} className="scl-section-icon" />
                  <h3>Extended Attributes & Metrics</h3>
                </div>
                <div className="scl-form-grid-3col">
                  {remainingKeys.map((key) => (
                    <FormInput
                      key={key}
                      label={formatLabel(key)}
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      themeClass="theme-amber-input"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="scl-tab-content">
            {/* Search Bar */}
            <div className="scl-filter-bar scl-center-search">
              <div className="scl-search-input-box">
                <Search size={20} className="scl-search-icon" />
                <input
                  type="text"
                  placeholder="Search values across all sub-types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Direct Centered Sequence of All Sub-Type Datasets */}
            <div className="scl-subtypes-centered-container">
              {dataSections.map((sec, idx) => (
                <div key={sec.key} className="scl-focused-subtype-wrapper">
                  <SubSectionView
                    title={sec.title}
                    count={sec.data.length}
                    data={sec.data}
                    searchQuery={searchQuery}
                    colorTheme={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* Sub-Type Display Component with 3-Column Layout */
const SubSectionView = ({ title, count, data, searchQuery, colorTheme }) => {
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const flat = flattenObject(item);
    return Object.values(flat).some((val) =>
      String(val ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className={`scl-subtype-card ${colorTheme}`}>
      <div className="scl-subtype-card-header">
        <div className="scl-subtype-header-left">
          <Package size={24} className="scl-subtype-icon" />
          <h2 className="scl-subtype-title">{title}</h2>
          <span className="scl-subtype-badge">{count} Items</span>
        </div>
      </div>

      <div className="scl-subtype-card-body">
        {filteredData.length === 0 ? (
          <div className="scl-empty-state">
            <Search size={32} />
            <p>No records matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredData.map((item, itemIdx) => (
            <div key={itemIdx} className="scl-item-record-box">
              <div className="scl-item-record-tag">Record #{itemIdx + 1}</div>
              <div className="scl-form-grid-3col">
                {Object.entries(flattenObject(item)).map(([key, val]) => (
                  <FormInput
                    key={key}
                    label={formatLabel(key.split(".").pop())}
                    value={val}
                    disabled={true}
                    themeClass={`${colorTheme}-input`}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* Flexible Textbox Form Input Component */
const FormInput = ({ label, value, onChange, disabled, type = "text", name, themeClass }) => {
  const strVal = value === null || value === undefined ? "" : String(value);
  const isLong = strVal.length > 45 || strVal.includes("\n");

  return (
    <div className={`scl-input-group ${isLong ? "span-wide" : ""}`}>
      <label className="scl-label">{label}</label>
      <div className={`scl-textbox-wrapper ${themeClass} ${disabled ? "disabled" : ""}`}>
        {isLong ? (
          <textarea
            name={name}
            value={strVal}
            onChange={onChange}
            disabled={disabled}
            className="scl-textbox scl-textarea"
            rows={2}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={strVal}
            onChange={onChange}
            disabled={disabled}
            className="scl-textbox"
          />
        )}
      </div>
    </div>
  );
};

export default SellerCustomerlist;