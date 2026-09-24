import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetFacilityDetails() {
  const [facilityCode, setFacilityCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [facility, setFacility] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const getFacilityDetails = async (e) => {
    e.preventDefault();

    const code = facilityCode.trim();

    if (!code) {
      setError("Facility code is required.");
      return;
    }

    setLoading(true);
    setError("");
    setFacility(null);
    setResponse(null);

    try {
      const res = await axios.post(
        `${SERVER_URL}/api/uniware/facilities/details`,
        {
          facilityCode: code,
        }
      );

      setResponse(res.data);
      setFacility(res.data?.facility || null);
    } catch (err) {
      const data = err.response?.data;

      setResponse(data || null);

      const apiMessage =
        data?.message ||
        data?.errors?.[0]?.message ||
        data?.errors?.[0]?.description;

      setError(apiMessage || err.message || "Failed to get facility details.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFacilityCode("");
    setFacility(null);
    setResponse(null);
    setError("");
  };

  const renderValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return String(value);
  };

  const renderAddress = (address) => {
    if (!address) {
      return (
        <div style={styles.empty}>
          No address information available.
        </div>
      );
    }

    return (
      <div style={styles.addressGrid}>
        <div>
          <span style={styles.label}>Address Line 1</span>
          <strong>{renderValue(address.addressLine1)}</strong>
        </div>

        <div>
          <span style={styles.label}>Address Line 2</span>
          <strong>{renderValue(address.addressLine2)}</strong>
        </div>

        <div>
          <span style={styles.label}>City</span>
          <strong>{renderValue(address.city)}</strong>
        </div>

        <div>
          <span style={styles.label}>State</span>
          <strong>
            {renderValue(address.stateName)}
            {address.stateCode
              ? ` (${address.stateCode})`
              : ""}
          </strong>
        </div>

        <div>
          <span style={styles.label}>Pincode</span>
          <strong>{renderValue(address.pincode)}</strong>
        </div>

        <div>
          <span style={styles.label}>Country</span>
          <strong>
            {renderValue(address.countryName)}
            {address.countryCode
              ? ` (${address.countryCode})`
              : ""}
          </strong>
        </div>

        <div>
          <span style={styles.label}>Phone</span>
          <strong>{renderValue(address.phone)}</strong>
        </div>

        <div>
          <span style={styles.label}>Email</span>
          <strong>{renderValue(address.email)}</strong>
        </div>

        <div>
          <span style={styles.label}>Enabled</span>
          <strong>{renderValue(address.enabled)}</strong>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Get Facility Details</h1>
          <p style={styles.subtitle}>
            Fetch complete warehouse or facility details from Uniware.
          </p>
        </div>

        <div style={styles.apiBadge}>
          POST /facility/get
        </div>
      </div>

      {/* Search Form */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Facility Lookup</h2>

        <form onSubmit={getFacilityDetails}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Facility Code <span style={styles.required}>*</span>
              </label>

              <input
                type="text"
                value={facilityCode}
                onChange={(e) => setFacilityCode(e.target.value)}
                placeholder="Example: MAIN"
                style={styles.input}
              />

              <small style={styles.helpText}>
                Enter the Uniware facility code.
              </small>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.primaryButton,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Loading..." : "Get Details"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                style={styles.secondaryButton}
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <strong>Request Failed</strong>
          <div style={{ marginTop: 6 }}>{error}</div>
        </div>
      )}

      {/* Facility Details */}
      {facility && (
        <>
          {/* Basic Details */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.cardTitle}>Facility Information</h2>

              <span
                style={{
                  ...styles.statusBadge,
                  background: facility.enabled
                    ? "#dcfce7"
                    : "#fee2e2",
                  color: facility.enabled
                    ? "#166534"
                    : "#991b1b",
                }}
              >
                {facility.enabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>

            <div style={styles.infoGrid}>
              <div>
                <span style={styles.label}>Facility Code</span>
                <strong>{renderValue(facility.code)}</strong>
              </div>

              <div>
                <span style={styles.label}>Display Name</span>
                <strong>{renderValue(facility.displayName)}</strong>
              </div>

              <div>
                <span style={styles.label}>Name</span>
                <strong>{renderValue(facility.name)}</strong>
              </div>

              <div>
                <span style={styles.label}>Alternate Code</span>
                <strong>{renderValue(facility.alternateCode)}</strong>
              </div>

              <div>
                <span style={styles.label}>Type</span>
                <strong>{renderValue(facility.type)}</strong>
              </div>

              <div>
                <span style={styles.label}>Operational Type</span>
                <strong>
                  {renderValue(facility.operationalType)}
                </strong>
              </div>

              <div>
                <span style={styles.label}>PAN</span>
                <strong>{renderValue(facility.pan)}</strong>
              </div>

              <div>
                <span style={styles.label}>GST Number</span>
                <strong>{renderValue(facility.gstNumber)}</strong>
              </div>

              <div>
                <span style={styles.label}>TIN</span>
                <strong>{renderValue(facility.tin)}</strong>
              </div>

              <div>
                <span style={styles.label}>CST Number</span>
                <strong>{renderValue(facility.cstNumber)}</strong>
              </div>

              <div>
                <span style={styles.label}>CIN Number</span>
                <strong>{renderValue(facility.cinNumber)}</strong>
              </div>

              <div>
                <span style={styles.label}>Tax Exempted</span>
                <strong>
                  {renderValue(facility.taxExempted)}
                </strong>
              </div>

              <div>
                <span style={styles.label}>Website</span>
                <strong>{renderValue(facility.website)}</strong>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Billing Address</h2>

            {renderAddress(facility.billingAddress)}
          </div>

          {/* Shipping Address */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Shipping Address</h2>

            {renderAddress(facility.shippingAddress)}
          </div>

          {/* Associated Billing Party */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              Associated Billing Party
            </h2>

            {facility.associatedBillingParty ? (
              <pre style={styles.json}>
                {JSON.stringify(
                  facility.associatedBillingParty,
                  null,
                  2
                )}
              </pre>
            ) : (
              <div style={styles.empty}>
                No associated billing party.
              </div>
            )}
          </div>
        </>
      )}

      {/* Raw Response */}
      {response && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>API Response</h2>

          <div style={styles.responseSummary}>
            <div>
              <span style={styles.label}>Successful</span>
              <strong>
                {response.successful ? "Yes" : "No"}
              </strong>
            </div>

            <div>
              <span style={styles.label}>Message</span>
              <strong>
                {renderValue(response.message)}
              </strong>
            </div>

            <div>
              <span style={styles.label}>Errors</span>
              <strong>
                {response.errors?.length || 0}
              </strong>
            </div>

            <div>
              <span style={styles.label}>Warnings</span>
              <strong>
                {response.warnings?.length || 0}
              </strong>
            </div>
          </div>

          {(response.errors?.length > 0 ||
            response.warnings?.length > 0) && (
            <div style={{ marginTop: 20 }}>
              {response.errors?.map((item, index) => (
                <div
                  key={`error-${index}`}
                  style={styles.errorItem}
                >
                  <strong>
                    Error {item.code ?? index + 1}
                  </strong>

                  <div>
                    {item.message ||
                      item.description ||
                      "Unknown error"}
                  </div>
                </div>
              ))}

              {response.warnings?.map((item, index) => (
                <div
                  key={`warning-${index}`}
                  style={styles.warningItem}
                >
                  <strong>
                    Warning {item.code ?? index + 1}
                  </strong>

                  <div>
                    {item.message ||
                      item.description ||
                      "Warning"}
                  </div>
                </div>
              ))}
            </div>
          )}

          <details style={{ marginTop: 20 }}>
            <summary style={styles.summary}>
              View Raw JSON
            </summary>

            <pre style={styles.json}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  apiBadge: {
    padding: "9px 14px",
    borderRadius: "8px",
    background: "#e2e8f0",
    color: "#334155",
    fontSize: "13px",
    fontFamily: "monospace",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
  },

  cardTitle: {
    margin: "0 0 18px",
    fontSize: "19px",
    color: "#0f172a",
  },

  formRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "16px",
    flexWrap: "wrap",
  },

  formGroup: {
    flex: "1 1 350px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
  },

  required: {
    color: "#dc2626",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
  },

  helpText: {
    display: "block",
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  buttonGroup: {
    display: "flex",
    gap: "10px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "7px",
    padding: "11px 20px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    padding: "11px 20px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "15px 18px",
    borderRadius: "9px",
    marginBottom: "20px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  statusBadge: {
    padding: "6px 11px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  addressGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  responseSummary: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
  },

  empty: {
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "7px",
    color: "#64748b",
    fontSize: "14px",
  },

  errorItem: {
    padding: "12px",
    marginBottom: "8px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    color: "#991b1b",
    fontSize: "13px",
  },

  warningItem: {
    padding: "12px",
    marginBottom: "8px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "7px",
    color: "#92400e",
    fontSize: "13px",
  },

  summary: {
    cursor: "pointer",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "10px",
  },

  json: {
    background: "#0f172a",
    color: "#e2e8f0",
    padding: "16px",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.6,
  },
};

export default GetFacilityDetails;