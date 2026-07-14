import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";
import ErrorDisplay from "../Common/ErrorDisplay";

/* ===========================================================
   Finance Tabs Configuration
=========================================================== */
const FINANCE_TABS = [
  { id: "summary", label: "Summary Dashboard", icon: "📊" },
  { id: "shipment", label: "Shipments", icon: "📦" },
  { id: "refund", label: "Refunds", icon: "🔄" },
  { id: "servicefee", label: "Service Fees", icon: "💰" },
  { id: "chargeback", label: "Chargebacks", icon: "⚠️" },
  { id: "adjustment", label: "Adjustments", icon: "🔧" },
  { id: "coupon", label: "Coupons", icon: "🎟️" },
  { id: "safet", label: "SAFE-T Claims", icon: "🛡️" },
  { id: "raw", label: "Raw Developer JSON", icon: "🧾" },
];

const EVENT_MAPPING = {
  shipment: "ShipmentEventList",
  refund: "RefundEventList",
  servicefee: "ServiceFeeEventList",
  chargeback: "ChargebackEventList",
  adjustment: "AdjustmentEventList",
  coupon: "CouponPaymentEventList",
  safet: "SAFETReimbursementEventList",
};

/* ===========================================================
   Component Definition
=========================================================== */
const Finances = () => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("amazonAccessToken") || "");
  const [awsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");

  const [postedAfter, setPostedAfter] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /* ===========================================================
      Calculation Logic (Aggregations)
     =========================================================== */
  const calculateSummary = useCallback((financialEvents) => {
    let grossSales = 0;
    let amazonFees = 0;
    let refunds = 0;
    let coupons = 0;
    let adjustments = 0;

    financialEvents.ShipmentEventList?.forEach((shipment) => {
      shipment.ShipmentItemList?.forEach((item) => {
        item.ItemChargeList?.forEach((charge) => {
          grossSales += Number(charge.ChargeAmount?.Amount || 0);
        });
        item.ItemFeeList?.forEach((fee) => {
          amazonFees += Number(fee.FeeAmount?.Amount || 0);
        });
        item.PromotionList?.forEach((promotion) => {
          coupons += Number(promotion.PromotionAmount?.Amount || 0);
        });
      });
    });

    financialEvents.RefundEventList?.forEach((refundEvent) => {
      refundEvent.ShipmentItemAdjustmentList?.forEach((item) => {
        item.ItemChargeAdjustments?.forEach((charge) => {
          refunds += Number(charge.ChargeAmount?.Amount || 0);
        });
      });
    });

    financialEvents.AdjustmentEventList?.forEach((adjustment) => {
      adjustments += Number(adjustment.AdjustmentAmount?.Amount || 0);
    });

    return {
      grossSales,
      amazonFees,
      refunds,
      coupons,
      adjustments,
      netPayout: grossSales + amazonFees + refunds + coupons + adjustments,
    };
  }, []);

  /* ===========================================================
      API Client Request
     =========================================================== */
  const fetchFinancialEvents = useCallback(async () => {
  // 1. Guard clause: Check for the token first before running any calculations
  if (!accessToken) {
    return setError({ message: "Amazon Access Token is required. Please authenticate above." });
  }

  setLoading(true);
  setError(null);
  setResult(null);

  // 2. Format dates: Calculate fallbacks and parse only once
  let formattedPostedAfter;
  if (postedAfter) {
    formattedPostedAfter = new Date(postedAfter).toISOString();
  } else {
    // Fallback to 7 days ago if empty
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    formattedPostedAfter = sevenDaysAgo.toISOString();
  }

  try {
    const response = await axios.post("http://localhost:5000/api/finances/events", {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      environment,
      postedAfter: formattedPostedAfter, // Using the cleanly formatted date variable
    });

    const financialEvents = response.data.payload?.FinancialEvents || {};

    setResult({
      raw: response.data,
      events: financialEvents,
      summary: calculateSummary(financialEvents),
    });
  } catch (err) {
    // Extract the most readable message possible from the server response
    const errorMessage = 
      err.response?.data?.message || 
      err.response?.data?.error || 
      err.message || 
      "An unexpected network error occurred.";

    setError({ message: errorMessage });
  } finally {
    setLoading(false);
  }
}, [accessToken, awsAccessKey, awsSecretKey, region, environment, postedAfter, calculateSummary]);
  /* ===========================================================
      Sub-Views (Granular UI Tables & Lists)
     =========================================================== */

  // 1. Shipments View
  const renderShipments = (shipments) => {
    if (!shipments || shipments.length === 0) return <EmptyState label="Shipments" />;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="p-4">Order ID / Date</th>
              <th className="p-4">Items / SKU</th>
              <th className="p-4 text-right">Charges</th>
              <th className="p-4 text-right">Fees Deducted</th>
              <th className="p-4 text-right">Promos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 text-sm">
            {shipments.map((ship, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="p-4 align-top">
                  <span className="font-semibold text-gray-900 block">{ship.AmazonOrderId}</span>
                  <span className="text-xs text-gray-500">{new Date(ship.PostedDate).toLocaleDateString()}</span>
                </td>
                <td className="p-4 align-top">
                  {ship.ShipmentItemList?.map((item, itemIdx) => (
                    <div key={itemIdx} className="mb-2 last:mb-0">
                      <span className="font-medium text-gray-800 block">{item.ItemChargeList?.[0]?.ChargeType || "Product Sales"}</span>
                      <span className="text-xs text-gray-400">SKU: {item.SellerSKU} | Qty: {item.QuantityShipped}</span>
                    </div>
                  ))}
                </td>
                <td className="p-4 text-right align-top text-green-600 font-medium">
                  ${ship.ShipmentItemList?.reduce((sum, item) => sum + item.ItemChargeList?.reduce((subSum, charge) => subSum + Number(charge.ChargeAmount?.Amount || 0), 0), 0).toFixed(2)}
                </td>
                <td className="p-4 text-right align-top text-red-500">
                  ${ship.ShipmentItemList?.reduce((sum, item) => sum + item.ItemFeeList?.reduce((subSum, fee) => subSum + Number(fee.FeeAmount?.Amount || 0), 0), 0).toFixed(2)}
                </td>
                <td className="p-4 text-right align-top text-purple-600">
                  ${ship.ShipmentItemList?.reduce((sum, item) => sum + item.PromotionList?.reduce((subSum, promo) => subSum + Number(promo.PromotionAmount?.Amount || 0), 0), 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 2. Refunds View
  const renderRefunds = (refunds) => {
    if (!refunds || refunds.length === 0) return <EmptyState label="Refunds" />;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="p-4">Refund ID / Date</th>
              <th className="p-4">Adjusted Item (SKU)</th>
              <th className="p-4 text-right">Refund Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 text-sm">
            {refunds.map((ref, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-4">
                  <span className="font-semibold text-gray-900 block">{ref.AmazonOrderId}</span>
                  <span className="text-xs text-gray-500">{new Date(ref.PostedDate).toLocaleDateString()}</span>
                </td>
                <td className="p-4 text-gray-700">
                  {ref.ShipmentItemAdjustmentList?.map((item, itemIdx) => (
                    <div key={itemIdx}>
                      <span>{item.SellerSKU}</span>
                      <span className="text-xs text-gray-400 block">Qty Refunded: {item.QuantityShipped}</span>
                    </div>
                  ))}
                </td>
                <td className="p-4 text-right font-medium text-orange-600">
                  ${ref.ShipmentItemAdjustmentList?.reduce((sum, item) => sum + item.ItemChargeAdjustments?.reduce((subSum, charge) => subSum + Number(charge.ChargeAmount?.Amount || 0), 0), 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 3. Service Fees View
  const renderServiceFees = (fees) => {
    if (!fees || fees.length === 0) return <EmptyState label="Service Fees" />;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fees.map((fee, idx) => (
          <div key={idx} className="border border-gray-200 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold uppercase">
                  {fee.FeeReason || "General Fee"}
                </span>
                <span className="text-xs text-gray-400">{new Date(fee.PostedDate).toLocaleDateString()}</span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-1">{fee.SellerSKU || "Non-SKU Fee"}</h4>
              <p className="text-sm text-gray-500">Seller Merchant Group ID: {fee.FeeGroup || "N/A"}</p>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Charged Fee</span>
              <span className="text-xl font-bold text-red-500">${Number(fee.FeeAmount?.Amount || 0).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 4. Chargebacks View
  const renderChargebacks = (chargebacks) => {
    if (!chargebacks || chargebacks.length === 0) return <EmptyState label="Chargebacks" icon="🛡️" />;
    return (
      <div className="space-y-4">
        {chargebacks.map((cb, idx) => (
          <div key={idx} className="border border-red-100 bg-red-50/30 p-6 rounded-2xl flex justify-between items-start">
            <div>
              <h4 className="font-bold text-red-900 text-lg flex items-center gap-2">
                ⚠️ Chargeback Event
              </h4>
              <p className="text-sm text-gray-600 mt-1">Order ID Reference: <span className="font-mono">{cb.AmazonOrderId}</span></p>
              <p className="text-xs text-gray-400 mt-2">Posted on: {new Date(cb.PostedDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-red-700 bg-red-100 font-semibold px-2.5 py-1 rounded-full uppercase">Under Dispute</span>
              <h3 className="text-2xl font-black text-red-600 mt-3">-${Math.abs(cb.ChargebackAmount?.Amount || 0).toFixed(2)}</h3>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 5. Adjustments View
  const renderAdjustments = (adjustments) => {
    if (!adjustments || adjustments.length === 0) return <EmptyState label="Adjustments" />;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="p-4">Type</th>
              <th className="p-4">Posted Date</th>
              <th className="p-4 text-right">Adjustment Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 text-sm">
            {adjustments.map((adj, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-800">
                  {adj.AdjustmentType || "Inventory/Fulfillment adjustment"}
                </td>
                <td className="p-4 text-gray-500">
                  {new Date(adj.PostedDate).toLocaleDateString()}
                </td>
                <td className={`p-4 text-right font-medium ${Number(adj.AdjustmentAmount?.Amount) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${Number(adj.AdjustmentAmount?.Amount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 6. Coupons View
  const renderCoupons = (coupons) => {
    if (!coupons || coupons.length === 0) return <EmptyState label="Coupons" />;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon, idx) => (
          <div key={idx} className="bg-white border-2 border-dashed border-purple-200 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
              COUPON USED
            </div>
            <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">Promo ID: {coupon.SellerCouponId}</p>
            <h3 className="text-xl font-bold text-gray-800 mt-2 mb-4">{coupon.CouponId}</h3>
            <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100">
              <span className="text-gray-500">Redemption Discount</span>
              <span className="font-extrabold text-purple-700">${Number(coupon.CouponPaymentAmount?.Amount || 0).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 7. SAFE-T Claims View
  const renderSafetClaims = (claims) => {
    if (!claims || claims.length === 0) return <EmptyState label="SAFE-T Claims" />;
    return (
      <div className="space-y-4">
        {claims.map((claim, idx) => (
          <div key={idx} className="border border-emerald-100 bg-emerald-50/20 p-6 rounded-2xl flex justify-between items-center">
            <div>
              <h4 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
                🛡️ SAFE-T Claim Reimbursement
              </h4>
              <p className="text-xs text-gray-500 mt-1">Case ID: {claim.SAFETClaimId || "Pending ID"}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-800 bg-emerald-100 font-semibold px-3 py-1 rounded-full uppercase">Approved</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-2">+${Number(claim.ReimbursedAmount?.Amount || 0).toFixed(2)}</h3>
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ===========================================================
      Master Switcher logic for Content Tabs
     =========================================================== */
  const renderTabContent = () => {
    if (!result) return null;

    const { events, summary } = result;

    switch (activeTab) {
      case "summary":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Gross Sales", value: summary.grossSales, color: "text-blue-600" },
              { title: "Amazon Fees", value: summary.amazonFees, color: "text-red-600" },
              { title: "Refunds Issued", value: summary.refunds, color: "text-orange-600" },
              { title: "Coupons Reinstated", value: summary.coupons, color: "text-purple-600" },
              { title: "Adjustments Amount", value: summary.adjustments, color: "text-amber-600" },
              { title: "Calculated Net Payout", value: summary.netPayout, color: "text-emerald-600", highlight: true },
            ].map((card) => (
              <div
                key={card.title}
                className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md ${
                  card.highlight ? "ring-2 ring-emerald-400 bg-emerald-50/20" : ""
                }`}
              >
                <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">{card.title}</p>
                <h2 className={`text-4xl font-extrabold mt-3 tracking-tight ${card.color}`}>
                  ${Number(card.value).toFixed(2)}
                </h2>
              </div>
            ))}
          </div>
        );

      case "shipment":
        return renderShipments(events.ShipmentEventList);
      case "refund":
        return renderRefunds(events.RefundEventList);
      case "servicefee":
        return renderServiceFees(events.ServiceFeeEventList);
      case "chargeback":
        return renderChargebacks(events.ChargebackEventList);
      case "adjustment":
        return renderAdjustments(events.AdjustmentEventList);
      case "coupon":
        return renderCoupons(events.CouponPaymentEventList);
      case "safet":
        return renderSafetClaims(events.SAFETReimbursementEventList);
      case "raw":
        return (
          <pre className="bg-gray-900 text-gray-100 p-6 rounded-2xl overflow-auto max-h-[600px] text-xs font-mono">
            {JSON.stringify(result.raw, null, 2)}
          </pre>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Authentication Widget Hook */}
        <AmazonTokenGenerator onTokenSet={(token) => setAccessToken(token)} />

        {/* Global Page Header */}
        <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 text-white rounded-3xl p-8 md:p-12 shadow-xl shadow-blue-500/10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
            📊 Amazon Seller Finances
          </h1>
          <p className="mt-4 text-blue-100 text-base md:text-lg max-w-2xl font-light">
            Real-time interactive dashboard tracking shipments, refunds, fees, coupons, 
            and adjustments processed from your Amazon Seller Central Account.
          </p>
        </div>

        {/* Search Filter Controls Panel */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>⚙️</span> Filter Financial Posting Window
          </h2>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Posted After Datetime
              </label>
              <input
                type="datetime-local"
                value={postedAfter}
                onChange={(e) => setPostedAfter(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchFinancialEvents}
                disabled={loading || !accessToken}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/15 transition-all transform active:scale-[0.98]"
              >
                {loading ? "Accessing Records..." : "Load Financial Statements"}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <ErrorDisplay error={error} onClose={() => setError(null)} />
          </div>

          {/* Render Tab UI elements only when records have loaded */}
          {result && (
            <div className="mt-12 space-y-8">
              {/* Navigation Tabs bar */}
              <div className="flex gap-2 overflow-x-auto pb-4 border-b border-gray-150">
                {FINANCE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Content Frame */}
              <div className="min-h-[400px]">
                {renderTabContent()}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ===========================================================
   Reusable Sub-components / Utilities
   =========================================================== */
const EmptyState = ({ label, icon = "📦" }) => (
  <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-3xl">
    <span className="text-5xl block mb-4">{icon}</span>
    <h3 className="text-lg font-bold text-gray-800">No {label} Registered</h3>
    <p className="text-gray-400 text-sm mt-1">There are no financial records found under {label} matching the filtered timeframe.</p>
  </div>
);

export default Finances;