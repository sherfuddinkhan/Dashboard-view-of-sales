import React, { useEffect, useMemo, useState } from "react";
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
  Package,
  Database,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./SellerCustomerlist.css";

const NODE_API = "http://localhost:5000/api";

/* =========================================================
   HELPERS
========================================================= */

const formatLabel = (key) => {
  if (!key) return "";

  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const flattenObject = (obj, prefix = "") => {
  const result = {};

  Object.entries(obj || {}).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (isObject(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else if (Array.isArray(value)) {
      result[fullKey] = value;
    } else {
      result[fullKey] = value;
    }
  });

  return result;
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

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SellerCustomerlist = ({ marketplace: propMarketplace }) => {
  const navigate = useNavigate();

  const {
    marketplace: paramMarketplace,
    sellerId,
    customerId
  } = useParams();

  const marketplace =
    propMarketplace ||
    paramMarketplace ||
    "amazon";

  const [customerData, setCustomerData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("info");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  /* =========================================================
     FETCH CUSTOMER
  ========================================================= */

  const fetchCustomer = async () => {
    if (!sellerId || !customerId) {
      setError("Seller ID and Customer ID are required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const url =
        `${NODE_API}/seller-customer/${sellerId}/customers/${customerId}`;

      const response = await fetch(url);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Unable to load customer profile."
        );
      }

      const raw = result?.data ?? result;

      setCustomerData(raw);
      setFormData(raw);

    } catch (err) {
      setError(
        err?.message ||
        "Failed to load customer profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [sellerId, customerId, marketplace]);

  /* =========================================================
     TOP LEVEL SCALAR FIELDS
  ========================================================= */

  const scalarFields = useMemo(() => {
    if (!formData) return [];

    return Object.keys(formData).filter(
      (key) =>
        !Array.isArray(formData[key]) &&
        !isObject(formData[key])
    );
  }, [formData]);

  /* =========================================================
     PROFILE FIELD GROUPS
  ========================================================= */

  const identifierKeys = useMemo(() => {
    return scalarFields.filter((key) => {
      const lower = key.toLowerCase();

      return (
        lower.includes("id") ||
        lower.includes("code") ||
        lower.includes("name")
      );
    });
  }, [scalarFields]);

  const contactKeys = useMemo(() => {
    return scalarFields.filter((key) => {
      const lower = key.toLowerCase();

      return (
        lower.includes("email") ||
        lower.includes("phone") ||
        lower.includes("mobile") ||
        lower.includes("contact") ||
        lower.includes("gst")
      );
    });
  }, [scalarFields]);

  const locationKeys = useMemo(() => {
    return scalarFields.filter((key) => {
      const lower = key.toLowerCase();

      return (
        lower.includes("city") ||
        lower.includes("state") ||
        lower.includes("country") ||
        lower.includes("address") ||
        lower.includes("postal") ||
        lower.includes("floor") ||
        lower.includes("location") ||
        lower.includes("building")
      );
    });
  }, [scalarFields]);

  const remainingKeys = useMemo(() => {
    return scalarFields.filter(
      (key) =>
        !identifierKeys.includes(key) &&
        !contactKeys.includes(key) &&
        !locationKeys.includes(key) &&
        key !== "isActive"
    );
  }, [
    scalarFields,
    identifierKeys,
    contactKeys,
    locationKeys
  ]);

  /* =========================================================
     DATASETS
  ========================================================= */

  const dataSections = useMemo(() => {
    if (!customerData) return [];

    const sections = [];

    const processObject = (
      obj,
      parentPath = ""
    ) => {
      Object.entries(obj || {}).forEach(
        ([key, value]) => {

          const currentPath = parentPath
            ? `${parentPath}.${key}`
            : key;

          if (Array.isArray(value)) {

            sections.push({
              key: currentPath,
              title: formatLabel(key),
              path: currentPath,
              data: value,
              parent: parentPath
            });

          } else if (isObject(value)) {

            processObject(
              value,
              currentPath
            );
          }
        }
      );
    };

    processObject(customerData);

    return sections;
  }, [customerData]);

  /* =========================================================
     SEARCH DATASETS
  ========================================================= */

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return dataSections;
    }

    const query =
      searchQuery.toLowerCase();

    return dataSections
      .map((section) => {

        const filtered = section.data.filter(
          (item) => {

            const flattened =
              flattenObject(item);

            return Object.values(flattened)
              .some((value) =>
                formatValue(value)
                  .toLowerCase()
                  .includes(query)
              );
          }
        );

        return {
          ...section,
          data: filtered
        };
      })
      .filter(
        (section) =>
          section.data.length > 0 ||
          section.title
            .toLowerCase()
            .includes(query)
      );

  }, [dataSections, searchQuery]);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleInputChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  };

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    if (marketplace === "mystore") {
      navigate("/mystore/sellers");
    } else {
      navigate(
        `/marketplaces/${marketplace}/sellers`
      );
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="scl-page-container scl-centered-layout">

        <div className="scl-card scl-center-card scl-pulse-glow">

          <RefreshCw
            size={44}
            className="scl-spin scl-accent-glow-icon"
          />

          <h2 className="scl-loading-title">
            Loading {marketplace} Customer Profile...
          </h2>

          <p className="scl-subtext">
            Seller:
            <span className="scl-chip">
              {sellerId}
            </span>

            {" | "}

            Customer:
            <span className="scl-chip">
              {customerId}
            </span>
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !customerData) {
    return (
      <div className="scl-page-container scl-centered-layout">

        <div className="scl-card scl-center-card scl-error-card">

          <XCircle
            size={52}
            className="scl-error-icon"
          />

          <h2>
            Unable to Load Records
          </h2>

          <p>
            {error ||
              "No customer account matches the provided credentials."}
          </p>

          <button
            className="scl-btn scl-btn-gradient"
            onClick={fetchCustomer}
          >
            <RefreshCw size={18} />
            Retry Connection
          </button>

        </div>

      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="scl-page-container scl-centered-layout">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="scl-header-banner">

        <div className="scl-header-left">

          <button
            className="scl-btn-back"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />

            Back to {marketplace}
          </button>

          <div className="scl-title-block">

            <div className="scl-title-row">

              <h1 className="scl-title">
                {customerData.customerName ||
                  "Customer Record"}
              </h1>

              <span
                className={`scl-status-pill-lg ${
                  formData.isActive
                    ? "active"
                    : "inactive"
                }`}
              >

                {formData.isActive ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <XCircle size={16} />
                )}

                {formData.isActive
                  ? "Active Account"
                  : "Inactive"}

              </span>

            </div>

            <span
              className="scl-subtitle"
              style={{
                textTransform: "capitalize"
              }}
            >
              {marketplace} -
              Seller Customer Management Console
            </span>

          </div>

        </div>

        <div className="scl-header-badges">

          <div className="scl-badge-card">
            <span className="scl-badge-label">
              MARKETPLACE
            </span>

            <span
              className="scl-badge-val"
              style={{
                textTransform: "uppercase"
              }}
            >
              {marketplace}
            </span>
          </div>

          <div className="scl-badge-card">
            <span className="scl-badge-label">
              SELLER ID
            </span>

            <span className="scl-badge-val">
              {sellerId}
            </span>
          </div>

          <div className="scl-badge-card">
            <span className="scl-badge-label">
              CUSTOMER ID
            </span>

            <span className="scl-badge-val">
              {customerId}
            </span>
          </div>

          <div className="scl-badge-card">
            <span className="scl-badge-label">
              DATASETS
            </span>

            <span className="scl-badge-val">
              {dataSections.length}
            </span>
          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="scl-card scl-main-card">

        {/* ===================================================
            TABS
        =================================================== */}

        <div className="scl-tabs-header scl-tabs-centered">

          <button
            className={`scl-tab ${
              activeTab === "info"
                ? "active indigo"
                : ""
            }`}
            onClick={() =>
              setActiveTab("info")
            }
          >
            <User size={20} />

            Customer Profile

            <span className="scl-tab-count">
              {scalarFields.length}
            </span>

          </button>

          <button
            className={`scl-tab ${
              activeTab === "data"
                ? "active emerald"
                : ""
            }`}
            onClick={() =>
              setActiveTab("data")
            }
          >
            <Database size={20} />

            All API Datasets

            <span className="scl-tab-count">
              {dataSections.length}
            </span>

          </button>

        </div>

        {/* ===================================================
            PROFILE
        =================================================== */}

        {activeTab === "info" && (

          <div className="scl-tab-content">

            <div className="scl-form-top-bar">

              <div>
                <h2>
                  Customer Overview & Attributes
                </h2>

                <p>
                  Every top-level customer field
                  returned by SellerCustomer API
                </p>
              </div>

              <button
                className={`scl-btn ${
                  isEditing
                    ? "scl-btn-save"
                    : "scl-btn-edit"
                }`}
                onClick={() =>
                  setIsEditing(!isEditing)
                }
              >

                {isEditing ? (
                  <Save size={18} />
                ) : (
                  <Edit3 size={18} />
                )}

                {isEditing
                  ? "Save Configuration"
                  : "Edit Profile"}

              </button>

            </div>

            {/* IDENTIFIERS */}

            {identifierKeys.length > 0 && (

              <ProfileSection
                title="Account & System Identifiers"
                icon={<ShieldCheck size={22} />}
                theme="indigo"
                fields={identifierKeys}
                formData={formData}
                handleInputChange={
                  handleInputChange
                }
                isEditing={isEditing}
              />

            )}

            {/* CONTACT */}

            {contactKeys.length > 0 && (

              <ProfileSection
                title="Contact & Communication Information"
                icon={<User size={22} />}
                theme="emerald"
                fields={contactKeys}
                formData={formData}
                handleInputChange={
                  handleInputChange
                }
                isEditing={isEditing}
              />

            )}

            {/* LOCATION */}

            {locationKeys.length > 0 && (

              <ProfileSection
                title="Address & Location Details"
                icon={<Globe size={22} />}
                theme="purple"
                fields={locationKeys}
                formData={formData}
                handleInputChange={
                  handleInputChange
                }
                isEditing={isEditing}
              />

            )}

            {/* OTHER FIELDS */}

            {remainingKeys.length > 0 && (

              <ProfileSection
                title="Extended Customer Attributes"
                icon={<Layers size={22} />}
                theme="amber"
                fields={remainingKeys}
                formData={formData}
                handleInputChange={
                  handleInputChange
                }
                isEditing={isEditing}
              />

            )}

            {/* ACTIVE */}

            <div className="scl-section-box scl-theme-cyan-box">

              <div className="scl-section-header">

                <CheckCircle2
                  size={22}
                  className="scl-section-icon"
                />

                <h3>
                  Account Status
                </h3>

              </div>

              <div className="scl-form-grid-3col">

                <FormInput
                  label="Active"
                  value={
                    formData.isActive
                      ? "Yes"
                      : "No"
                  }
                  disabled={true}
                  themeClass="theme-cyan-input"
                />

              </div>

            </div>

          </div>

        )}

        {/* ===================================================
            ALL DATASETS
        =================================================== */}

        {activeTab === "data" && (

          <div className="scl-tab-content">

            <div className="scl-form-top-bar">

              <div>
                <h2>
                  Complete API Dataset Explorer
                </h2>

                <p>
                  All arrays and nested transaction
                  datasets returned by the API
                </p>
              </div>

              <div className="scl-dataset-summary">

                <Database size={18} />

                {dataSections.length}
                {" "}
                Dataset Groups

              </div>

            </div>

            {/* SEARCH */}

            <div className="scl-filter-bar scl-center-search">

              <div className="scl-search-input-box">

                <Search
                  size={20}
                  className="scl-search-icon"
                />

                <input
                  type="text"
                  placeholder="Search across every API field..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* DATASET LIST */}

            <div className="scl-subtypes-centered-container">

              {filteredSections.length === 0 ? (

                <div className="scl-empty-state">

                  <Search size={40} />

                  <h3>
                    No matching API records
                  </h3>

                  <p>
                    Try another search value.
                  </p>

                </div>

              ) : (

                filteredSections.map(
                  (section, index) => (

                    <div
                      key={section.key}
                      className="scl-focused-subtype-wrapper"
                    >

                      <SubSectionView
                        title={
                          section.parent
                            ? `${formatLabel(
                                section.parent
                              )} → ${section.title}`
                            : section.title
                        }
                        count={
                          section.data.length
                        }
                        data={section.data}
                        searchQuery={
                          searchQuery
                        }
                        colorTheme={
                          COLOR_PALETTE[
                            index %
                              COLOR_PALETTE.length
                          ]
                        }
                        path={section.path}
                      />

                    </div>

                  )
                )

              )}

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

/* =========================================================
   PROFILE SECTION
========================================================= */

const ProfileSection = ({
  title,
  icon,
  theme,
  fields,
  formData,
  handleInputChange,
  isEditing
}) => {

  return (
    <div
      className={`scl-section-box scl-theme-${theme}-box`}
    >

      <div className="scl-section-header">

        <span className="scl-section-icon">
          {icon}
        </span>

        <h3>
          {title}
        </h3>

      </div>

      <div className="scl-form-grid-3col">

        {fields.map((key) => (

          <FormInput
            key={key}
            label={formatLabel(key)}
            name={key}
            value={formData[key]}
            onChange={handleInputChange}
            disabled={
              !isEditing ||
              key.toLowerCase().includes("id")
            }
            themeClass={
              `theme-${theme}-input`
            }
          />

        ))}

      </div>

    </div>
  );
};

/* =========================================================
   DATASET COMPONENT
========================================================= */

const SubSectionView = ({
  title,
  count,
  data,
  searchQuery,
  colorTheme,
  path
}) => {

  const [expanded, setExpanded] =
    useState(true);

  const filteredData = data.filter(
    (item) => {

      if (!searchQuery) {
        return true;
      }

      const flat =
        flattenObject(item);

      return Object.values(flat)
        .some((value) =>
          formatValue(value)
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
        );
    }
  );

  return (
    <div
      className={`scl-subtype-card ${colorTheme}`}
    >

      {/* HEADER */}

      <div
        className="scl-subtype-card-header"
        onClick={() =>
          setExpanded(!expanded)
        }
        style={{
          cursor: "pointer"
        }}
      >

        <div className="scl-subtype-header-left">

          {expanded ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}

          <Package
            size={24}
            className="scl-subtype-icon"
          />

          <div>

            <h2 className="scl-subtype-title">
              {title}
            </h2>

            <small>
              {path}
            </small>

          </div>

          <span className="scl-subtype-badge">
            {count} Items
          </span>

        </div>

      </div>

      {/* BODY */}

      {expanded && (

        <div className="scl-subtype-card-body">

          {filteredData.length === 0 ? (

            <div className="scl-empty-state">

              <Search size={32} />

              <p>
                No records matching
                {" "}
                "{searchQuery}"
              </p>

            </div>

          ) : (

            filteredData.map(
              (item, itemIdx) => (

                <DatasetRecord
                  key={itemIdx}
                  item={item}
                  itemIdx={itemIdx}
                  colorTheme={colorTheme}
                />

              )
            )

          )}

        </div>

      )}

    </div>
  );
};

/* =========================================================
   DATASET RECORD
========================================================= */

const DatasetRecord = ({
  item,
  itemIdx,
  colorTheme
}) => {

  const [expanded, setExpanded] =
    useState(true);

  const flattened =
    flattenObject(item);

  return (
    <div className="scl-item-record-box">

      <div
        className="scl-item-record-tag"
        onClick={() =>
          setExpanded(!expanded)
        }
        style={{
          cursor: "pointer"
        }}
      >

        {expanded ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronRight size={16} />
        )}

        Record #{itemIdx + 1}

        <span>
          {Object.keys(flattened).length}
          {" "}
          Fields
        </span>

      </div>

      {expanded && (

        <div className="scl-form-grid-3col">

          {Object.entries(flattened).map(
            ([key, value]) => {

              /*
               * Arrays inside an individual record
               * such as Product.packages are also displayed.
               */

              if (Array.isArray(value)) {

                return (
                  <NestedArrayField
                    key={key}
                    label={key}
                    value={value}
                    colorTheme={colorTheme}
                  />
                );
              }

              return (
                <FormInput
                  key={key}
                  label={formatLabel(
                    key
                      .split(".")
                      .pop()
                  )}
                  value={value}
                  disabled={true}
                  themeClass={
                    `${colorTheme}-input`
                  }
                />
              );
            }
          )}

        </div>

      )}

    </div>
  );
};

/* =========================================================
   NESTED ARRAY FIELD
========================================================= */

const NestedArrayField = ({
  label,
  value,
  colorTheme
}) => {

  return (
    <div
      className="scl-input-group span-wide"
    >

      <label className="scl-label">

        {formatLabel(
          label.split(".").pop()
        )}

        {" "}
        ({value.length} Items)

      </label>

      <div
        className={`scl-textbox-wrapper ${colorTheme}-input`}
        style={{
          padding: "12px"
        }}
      >

        {value.map(
          (nestedItem, index) => {

            if (
              isObject(nestedItem)
            ) {

              return (
                <div
                  key={index}
                  style={{
                    marginBottom:
                      "12px",
                    padding:
                      "12px",
                    border:
                      "1px solid rgba(0,0,0,.08)",
                    borderRadius:
                      "8px"
                  }}
                >

                  <strong>
                    Item #{index + 1}
                  </strong>

                  <div
                    className="scl-form-grid-3col"
                    style={{
                      marginTop:
                        "10px"
                    }}
                  >

                    {Object.entries(
                      flattenObject(
                        nestedItem
                      )
                    ).map(
                      ([
                        nestedKey,
                        nestedValue
                      ]) => (

                        <FormInput
                          key={
                            nestedKey
                          }
                          label={formatLabel(
                            nestedKey
                              .split(".")
                              .pop()
                          )}
                          value={
                            nestedValue
                          }
                          disabled={
                            true
                          }
                          themeClass={
                            `${colorTheme}-input`
                          }
                        />

                      )
                    )}

                  </div>

                </div>
              );

            }

            return (
              <div
                key={index}
                style={{
                  padding:
                    "6px 0"
                }}
              >
                {formatValue(
                  nestedItem
                )}
              </div>
            );
          }
        )}

      </div>

    </div>
  );
};

/* =========================================================
   FORM INPUT
========================================================= */

const FormInput = ({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  name,
  themeClass
}) => {

  const strVal =
    value === null ||
    value === undefined
      ? ""
      : formatValue(value);

  const isLong =
    strVal.length > 45 ||
    strVal.includes("\n");

  return (
    <div
      className={`scl-input-group ${
        isLong ? "span-wide" : ""
      }`}
    >

      <label className="scl-label">
        {label}
      </label>

      <div
        className={`scl-textbox-wrapper ${
          themeClass || ""
        } ${
          disabled ? "disabled" : ""
        }`}
      >

        {isLong ? (

          <textarea
            name={name}
            value={strVal}
            onChange={onChange}
            disabled={disabled}
            className="scl-textbox scl-textarea"
            rows={3}
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
