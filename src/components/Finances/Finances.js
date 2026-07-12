import React, { useState } from "react";
import axios from "axios";
import AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";

import ErrorDisplay from "../Common/ErrorDisplay";

const Finances = ({ 
  accessToken, setAccessToken, 
  awsAccessKey, setAwsAccessKey, 
  awsSecretKey, setAwsSecretKey, 
  region, setRegion, 
  environment, setEnvironment 
}) => {
  const [postedAfter, setPostedAfter] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "shipment", label: "Shipment Events" },
    { id: "refund", label: "Refund Events" },
    { id: "servicefee", label: "Service Fees" },
    { id: "chargeback", label: "Chargebacks" },
    { id: "adjustment", label: "Adjustments" },
    { id: "coupon", label: "Coupons" },
    { id: "safet", label: "SAFE-T Claims" },
    { id: "raw", label: "Raw JSON" }
  ];

  const getFinancialEvents = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    console.log({
  accessToken,
  awsAccessKey,
  awsSecretKey,
  region,
  environment
});
    try {
      const res = await axios.post("http://localhost:5000/api/finances/events", {
        accessToken, awsAccessKey, awsSecretKey, region, environment, postedAfter
      });
      
      const events = res.data.payload.FinancialEvents;
      
      // Calculate summary
      let totalSales = 0, totalFees = 0, totalRefunds = 0, totalCoupons = 0, totalAdjustments = 0;
      
      events.ShipmentEventList?.forEach(e => {
        e.ShipmentItemList?.forEach(i => {
          i.ItemChargeList?.forEach(c => totalSales += parseFloat(c.ChargeAmount.Amount));
          i.ItemFeeList?.forEach(f => totalFees += parseFloat(f.FeeAmount.Amount));
          i.PromotionList?.forEach(p => totalCoupons += parseFloat(p.PromotionAmount.Amount));
        });
      });
      
      events.RefundEventList?.forEach(e => {
        e.ShipmentItemAdjustmentList?.forEach(i => {
          i.ItemChargeAdjustments?.forEach(c => totalRefunds += parseFloat(c.ChargeAmount.Amount));
        });
      });

      events.AdjustmentEventList?.forEach(e => {
        totalAdjustments += parseFloat(e.AdjustmentAmount.Amount);
      });

      setResult({ 
        raw: res.data,
        events,
        summary: { 
          totalSales, 
          totalFees, 
          totalRefunds, 
          totalCoupons,
          totalAdjustments,
          net: totalSales + totalFees + totalRefunds + totalCoupons + totalAdjustments
        } 
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (!result) return null;
    const { events, summary } = result;

    switch(activeTab) {
      case "summary":
        return (
          <>
            <h3>Financial Summary</h3>
            <div style={styles.kpiRow}>
              <div style={styles.kpi}><h4>${summary.totalSales.toFixed(2)}</h4><p>Gross Sales</p></div>
              <div style={styles.kpi}><h4>${summary.totalFees.toFixed(2)}</h4><p>Amazon Fees</p></div>
              <div style={styles.kpi}><h4>${summary.totalRefunds.toFixed(2)}</h4><p>Refunds</p></div>
              <div style={styles.kpi}><h4>${summary.totalCoupons.toFixed(2)}</h4><p>Coupons</p></div>
              <div style={styles.kpi}><h4>${summary.totalAdjustments.toFixed(2)}</h4><p>Adjustments</p></div>
              <div style={{...styles.kpi, ...styles.kpiNet}}><h4>${summary.net.toFixed(2)}</h4><p>Net Payout</p></div>
            </div>
          </>
        );
      
      case "shipment":
        return (
          <>
            <h3>Shipment Events - {events.ShipmentEventList?.length || 0} events</h3>
            <pre style={styles.pre}>{JSON.stringify(events.ShipmentEventList || [], null, 2)}</pre>
          </>
        );
      
      case "refund":
        return (
          <>
            <h3>Refund Events - {events.RefundEventList?.length || 0} events</h3>
            <pre style={styles.pre}>{JSON.stringify(events.RefundEventList || [], null, 2)}</pre>
          </>
        );
      
      case "servicefee":
        return (
          <>
            <h3>Service Fee Events - {events.ServiceFeeEventList?.length || 0} events</h3>
            <pre style={styles.pre}>{JSON.stringify(events.ServiceFeeEventList || [], null, 2)}</pre>
          </>
        );
      
      case "chargeback":
        return (
          <>
            <h3>Chargeback Events - {events.ChargebackEventList?.length || 0} events</h3>
            <pre style={styles.pre}>{JSON.stringify(events.ChargebackEventList || [], null, 2)}</pre>
          </>
        );
      
      case "adjustment":
        return (
          <>
            <h3>Adjustment Events - {events.AdjustmentEventList?.length || 0} events</h3>
            <pre style={styles.pre}>{JSON.stringify(events.AdjustmentEventList || [], null, 2)}</pre>
          </>
        );
      
      case "coupon":
        return (
          <>
            <h3>Coupon Events - {events.CouponPaymentEventList?.length || 0} events</h3>
            <pre style={styles.pre}>{JSON.stringify(events.CouponPaymentEventList || [], null, 2)}</pre>
          </>
        );
      
      case "safet":
        return (
          <>
            <h3>SAFE-T Claims - {events.SAFETReimbursementEventList?.length || 0} events</h3>
            <pre style={styles.pre}>{JSON.stringify(events.SAFETReimbursementEventList || [], null, 2)}</pre>
          </>
        );
      
      case "raw":
        return (
          <>
            <h3>Raw JSON Response</h3>
            <pre style={styles.pre}>{JSON.stringify(result.raw, null, 2)}</pre>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <h2>Finances API - Financial Events</h2>
      <p>Get real payouts, fees, refunds. True profit calculation.</p>
      
      <AmazonTokenGenerator 
        accessToken={accessToken} setAccessToken={setAccessToken}
        awsAccessKey={awsAccessKey} setAwsAccessKey={setAwsAccessKey}
        awsSecretKey={awsSecretKey} setAwsSecretKey={setAwsSecretKey}
        region={region} setRegion={setRegion}
        environment={environment} setEnvironment={setEnvironment}
      />
      
      <input 
        type="datetime-local" 
        placeholder="Posted After" 
        value={postedAfter} 
        onChange={e => setPostedAfter(e.target.value)} 
        style={styles.input} 
      />
      <button onClick={getFinancialEvents} disabled={loading} style={styles.button}>
        {loading ? "Loading..." : "Get Financial Events"}
      </button>

      <ErrorDisplay error={error} onClose={() => setError(null)} />
      
      {result && (
        <>
          <div style={styles.tabBar}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : {})
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={styles.tabContent}>
            {renderTabContent()}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { width: '100%' },
  input: { width: "100%", marginBottom: 15, padding: 10, fontSize: 15, border: '1px solid #cbd5e1', borderRadius: 6 },
  button: { background: "#146eb4", color: "#fff", border: "none", padding: "12px 25px", cursor: "pointer", fontSize: 16, borderRadius: 5, marginBottom: 20 },
  kpiRow: { display: 'flex', gap: '15px', margin: '20px 0', flexWrap: 'wrap' },
  kpi: { flex: '1 1 160px', padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  kpiNet: { background: '#dcfce7', border: '1px solid #86efac' },
  pre: { background: '#f1f5f9', padding: 15, borderRadius: 6, overflow: 'auto', fontSize: 11, maxHeight: 500 },
  tabBar: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e2e8f0', flexWrap: 'wrap' },
  tab: { padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: '#146eb4', borderBottom: '2px solid #146eb4', fontWeight: 600 },
  tabContent: { minHeight: 300 }
};

export default Finances;