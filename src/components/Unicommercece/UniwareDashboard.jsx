import React from "react";
import { Link } from "react-router-dom";

export default function UniwareDashboard() {
  const stats = [
    { label: "FULFILLMENT", count: 32, color: "#8b5cf6", icon: "📦" },
    { label: "SALE ORDER", count: 18, color: "#ec4899", icon: "🛒" },
    { label: "RETURNS", count: 11, color: "#ef4444", icon: "↩️" },
    { label: "INBOUND / PO", count: 14, color: "#06b6d4", icon: "📥" },
    { label: "INVENTORY", count: 6, color: "#84cc16", icon: "📊" },
    { label: "OUTBOUND / GATEPASS", count: 9, color: "#f97316", icon: "🚪" },
    { label: "PRODUCT", count: 7, color: "#a855f7", icon: "🏷️" },
    { label: "AUTH + FACILITY + EXPORT", count: 6, color: "#10b981", icon: "🏢" },
  ];
  const total = stats.reduce((a,b)=>a+b.count,0);

  return (
    <div style={{ padding: 24, background: "#f3f4f6", minHeight: "100%" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Dashboard - All {total}+ APIs</h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 13 }}>
          Your VS Code folders are loaded. Use left vertical sidebar to open/close each module. Total {total} routes mapped.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          {stats.map(s=>(
            <span key={s.label} style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30`, padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              {s.icon} {s.label}: {s.count}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {stats.map(s=>(
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: 16, border: `1px solid ${s.color}25`, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: s.color }}>{s.count} APIs</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Click sidebar to open</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>How vertical open/close works:</h3>
        <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
          <li>Left sidebar = vertical menu with 8 sections</li>
          <li>Click any header like <b>📦 FULFILLMENT 32 ▶</b> → it opens, shows child routes</li>
          <li>Click again → collapses</li>
          <li>Top button <b>◀</b> collapses entire sidebar to icons</li>
          <li>Blue highlight = active route</li>
          <li>Logout at bottom end of sidebar</li>
        </ul>
      </div>
    </div>
  );
}

