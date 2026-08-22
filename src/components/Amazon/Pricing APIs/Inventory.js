import React, { useState } from "react";
import axios from "axios";

const MARKETPLACES = [
  { id: "A21TJRUUN4KGV", name: "India (IN)" },
  { id: "ATVPDKIKX0DER", name: "United States (US)" },
  { id: "A1F83G8C2ARO7P", name: "United Kingdom (UK)" },
  { id: "A1PA6795UKMFR9", name: "Germany (DE)" }
];

const Inventory = () => {
  // Group configuration settings
  const [settings, setSettings] = useState({
    marketplaceId: "A21TJRUUN4KGV",
    details: true
  });

  // Track operational values inside a unified state block
  const [uiState, setUiState] = useState({
    loading: false,
    error: "",
    summary: null,
    inventory: []
  });

  const handleSettingChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const getInventory = async (e) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await axios.get("http://localhost:5000/api/inventory", {
        params: {
          marketplaceId: settings.marketplaceId,
          details: settings.details
        }
      });

      setUiState({
        loading: false,
        error: "",
        summary: response.data.summary || null,
        inventory: response.data.inventory || []
      });
    } catch (err) {

    console.log("Axios Error:", err);

    console.log("Response:", err.response);

    console.log("Response Data:", err.response?.data);

    console.log("Status:", err.response?.status);

    const msg =
        err.response?.data?.error ||
        err.message ||
        "Unknown Error";

    setUiState({
        loading: false,
        error: msg,
        summary: null,
        inventory: []
    });

}
  };

  const { loading, error, summary, inventory } = uiState;

  return (
    <div style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1.5rem", fontFamily: "system-ui, sans-serif", color: "#333" }}>
      
      {/* Header Panel */}
      <header style={{ display: "flex", justifyContent: "between", alignItems: "center", borderBottom: "1px solid #eaeaea", paddingBottom: "1rem", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700", color: "#111" }}>Amazon Inventory Control</h2>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "0.875rem" }}>Monitor regional FBA stock layers and fulfillment statuses</p>
        </div>
      </header>

      {/* Settings Form Strip */}
      <form onSubmit={getInventory} style={{ background: "#f9f9f9", padding: "1.25rem", borderRadius: "8px", border: "1px solid #eee", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          
          <div style={{ flex: "1", minWidth: "220px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>Target Marketplace</label>
            <select
              value={settings.marketplaceId}
              onChange={(e) => handleSettingChange("marketplaceId", e.target.value)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", fontSize: "0.95rem" }}
            >
              {MARKETPLACES.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div style={{ width: "140px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>Include Details</label>
            <select
              value={settings.details ? "true" : "false"}
              onChange={(e) => handleSettingChange("details", e.target.value === "true")}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", fontSize: "0.95rem" }}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.6rem 1.75rem",
              borderRadius: "6px",
              border: "none",
              background: loading ? "#a0aec0" : "#2563eb",
              color: "#fff",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              fontSize: "0.95rem"
            }}
          >
            {loading ? "Fetching Stock..." : "Pull Inventory"}
          </button>
        </div>
      </form>

      {/* Live System Feedback */}
      {error && (
        <div style={{ padding: "1rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#991b1b", marginBottom: "2rem", fontSize: "0.95rem" }}>
          ⚠️ <strong>Operational Error:</strong> {error}
        </div>
      )}

      {/* Aggregate Metric Highlights */}
      {summary && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", margin: "0 0 1rem 0", color: "#444" }}>Global Level Aggregates</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Available", val: summary.available, color: "#2563eb" },
              { label: "Reserved", val: summary.reserved, color: "#d97706" },
              { label: "Inbound", val: summary.inbound, color: "#059669" },
              { label: "Researching", val: summary.researching, color: "#7c3aed" },
              { label: "Unfulfillable", val: summary.unfulfillable, color: "#dc2626" }
            ].map((card, idx) => (
              <div key={idx} style={{ padding: "1.25rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", borderTop: `4px solid ${card.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", tracking: "wider", color: "#6b7280", fontWeight: "600" }}>{card.label}</span>
                <div style={{ fontSize: "1.75rem", fontWeight: "700", marginTop: "4px", color: "#111" }}>{card.val ?? 0}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabular Item Breakdown */}
      {inventory.length > 0 && (
        <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "1rem 1.25rem", background: "#fcfcfc", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "1.05rem", margin: 0, fontWeight: "600" }}>ASIN / SKU Item Breakdown</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left", color: "#4b5563" }}>
                  {["ASIN", "SKU", "Condition", "Available", "Reserved", "Inbound", "Researching", "Unfulfillable"].map((h) => (
                    <th key={h} style={{ padding: "0.85rem 1.25rem", fontWeight: "600" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: idx !== inventory.length - 1 ? "1px solid #f3f4f6" : "none", transition: "background 0.15s" }}>
                    <td style={{ padding: "0.85rem 1.25rem", fontFamily: "monospace", color: "#2563eb", fontWeight: "600" }}>{item.asin}</td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#4b5563" }}>{item.sku}</td>
                    <td style={{ padding: "0.85rem 1.25rem" }}><span style={{ fontSize: "0.8rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", textTransform: "capitalize" }}>{item.condition}</span></td>
                    <td style={{ padding: "0.85rem 1.25rem", fontWeight: "600" }}>{item.available}</td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#d97706" }}>{item.reserved}</td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#059669" }}>{item.inbound}</td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#7c3aed" }}>{item.researching}</td>
                    <td style={{ padding: "0.85rem 1.25rem", color: "#dc2626" }}>{item.unfulfillable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Fallback empty view */}
      {!loading && !inventory.length && !error && (
        <div style={{ textAlign: "center", padding: "4rem 2rem", border: "2px dashed #e5e7eb", borderRadius: "8px", color: "#9ca3af" }}>
          <p style={{ margin: 0, fontSize: "1.1rem" }}>No current marketplace inventory pulled.</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>Select parameters above to parse live catalog allocations.</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;