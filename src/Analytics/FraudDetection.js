import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, ShieldAlert, AlertCircle, DollarSign } from 'lucide-react';

const API_BASE_URL = '/api';

const FraudDetection = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFraudData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/fraud-detection`);
      setTransactions(response.data.transactions || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load fraud detection data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudData();
  }, []);

  const getRiskBadge = (score) => {
    if (score > 0.8) return { label: 'High', class: 'bg-red-100 text-red-700' };
    if (score > 0.5) return { label: 'Medium', class: 'bg-amber-100 text-amber-700' };
    return { label: 'Low', class: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Fraud Detection</h2>
          <p className="text-gray-600">Isolation Forest Anomaly Detection</p>
        </div>
        <button
          onClick={fetchFraudData}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-gray-500 text-sm">Flagged Transactions</p>
              <p className="text-4xl font-bold text-red-600">{summary.flagged_count?.toLocaleString() || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Amount at Risk</p>
          <p className="text-4xl font-bold mt-3">₹{summary.amount_at_risk?.toLocaleString() || '—'}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Avg Anomaly Score</p>
          <p className="text-4xl font-bold mt-3">{summary.avg_anomaly_score?.toFixed(3) || '—'}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b font-semibold">Suspicious Transactions</div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Running Isolation Forest...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Transaction ID</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Anomaly Score</th>
                  <th className="text-left p-4">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const risk = getRiskBadge(tx.anomaly_score);
                  return (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-mono">{tx.transaction_id}</td>
                      <td className="p-4">{tx.customer}</td>
                      <td className="p-4 font-semibold">₹{tx.amount?.toLocaleString()}</td>
                      <td className="p-4">{tx.anomaly_score?.toFixed(3)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${risk.class}`}>
                          {risk.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudDetection;