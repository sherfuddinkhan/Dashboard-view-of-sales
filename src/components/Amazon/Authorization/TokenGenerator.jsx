import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NODE_API = "http://localhost:5000/api";

const TokenGenerator = () => {
  const navigate = useNavigate();

  // ✅ CREDENTIALS LIKE YOUR AmazonTokenGenerator.js - from .env + localStorage
  const [clientId, setClientId] = useState(
    process.env.REACT_APP_AMAZON_CLIENT_ID || localStorage.getItem("amazonClientId") || ""
  );
  const [clientSecret, setClientSecret] = useState(
    process.env.REACT_APP_AMAZON_CLIENT_SECRET || localStorage.getItem("amazonClientSecret") || ""
  );
  const [refreshToken, setRefreshToken] = useState(
    process.env.REACT_APP_AMAZON_REFRESH_TOKEN || localStorage.getItem("amazonRefreshToken") || ""
  );

  const [accessToken, setAccessToken] = useState(localStorage.getItem("amazonAccessToken") || "");
  const [expiresIn, setExpiresIn] = useState(localStorage.getItem("amazonTokenExpiry") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ SAME ENDPOINT LIKE YOUR OLD FILE - http://localhost:5000/api/token
  const generateToken = async () => {
    if (!clientId || !clientSecret || !refreshToken) {
      setError("ClientId, ClientSecret, RefreshToken required - Check .env REACT_APP_AMAZON_...");
      return;
    }

    setLoading(true);
    setError("");
    setAccessToken("");
    setSaveMessage("");
    setSuccess("");

    // Save creds to localStorage like before
    localStorage.setItem("amazonClientId", clientId);
    localStorage.setItem("amazonClientSecret", clientSecret);
    localStorage.setItem("amazonRefreshToken", refreshToken);

    try {
      const response = await axios.post(
        `${NODE_API}/token`,
        {
          clientId,
          clientSecret,
          refreshToken,
        }
      );

      const token = response.data.access_token || response.data.accessToken;
      const expiry = response.data.expires_in || response.data.expiresIn || 3600;

      setAccessToken(token);
      setExpiresIn(expiry);
      setSuccess(`✅ LWA Token Generated - Expires in ${expiry}s - Saved`);

      // =====================================================
      // SAVE AMAZON TOKEN - LIKE YOUR OLD FILE
      // =====================================================
      localStorage.setItem("amazonAccessToken", token);
      localStorage.setItem("accessToken", token); // For CreateListing
      localStorage.setItem("amazonTokenExpiry", expiry.toString());
      localStorage.setItem("amazonTokenGeneratedAt", Date.now().toString());

      // =====================================================
      // REDIRECT TO SELLER LIST AFTER TOKEN - LIKE OLD FILE
      // =====================================================
      setTimeout(() => {
        navigate("/marketplaces/amazon/sellers");
      }, 1000);

    } catch (err) {
      if (err.response) {
        setError(JSON.stringify(err.response.data, null, 2));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAVE TO DB - LIKE YOUR OLD FILE
  const saveToDB = async () => {
    if (!accessToken) {
      alert("Generate token first!");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      const payload = {
        access_token: accessToken,
        refresh_token: localStorage.getItem("amazonRefreshToken") || refreshToken,
        token_type: "bearer",
        expires_in: expiresIn || 3600
      };

      const response = await axios.post(
        `${NODE_API}/amazon/tokens/save`,
        payload
      );

      setSaveMessage(`✅ Saved! TokenID: ${response.data.tokenId} | ${response.data.message}`);
    } catch (err) {
      setSaveMessage(`❌ Failed to save to DB: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <h2 style={{ margin: "0 0 12px 0" }}>Amazon SP-API - Token Generator - Real</h2>
      <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
        .env REACT_APP_AMAZON_CLIENT_ID → Generate LWA Access Token → SP-API → Save to DB → Sellerlist
      </p>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Client ID * (REACT_APP_AMAZON_CLIENT_ID)</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", marginTop: 4, fontSize: 12, fontFamily: "monospace", background: "#fffbeb" }}
              placeholder="amzn1.application-oa2-client..."
            />
            <span style={{ fontSize: 9, color: "#6b7280" }}>from: process.env.REACT_APP_AMAZON_CLIENT_ID</span>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Client Secret * (REACT_APP_AMAZON_CLIENT_SECRET)</label>
            <input
              type="text"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", marginTop: 4, fontSize: 12, background: "#fffbeb" }}
              placeholder="amzn1.oa2-cs.v1..."
            />
            <span style={{ fontSize: 9, color: "#6b7280" }}>from: process.env.REACT_APP_AMAZON_CLIENT_SECRET</span>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Refresh Token * (REACT_APP_AMAZON_REFRESH_TOKEN)</label>
            <textarea
              rows={4}
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", marginTop: 4, fontSize: 11, fontFamily: "monospace", background: "#fffbeb" }}
              placeholder="Atzr|IwEBI..."
            />
            <span style={{ fontSize: 9, color: "#6b7280" }}>from: process.env.REACT_APP_AMAZON_REFRESH_TOKEN</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button
            onClick={generateToken}
            disabled={loading}
            style={{ background: loading ? "#999" : "#FF9900", color: "#000", border: "none", padding: "12px 20px", borderRadius: 6, fontWeight: 800, cursor: "pointer" }}
          >
            {loading ? "Generating..." : "🚀 Generate Access Token"}
          </button>
          <button
            onClick={() => window.location.href = "/marketplaces"}
            style={{ background: "#fff", border: "1px solid #d1d5db", padding: "10px 16px", borderRadius: 6, cursor: "pointer" }}
          >
            ← Marketplace
          </button>
        </div>
      </div>

      {accessToken && (
        <div style={{ background: "#fff", border: "2px solid #16a34a", borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}>✅ SP-API ACCESS TOKEN - Ready for CreateListing - Saved to amazonAccessToken - Expires {expiresIn}s</div>
          <textarea
            rows={6}
            value={accessToken}
            readOnly
            style={{ width: "100%", marginTop: 8, fontFamily: "monospace", fontSize: 10, padding: 8, borderRadius: 6, background: "#f0fdf4", border: "1px solid #16a34a" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => navigator.clipboard.writeText(accessToken)}
              style={{ padding: "8px 14px", fontSize: 11, borderRadius: 4, border: "1px solid #16a34a", cursor: "pointer", background: "#f0fdf4", fontWeight: 600 }}
            >
              Copy Token
            </button>
            <button
              onClick={saveToDB}
              disabled={saving}
              style={{ padding: "8px 14px", background: "#FF9900", color: "#000", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 11 }}
            >
              {saving ? "Saving to SQL Server..." : "💾 Save to DB"}
            </button>
            <button
              onClick={() => navigate("/marketplaces/amazon/sellers")}
              style={{ padding: "8px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 11 }}
            >
              → Go to Sellerlist
            </button>
            <button
              onClick={() => navigate("/marketplaces/amazon/listings/create?sellerId=5&customerId=2")}
              style={{ padding: "8px 14px", background: "#146eb4", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 11 }}
            >
              → Seller 5 Customer 2 Listing
            </button>
          </div>

          {saveMessage && (
            <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: saveMessage.includes("✅") ? "#d4edda" : "#f8d7da", fontSize: 12 }}>
              {saveMessage}
            </div>
          )}
        </div>
      )}

      {success && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: 10, borderRadius: 6, fontSize: 12, marginBottom: 12 }}>{success} - Redirecting to Sellerlist...</div>}
      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: 10, borderRadius: 6, fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>❌ {error}</div>}

      <div style={{ marginTop: 16, fontSize: 11, color: "#6b7280", background: "#f9fafb", padding: 10, borderRadius: 6 }}>
        <b>.env file:</b> <br />
        REACT_APP_AMAZON_CLIENT_ID=amzn1.application-oa2-client...<br />
        REACT_APP_AMAZON_CLIENT_SECRET=amzn1.oa2-cs.v1...<br />
        REACT_APP_AMAZON_REFRESH_TOKEN=Atzr|IwEBI...
      </div>
    </div>
  );
};

export default TokenGenerator;