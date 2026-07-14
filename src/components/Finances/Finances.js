import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";
import ErrorDisplay from "../Common/ErrorDisplay";

const Finances = () => {
  const [accessToken, setAccessToken] = useState("");
  const [postedAfter, setPostedAfter] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const tabs = [
    { id: "summary", label: "Summary", icon: "📊" },
    { id: "shipment", label: "Shipments", icon: "📦" },
    { id: "refund", label: "Refunds", icon: "🔄" },
    { id: "servicefee", label: "Service Fees", icon: "💰" },
    { id: "chargeback", label: "Chargebacks", icon: "⚠️" },
    { id: "adjustment", label: "Adjustments", icon: "🔧" },
    { id: "coupon", label: "Coupons", icon: "🎟️" },
    { id: "safet", label: "SAFE-T Claims", icon: "🛡️" },
    { id: "raw", label: "Raw JSON", icon: "🧾" },
  ];

  const calculateSummary = (events) => {
    let totalSales = 0, totalFees = 0, totalRefunds = 0, totalCoupons = 0, totalAdjustments = 0;

    events.ShipmentEventList?.forEach(e => {
      e.ShipmentItemList?.forEach(i => {
        i.ItemChargeList?.forEach(c => totalSales += parseFloat(c.ChargeAmount?.Amount || 0));
        i.ItemFeeList?.forEach(f => totalFees += parseFloat(f.FeeAmount?.Amount || 0));
        i.PromotionList?.forEach(p => totalCoupons += parseFloat(p.PromotionAmount?.Amount || 0));
      });
    });

    events.RefundEventList?.forEach(e => {
      e.ShipmentItemAdjustmentList?.forEach(i => {
        i.ItemChargeAdjustments?.forEach(c => totalRefunds += parseFloat(c.ChargeAmount?.Amount || 0));
      });
    });

    events.AdjustmentEventList?.forEach(e => {
      totalAdjustments += parseFloat(e.AdjustmentAmount?.Amount || 0);
    });

    const net = totalSales + totalFees + totalRefunds + totalCoupons + totalAdjustments;

    return { totalSales, totalFees, totalRefunds, totalCoupons, totalAdjustments, net };
  };

  const getFinancialEvents = useCallback(async () => {
    if (!accessToken) return setError({ message: "Access token is required" });

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/api/finances/events", {
        accessToken, awsAccessKey, awsSecretKey, region, environment, postedAfter
      });

      const events = res.data.payload?.FinancialEvents || {};
      setResult({
        raw: res.data,
        events,
        summary: calculateSummary(events)
      });
    } catch (err) {
      setError(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, awsAccessKey, awsSecretKey, region, environment, postedAfter]);

  const renderTabContent = () => {
    if (!result) return null;
    const { events, summary } = result;

    if (activeTab === "summary") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Gross Sales", value: summary.totalSales, color: "text-blue-600" },
            { title: "Amazon Fees", value: summary.totalFees, color: "text-red-600" },
            { title: "Refunds", value: summary.totalRefunds, color: "text-orange-600" },
            { title: "Coupons", value: summary.totalCoupons, color: "text-purple-600" },
            { title: "Adjustments", value: summary.totalAdjustments, color: "text-amber-600" },
            { title: "Net Payout", value: summary.net, color: "text-emerald-600", isNet: true },
          ].map((item, i) => (
            <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all ${item.isNet ? 'ring-2 ring-emerald-200' : ''}`}>
              <p className="text-gray-500 text-sm">{item.title}</p>
              <h3 className={`text-4xl font-bold mt-3 ${item.color}`}>
                ${item.value.toFixed(2)}
              </h3>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "raw") {
      return (
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-2xl overflow-auto max-h-[600px] text-sm">
          {JSON.stringify(result.raw, null, 2)}
        </pre>
      );
    }

    const eventKeyMap = {
      shipment: "ShipmentEventList",
      refund: "RefundEventList",
      servicefee: "ServiceFeeEventList",
      chargeback: "ChargebackEventList",
      adjustment: "AdjustmentEventList",
      coupon: "CouponPaymentEventList",
      safet: "SAFETReimbursementEventList",
    };

    const data = events[eventKeyMap[activeTab]] || [];

    return (
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
          {tabs.find(t => t.id === activeTab).icon} {tabs.find(t => t.id === activeTab).label}
          <span className="text-sm font-normal text-gray-500">({data.length} events)</span>
        </h3>
        <pre className="bg-gray-50 p-6 rounded-2xl overflow-auto max-h-[600px] text-sm border border-gray-200">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Amazon Finances</h1>
           <p className="text-gray-600 mt-2 text-lg">It's a financial reporting tool for Amazon sellers to see their real earnings, fees, and payouts in one clean interface.</p>
          <p className="text-gray-600 mt-2 text-lg">Track your sales, fees, refunds &amp; true profit</p>
        </div>

        <AmazonTokenGenerator
          accessToken={accessToken}
          setAccessToken={setAccessToken}
          awsAccessKey={awsAccessKey}
          setAwsAccessKey={setAwsAccessKey}
          awsSecretKey={awsSecretKey}
          setAwsSecretKey={setAwsSecretKey}
          region={region}
          setRegion={setRegion}
          environment={environment}
          setEnvironment={setEnvironment}
        />

        <div className="bg-white rounded-3xl shadow-sm p-8 mt-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input
              type="datetime-local"
              value={postedAfter}
              onChange={(e) => setPostedAfter(e.target.value)}
              className="flex-1 px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={getFinancialEvents}
              disabled={loading || !accessToken}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg"
            >
              {loading ? "Fetching Data..." : "Get Financial Events"}
            </button>
          </div>

          <ErrorDisplay error={error} onClose={() => setError(null)} />

          {result && (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2 mb-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                {renderTabContent()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finances;